using DCE.Api.Data;
using DCE.Api.Exceptions;
using DCE.Api.Models;
using DCE.Api.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace DCE.Api.Services;

/// <summary>Regras de negócio das fichas de detentos, calculadora penal e disciplina.</summary>
public class DetentoService
{
    /// <summary>Convenção adotada para converter meses em dias na previsão de soltura.</summary>
    public const int DiasPorMes = 30;

    private readonly DceDbContext _db;
    private readonly AuditoriaService _auditoria;

    public DetentoService(DceDbContext db, AuditoriaService auditoria)
    {
        _db = db;
        _auditoria = auditoria;
    }

    /// <summary>Resultado do cálculo do código penal para os artigos selecionados.</summary>
    public record PenalResult(
        List<CrimeCometido> Crimes,
        int TempoTotal,
        decimal MultaTotal,
        bool ExigeTornozeleira,
        bool PermiteFianca,
        DateTime PrevisaoSoltura);

    /// <summary>Calculadora do código penal (mesma regra espelhada no frontend).</summary>
    public static PenalResult Calcular(IReadOnlyCollection<CodigoPenalArtigo> artigos, DateTime dataEntrada)
    {
        var crimes = artigos.Select(a => new CrimeCometido
        {
            ArtigoId = a.Id,
            Artigo = a.Artigo,
            Crime = a.Crime,
            TempoMeses = a.TempoMeses,
            ValorMulta = a.ValorMulta,
            ValorFianca = a.ValorFianca,
            Tornozeleira = a.Tornozeleira,
            PermiteFianca = a.PermiteFianca,
        }).ToList();

        var tempo = crimes.Sum(c => c.TempoMeses);

        return new PenalResult(
            crimes,
            tempo,
            crimes.Sum(c => c.ValorMulta),
            crimes.Any(c => c.Tornozeleira),
            crimes.All(c => c.PermiteFianca),
            dataEntrada.AddDays(tempo * DiasPorMes));
    }

    private IQueryable<Detento> ComRelacionamentos() =>
        _db.Detentos
            .Include(d => d.OficialRegistrou)
            .Include(d => d.Historicos);

    // -------------------------------- Consultas --------------------------------

    public async Task<List<DetentoDto>> ListarAsync(string? busca)
    {
        var termo = (busca ?? string.Empty).Trim().ToLowerInvariant();

        var lista = await ComRelacionamentos()
            .Where(d => termo == ""
                        || d.NomeDetento.ToLower().Contains(termo)
                        || d.PassaporteDetento.Contains(termo))
            .ToListAsync();

        // Prioriza presos ativos na listagem.
        var ordem = new Dictionary<StatusPrisao, int>
        {
            [StatusPrisao.EmCustodia] = 0,
            [StatusPrisao.Foragido] = 1,
            [StatusPrisao.Liberado] = 2,
        };

        return lista
            .OrderBy(d => ordem[d.StatusPrisao])
            .ThenByDescending(d => d.DataEntrada)
            .Select(DtoMapper.ParaDto)
            .ToList();
    }

    public async Task<DetentoDto?> ObterAsync(int id)
    {
        var d = await ComRelacionamentos().FirstOrDefaultAsync(x => x.Id == id);
        return d is null ? null : DtoMapper.ParaDto(d);
    }

    // -------------------------------- Cadastro ---------------------------------

    public async Task<DetentoDto> CriarAsync(CriarDetentoRequest req, int oficialId, string oficialNome)
    {
        var artigos = await _db.CodigoPenal
            .Where(a => req.ArtigoIds.Contains(a.Id))
            .ToListAsync();

        if (artigos.Count == 0)
            throw AppException.Validacao("Selecione ao menos um artigo válido do código penal.");

        var entrada = DateTime.UtcNow;
        var calc = Calcular(artigos, entrada);

        var detento = new Detento
        {
            PassaporteDetento = req.PassaporteDetento.Trim(),
            NomeDetento = req.NomeDetento.Trim(),
            FotoUrl = string.IsNullOrWhiteSpace(req.FotoUrl) ? null : req.FotoUrl.Trim(),
            CrimesCometidos = calc.Crimes,
            TempoTotalMeses = calc.TempoTotal,
            ValorMultaTotal = calc.MultaTotal,
            ExigeTornozeleira = calc.ExigeTornozeleira,
            PermiteFianca = calc.PermiteFianca,
            StatusPrisao = StatusPrisao.EmCustodia,
            PolicialCondutor = string.IsNullOrWhiteSpace(req.PolicialCondutor) ? null : req.PolicialCondutor.Trim(),
            OficialRegistrouId = oficialId,
            DataEntrada = entrada,
            PrevisaoSoltura = calc.PrevisaoSoltura,
            NivelPericulosidade = req.NivelPericulosidade,
        };

        _db.Detentos.Add(detento);
        await _db.SaveChangesAsync();

        _auditoria.Registrar(oficialId, "CRIACAO_DETENTO", "detentos", detento.Id,
            $"Registrou a entrada de {detento.NomeDetento} (Passaporte {detento.PassaporteDetento}).");
        await _db.SaveChangesAsync();

        return await ObterAsync(detento.Id) ?? DtoMapper.ParaDto(detento);
    }

