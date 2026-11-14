using DCE.Api.Data;
using DCE.Api.Models.Dtos;
using DCE.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DCE.Api.Controllers;

/// <summary>Consulta dos logs de auditoria (exclusivo do Comando / Nível 1).</summary>
[ApiController]
[Route("api/auditoria")]
[Authorize(Policy = "Comando")]
public class AuditoriaController : ControllerBase
{
    private readonly DceDbContext _db;

    public AuditoriaController(DceDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<LogAuditoriaDto>>> Listar([FromQuery] int pagina = 1, [FromQuery] int tamanho = 50)
    {
        if (pagina < 1) pagina = 1;
        if (tamanho is < 1 or > 200) tamanho = 50;

        var lista = await _db.LogsAuditoria
            .Include(l => l.Oficial)
            .OrderByDescending(l => l.CriadoEm)
            .Skip((pagina - 1) * tamanho)
            .Take(tamanho)
            .ToListAsync();

        return Ok(lista.Select(DtoMapper.ParaDto).ToList());
    }
}
