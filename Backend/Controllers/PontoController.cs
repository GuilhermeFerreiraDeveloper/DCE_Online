using DCE.Api.Data;
using DCE.Api.Extensions;
using DCE.Api.Models;
using DCE.Api.Models.Dtos;
using DCE.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DCE.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PontoController : ControllerBase
{
    private readonly DceDbContext _context;

    public PontoController(DceDbContext context)
    {
        _context = context;
    }

    [HttpPost("iniciar")]
    public async Task<ActionResult<RegistroPontoDto>> IniciarPonto()
    {
        var oficialId = User.GetId();
        
        // Verifica se já tem um ponto aberto
        var aberto = await _context.RegistrosPonto
            .FirstOrDefaultAsync(p => p.OficialId == oficialId && p.Saida == null);

        if (aberto != null) return BadRequest("Você já possui um plantão ativo.");

        var ponto = new RegistroPonto
        {
            OficialId = oficialId,
            Entrada = DateTime.UtcNow
        };

        _context.RegistrosPonto.Add(ponto);
        await _context.SaveChangesAsync();

        await _context.Entry(ponto).Reference(p => p.Oficial).LoadAsync();
        return Ok(DtoMapper.ParaDto(ponto));
    }

    [HttpPost("encerrar")]
    public async Task<ActionResult<RegistroPontoDto>> EncerrarPonto()
    {
        var oficialId = User.GetId();
        
        var ponto = await _context.RegistrosPonto
            .FirstOrDefaultAsync(p => p.OficialId == oficialId && p.Saida == null);

        if (ponto == null) return BadRequest("Nenhum plantão ativo encontrado.");

        ponto.Saida = DateTime.UtcNow;
        ponto.DuracaoMinutos = (int)(ponto.Saida.Value - ponto.Entrada).TotalMinutes;

        await _context.SaveChangesAsync();

        await _context.Entry(ponto).Reference(p => p.Oficial).LoadAsync();
        return Ok(DtoMapper.ParaDto(ponto));
    }

    [HttpGet("ativos")]
    public async Task<ActionResult<IEnumerable<RegistroPontoDto>>> GetAtivos()
    {
        var ativos = await _context.RegistrosPonto
            .Include(p => p.Oficial)
            .Where(p => p.Saida == null)
            .OrderByDescending(p => p.Entrada)
            .ToListAsync();

        return Ok(ativos.Select(DtoMapper.ParaDto));
    }

    [HttpGet("ranking")]
    public async Task<ActionResult<IEnumerable<RankingPontoDto>>> GetRanking()
    {
        // Ranking dos últimos 7 dias
        var umaSemanaAtras = DateTime.UtcNow.AddDays(-7);

        var ranking = await _context.RegistrosPonto
            .Include(p => p.Oficial)
            .Where(p => p.Entrada >= umaSemanaAtras && p.Saida != null)
            .GroupBy(p => new { p.OficialId, p.Oficial!.Nome, p.Oficial!.Patente })
            .Select(g => new RankingPontoDto(
                g.Key.OficialId,
                g.Key.Nome,
                g.Key.Patente,
                g.Sum(p => p.DuracaoMinutos ?? 0),
                g.Count()
            ))
            .OrderByDescending(r => r.TotalMinutos)
            .ToListAsync();

        return Ok(ranking);
    }
}