    public async Task<DetentoDto?> AtualizarAsync(int id, AtualizarDetentoRequest req, int oficialId)
    {
        var d = await ComRelacionamentos().FirstOrDefaultAsync(x => x.Id == id)
            ?? throw AppException.NaoEncontrado("Detento não encontrado.");

        if (req.NomeDetento is not null) d.NomeDetento = req.NomeDetento.Trim();
        if (req.PassaporteDetento is not null) d.PassaporteDetento = req.PassaporteDetento.Trim();
        if (req.FotoUrl is not null) d.FotoUrl = string.IsNullOrWhiteSpace(req.FotoUrl) ? null : req.FotoUrl.Trim();
        if (req.PolicialCondutor is not null)
            d.PolicialCondutor = string.IsNullOrWhiteSpace(req.PolicialCondutor) ? null : req.PolicialCondutor.Trim();
        if (req.NivelPericulosidade is not null) d.NivelPericulosidade = req.NivelPericulosidade;
        if (req.StatusPrisao is not null) d.StatusPrisao = req.StatusPrisao.Value;

        if (req.ArtigoIds is { Count: > 0 })
        {
            var artigos = await _db.CodigoPenal.Where(a => req.ArtigoIds.Contains(a.Id)).ToListAsync();
            if (artigos.Count == 0)
                throw AppException.Validacao("Nenhum artigo válido informado para recalcular a pena.");

            var calc = Calcular(artigos, d.DataEntrada);
            d.CrimesCometidos = calc.Crimes;
            d.TempoTotalMeses = calc.TempoTotal;
            d.ValorMultaTotal = calc.MultaTotal;
            d.ExigeTornozeleira = calc.ExigeTornozeleira;
            d.PermiteFianca = calc.PermiteFianca;
            d.PrevisaoSoltura = calc.PrevisaoSoltura;
        }

        await _db.SaveChangesAsync();
        _auditoria.Registrar(oficialId, "EDICAO_DETENTO", "detentos", d.Id, $"Editou a ficha de {d.NomeDetento}.");
        await _db.SaveChangesAsync();

        return DtoMapper.ParaDto(d);
    }

    public async Task<DetentoDto?> DarBaixaAsync(int id, string? motivo, int oficialId)
    {
        var d = await ComRelacionamentos().FirstOrDefaultAsync(x => x.Id == id)
            ?? throw AppException.NaoEncontrado("Detento não encontrado.");

        d.StatusPrisao = StatusPrisao.Liberado;

        await _db.SaveChangesAsync();
        _auditoria.Registrar(oficialId, "BAIXA_DETENTO", "detentos", d.Id,
            $"Concedeu liberdade a {d.NomeDetento}. Motivo: {(string.IsNullOrWhiteSpace(motivo) ? "não informado" : motivo)}");
        await _db.SaveChangesAsync();

        return DtoMapper.ParaDto(d);
    }

    public async Task ExcluirAsync(int id, int oficialId)
    {
        var d = await _db.Detentos.FirstOrDefaultAsync(x => x.Id == id)
            ?? throw AppException.NaoEncontrado("Detento não encontrado.");

        _db.Detentos.Remove(d);
        await _db.SaveChangesAsync();

        _auditoria.Registrar(oficialId, "EXCLUSAO_DETENTO", "detentos", id, $"Excluiu a ficha de {d.NomeDetento}.");
        await _db.SaveChangesAsync();
    }

