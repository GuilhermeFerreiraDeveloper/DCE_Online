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

[ApiController]
[Route("api/codigo-penal")]
[Authorize(Policy = "Operacional")]
public class CodigoPenalController : ControllerBase
{
    private readonly DceDbContext _db;
    private readonly AuditoriaService _auditoria;

    public CodigoPenalController(DceDbContext db, AuditoriaService auditoria)
    {
        _db = db;
        _auditoria = auditoria;
    }

    private int OperadorId => User.OficialId() ?? throw AppException.NaoAutorizado("Sessão inválida.");

    [HttpGet]
    public async Task<ActionResult<List<CodigoPenalArtigo>>> Listar()
        => Ok(await _db.CodigoPenal.OrderBy(a => a.Id).ToListAsync());

    /// <summary>Cria um novo artigo (apenas Comando).</summary>
    [HttpPost]
    [Authorize(Policy = "Comando")]
    public async Task<ActionResult<CodigoPenalArtigo>> Criar([FromBody] CodigoPenalArtigoInput req)
    {
        var artigo = new CodigoPenalArtigo
        {
            Artigo = req.Artigo.Trim(),
            Crime = req.Crime.Trim(),
            Tornozeleira = req.Tornozeleira,
            PermiteFianca = req.PermiteFianca,
            ValorFianca = req.ValorFianca,
            TempoMeses = req.TempoMeses,
            ValorMulta = req.ValorMulta,
            Descricao = req.Descricao,
        };

        _db.CodigoPenal.Add(artigo);
        await _db.SaveChangesAsync();
        _auditoria.Registrar(OperadorId, "CRIACAO_ARTIGO", "codigo_penal", artigo.Id, $"Criou o artigo {artigo.Artigo} — {artigo.Crime}.");
        await _db.SaveChangesAsync();

        return Ok(artigo);
    }

    /// <summary>Edita um artigo existente (apenas Comando).</summary>
    [HttpPut("{id:int}")]
    [Authorize(Policy = "Comando")]
    public async Task<ActionResult<CodigoPenalArtigo>> Atualizar(int id, [FromBody] CodigoPenalArtigoInput req)
    {
        var artigo = await _db.CodigoPenal.FindAsync(id)
            ?? throw AppException.NaoEncontrado("Artigo não encontrado.");

        artigo.Artigo = req.Artigo.Trim();
        artigo.Crime = req.Crime.Trim();
        artigo.Tornozeleira = req.Tornozeleira;
        artigo.PermiteFianca = req.PermiteFianca;
        artigo.ValorFianca = req.ValorFianca;
        artigo.TempoMeses = req.TempoMeses;
        artigo.ValorMulta = req.ValorMulta;
        artigo.Descricao = req.Descricao;

        await _db.SaveChangesAsync();
        _auditoria.Registrar(OperadorId, "EDICAO_ARTIGO", "codigo_penal", artigo.Id, $"Editou o artigo {artigo.Artigo}.");
        await _db.SaveChangesAsync();

        return Ok(artigo);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "Comando")]
    public async Task<ActionResult<OkResponse>> Excluir(int id)
    {
        var artigo = await _db.CodigoPenal.FindAsync(id)
            ?? throw AppException.NaoEncontrado("Artigo não encontrado.");

        _db.CodigoPenal.Remove(artigo);
        await _db.SaveChangesAsync();
        _auditoria.Registrar(OperadorId, "EXCLUSAO_ARTIGO", "codigo_penal", id, $"Excluiu o artigo {artigo.Artigo}.");
        await _db.SaveChangesAsync();

        return Ok(new OkResponse());
    }
}
