using DCE.Api.Data;
using DCE.Api.Exceptions;
using DCE.Api.Extensions;
using DCE.Api.Models;
using DCE.Api.Models.Dtos;
using DCE.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DCE.Api.Controllers;

/// <summary>Gestão de cadastros e contas de oficiais (exclusivo do Comando / Nível 1).</summary>
[ApiController]
[Route("api/oficiais")]
[Authorize(Policy = "Comando")]
public class OficiaisController : ControllerBase
{
    private readonly DceDbContext _db;
    private readonly AuditoriaService _auditoria;

    public OficiaisController(DceDbContext db, AuditoriaService auditoria)
    {
        _db = db;
        _auditoria = auditoria;
    }

    private int OperadorId => User.GetId();

    [HttpGet]
    public async Task<ActionResult<List<OficialDto>>> Listar()
    {
        var lista = await _db.Oficiais
            .OrderBy(o => o.NivelAcesso)
            .ThenBy(o => o.Nome)
            .ToListAsync();

        return Ok(lista.Select(DtoMapper.ParaDto).ToList());
    }

    [HttpGet("pendentes")]
    public async Task<ActionResult<List<OficialDto>>> Pendentes()
    {
        var lista = await _db.Oficiais
            .Where(o => o.StatusConta == StatusConta.Pendente)
            .OrderBy(o => o.CriadoEm)
            .ToListAsync();

        return Ok(lista.Select(DtoMapper.ParaDto).ToList());
    }

    /// <summary>Aprova o cadastro atribuindo patente e nível de acesso.</summary>
    [HttpPost("{id:int}/aprovar")]
    public async Task<ActionResult<OficialDto>> Aprovar(int id, [FromBody] AprovarOficialRequest req)
    {
        var oficial = await _db.Oficiais.FindAsync(id)
            ?? throw AppException.NaoEncontrado("Cadastro não encontrado.");

        if (!Departamentos.EhValido(req.Departamento))
            throw AppException.Validacao("Departamento inválido.");

        oficial.StatusConta = StatusConta.Ativo;
        oficial.Patente = req.Patente.Trim();
        oficial.Departamento = req.Departamento.Trim();
        oficial.NivelAcesso = req.NivelAcesso;
        oficial.AprovadoPor = OperadorId;

        await _db.SaveChangesAsync();
        _auditoria.Registrar(OperadorId, "APROVACAO_CADASTRO", "oficiais", oficial.Id,
            $"Aprovou {oficial.Nome} como {oficial.Patente} (Nível {oficial.NivelAcesso}).");
        await _db.SaveChangesAsync();

        return Ok(DtoMapper.ParaDto(oficial));
    }

    [HttpPost("{id:int}/medalhas")]
    public async Task<ActionResult<MedalhaDto>> ConcederMedalha(int id, [FromBody] ConcederMedalhaDto dto)
    {
        var oficial = await _db.Oficiais.FindAsync(id)
            ?? throw AppException.NaoEncontrado("Oficial não encontrado.");

        var medalha = new MedalhaOficial
        {
            OficialId = id,
            ConcedidoPorId = OperadorId,
            NomeMedalha = dto.NomeMedalha,
            Descricao = dto.Descricao,
            Icone = dto.Icone,
            DataConcessao = DateTime.UtcNow
        };

        _db.MedalhasOficiais.Add(medalha);
        await _db.SaveChangesAsync();

        _auditoria.Registrar(OperadorId, "CONCESSAO_MEDALHA", "oficiais", id, $"Concedeu a medalha {dto.NomeMedalha} para {oficial.Nome}.");
        await _db.SaveChangesAsync();

        // Recarrega para incluir os dados de navegação no DTO
        await _db.Entry(medalha).Reference(m => m.ConcedidoPor).LoadAsync();

        return Ok(DtoMapper.ParaDto(medalha));
    }

    /// <summary>Recusa e remove a solicitação de cadastro pendente.</summary>
    [HttpPost("{id:int}/recusar")]
    public async Task<ActionResult<OkResponse>> Recusar(int id)
    {
        var oficial = await _db.Oficiais.FindAsync(id)
            ?? throw AppException.NaoEncontrado("Cadastro não encontrado.");

        _db.Oficiais.Remove(oficial);
        await _db.SaveChangesAsync();
        _auditoria.Registrar(OperadorId, "RECUSA_CADASTRO", "oficiais", id, $"Recusou a solicitação de {oficial.Nome}.");
        await _db.SaveChangesAsync();

        return Ok(new OkResponse());
    }

    /// <summary>Promove/rebaixa patente, altera nível de acesso ou status da conta.</summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<OficialDto>> Atualizar(int id, [FromBody] AtualizarOficialRequest req)
    {
        var oficial = await _db.Oficiais.FindAsync(id)
            ?? throw AppException.NaoEncontrado("Oficial não encontrado.");

        if (req.Patente is not null) oficial.Patente = req.Patente.Trim();
        if (req.NivelAcesso is not null) oficial.NivelAcesso = req.NivelAcesso.Value;
        if (req.StatusConta is not null) oficial.StatusConta = req.StatusConta.Value;

        await _db.SaveChangesAsync();
        _auditoria.Registrar(OperadorId, "ALTERACAO_OFICIAL", "oficiais", oficial.Id, $"Atualizou o cadastro de {oficial.Nome}.");
        await _db.SaveChangesAsync();

        return Ok(DtoMapper.ParaDto(oficial));
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult<OkResponse>> Excluir(int id)
    {
        if (id == OperadorId)
            throw AppException.Validacao("Você não pode excluir a sua própria conta.");

        var oficial = await _db.Oficiais.FindAsync(id)
            ?? throw AppException.NaoEncontrado("Oficial não encontrado.");

        _db.Oficiais.Remove(oficial);
        await _db.SaveChangesAsync();
        _auditoria.Registrar(OperadorId, "EXCLUSAO_OFICIAL", "oficiais", id, $"Excluiu o cadastro de {oficial.Nome}.");
        await _db.SaveChangesAsync();

        return Ok(new OkResponse());
    }
}