    // --------------------- Comportamento / Solitária ---------------------------

    public async Task<HistoricoComportamentoDto?> RegistrarComportamentoAsync(
        int detentoId, RegistrarComportamentoRequest req, int oficialId, string oficialNome)
    {
        var d = await _db.Detentos.FirstOrDefaultAsync(x => x.Id == detentoId)
            ?? throw AppException.NaoEncontrado("Detento não encontrado.");

        var emSolitaria = req.TipoRegistro == TipoRegistro.Solitaria || req.EmSolitaria;

        var registro = new HistoricoComportamento
        {
            DetentoId = detentoId,
            TipoRegistro = req.TipoRegistro,
            NivelPericulosidade = req.NivelPericulosidade,
            EmSolitaria = emSolitaria,
            MotivoSolitaria = emSolitaria ? req.MotivoSolitaria : null,
            TerminoSolitaria = emSolitaria ? req.TerminoSolitaria : null,
            Descricao = req.Descricao,
            OficialResponsavelId = oficialId,
            CriadoEm = DateTime.UtcNow,
        };

        _db.HistoricoComportamento.Add(registro);
        d.NivelPericulosidade = req.NivelPericulosidade;
        await _db.SaveChangesAsync();

        _auditoria.Registrar(oficialId, "REGISTRO_COMPORTAMENTO", "historico_comportamento", registro.Id,
            $"Registrou {req.TipoRegistro} para {d.NomeDetento}.");
        await _db.SaveChangesAsync();

        var dto = DtoMapper.ParaDto(registro);
        dto.OficialResponsavelNome = oficialNome;
        return dto;
    }

    public async Task<List<HistoricoComportamentoDto>> HistoricoAsync(int detentoId)
    {
        var registros = await _db.HistoricoComportamento
            .Include(h => h.OficialResponsavel)
            .Where(h => h.DetentoId == detentoId)
            .OrderByDescending(h => h.CriadoEm)
            .ToListAsync();

        return registros.Select(DtoMapper.ParaDto).ToList();
    }

    // --------------------------- Consulta pública -------------------------------

    public async Task<FichaPublicaDto> FichaPublicaAsync(string passaporte)
    {
        var alvo = passaporte.Trim();

        var fichas = await _db.Detentos
            .Include(d => d.Historicos)
            .Where(d => d.PassaporteDetento == alvo)
            .OrderByDescending(d => d.DataEntrada)
            .ToListAsync();

        if (fichas.Count == 0)
            return new FichaPublicaDto { Encontrado = false };

        var atual = fichas[0];
        var ultimo = atual.Historicos.OrderByDescending(h => h.CriadoEm).FirstOrDefault();
        var emSolitaria = atual.StatusPrisao == StatusPrisao.EmCustodia && ultimo?.EmSolitaria == true;

        var statusBase = emSolitaria ? StatusPrisao.EmCustodia : atual.StatusPrisao;
        var statusAtual = statusBase == StatusPrisao.EmCustodia && atual.ExigeTornozeleira
            ? "TORNOZELEIRA"
            : DbEnum.ToDb(statusBase);

        return new FichaPublicaDto
        {
            Encontrado = true,
            Nome = atual.NomeDetento,
            Passaporte = atual.PassaporteDetento,
            FotoUrl = atual.FotoUrl,
            EmSolitaria = emSolitaria,
            NivelPericulosidade = atual.NivelPericulosidade,
            StatusAtual = statusAtual,
            TotalMeses = fichas.Sum(f => f.TempoTotalMeses),
            TotalMulta = fichas.Sum(f => f.ValorMultaTotal),
            Passagens = fichas.Select(f => new PassagemPublicaDto
            {
                Id = f.Id,
                Artigo = f.CrimesCometidos.Count > 0 ? string.Join(", ", f.CrimesCometidos.Select(c => c.Artigo)) : "—",
                Crime = f.CrimesCometidos.Count > 0 ? string.Join(" • ", f.CrimesCometidos.Select(c => c.Crime)) : "—",
                TempoMeses = f.TempoTotalMeses,
                Multa = f.ValorMultaTotal,
                DataEntrada = f.DataEntrada,
                StatusPrisao = f.StatusPrisao,
            }).ToList(),
        };
    }
}
