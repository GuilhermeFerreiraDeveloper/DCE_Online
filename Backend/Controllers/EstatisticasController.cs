using DCE.Api.Data;
using DCE.Api.Models;
using DCE.Api.Models.Dtos;
using DCE.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DCE.Api.Controllers;

/// <summary>Indicadores gerais do sistema (exclusivo do Comando / Nível 1).</summary>
[ApiController]
[Route("api/estatisticas")]
[Authorize(Policy = "Comando")]
public class EstatisticasController : ControllerBase
{
    private readonly DceDbContext _db;

    public EstatisticasController(DceDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<EstatisticasDto>> Obter()
    {
        var detentos = await _db.Detentos.Include(d => d.Historicos).ToListAsync();
        var oficiais = await _db.Oficiais.ToListAsync();

        return Ok(new EstatisticasDto
        {
            TotalDetentos = detentos.Count,
            EmCustodia = detentos.Count(d => d.StatusPrisao == StatusPrisao.EmCustodia),
            Liberados = detentos.Count(d => d.StatusPrisao == StatusPrisao.Liberado),
            Foragidos = detentos.Count(d => d.StatusPrisao == StatusPrisao.Foragido),
            EmSolitaria = detentos.Count(d => DtoMapper.ParaDto(d).EmSolitaria),
            ExigeTornozeleira = detentos.Count(d => d.ExigeTornozeleira),
            OficiaisAtivos = oficiais.Count(o => o.StatusConta == StatusConta.Ativo),
            OficiaisPendentes = oficiais.Count(o => o.StatusConta == StatusConta.Pendente),
            TotalArtigos = await _db.CodigoPenal.CountAsync(),
            TotalOcorrencias = await _db.HistoricoComportamento.CountAsync(),
        });
    }
}
