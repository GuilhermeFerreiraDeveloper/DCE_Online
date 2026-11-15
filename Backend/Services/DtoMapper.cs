using DCE.Api.Models;
using DCE.Api.Models.Dtos;

namespace DCE.Api.Services;

/// <summary>Conversão de entidades para DTOs (formato consumido pelo frontend).</summary>
public static class DtoMapper
{
    public static OficialDto ParaDto(Oficial o) => new()
    {
        Id = o.Id,
        Passaporte = o.Passaporte,
        Nome = o.Nome,
        Email = o.Email,
        Patente = o.Patente,
        Departamento = o.Departamento,
        NivelAcesso = o.NivelAcesso,
        StatusConta = o.StatusConta,
        AprovadoPor = o.AprovadoPor,
        CriadoEm = o.CriadoEm,
    };

    public static HistoricoComportamentoDto ParaDto(HistoricoComportamento h) => new()
    {
        Id = h.Id,
        DetentoId = h.DetentoId,
        TipoRegistro = h.TipoRegistro,
        NivelPericulosidade = h.NivelPericulosidade,
        EmSolitaria = h.EmSolitaria,
        MotivoSolitaria = h.MotivoSolitaria,
        TerminoSolitaria = h.TerminoSolitaria,
        Descricao = h.Descricao,
        OficialResponsavelId = h.OficialResponsavelId,
        OficialResponsavelNome = h.OficialResponsavel?.Nome,
        CriadoEm = h.CriadoEm,
    };

    public static LogAuditoriaDto ParaDto(LogAuditoria l) => new()
    {
        Id = l.Id,
        OficialId = l.OficialId,
        OficialNome = l.Oficial?.Nome,
        Acao = l.Acao,
        Entidade = l.Entidade,
        EntidadeId = l.EntidadeId,
        Detalhe = l.Detalhe,
        CriadoEm = l.CriadoEm,
    };

    public static DetentoDto ParaDto(Detento d)
    {
        var ultimo = d.Historicos.OrderByDescending(h => h.CriadoEm).FirstOrDefault();
        var emSolitaria = d.StatusPrisao == StatusPrisao.EmCustodia && ultimo?.EmSolitaria == true;

        return new DetentoDto
        {
            Id = d.Id,
            PassaporteDetento = d.PassaporteDetento,
            NomeDetento = d.NomeDetento,
            FotoUrl = d.FotoUrl,
            CrimesCometidos = d.CrimesCometidos,
            TempoTotalMeses = d.TempoTotalMeses,
            ValorMultaTotal = d.ValorMultaTotal,
            ExigeTornozeleira = d.ExigeTornozeleira,
            PermiteFianca = d.PermiteFianca,
            StatusPrisao = d.StatusPrisao,
            PolicialCondutor = d.PolicialCondutor,
            OficialRegistrouId = d.OficialRegistrouId,
            OficialRegistrouNome = d.OficialRegistrou?.Nome,
            DataEntrada = d.DataEntrada,
            PrevisaoSoltura = d.PrevisaoSoltura,
            NivelPericulosidade = d.NivelPericulosidade,
            EmSolitaria = emSolitaria,
            MotivoSolitaria = emSolitaria ? ultimo!.MotivoSolitaria : null,
            TerminoSolitaria = emSolitaria ? ultimo!.TerminoSolitaria : null,
        };
    }
}
