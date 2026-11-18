using DCE.Api.Data;
using DCE.Api.Models;
using DCE.Api.Models.Dtos;
using DCE.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DCE.Api.Controllers;

/// <summary>Consulta pública de fichas criminais (sem autenticação).</summary>
[ApiController]
[Route("api/public")]
public class PublicController : ControllerBase
{
    private readonly DetentoService _detentos;
    private readonly DceDbContext _context;
    private readonly AuthService _auth;

    public PublicController(DetentoService detentos, DceDbContext context, AuthService auth)
    {
        _detentos = detentos;
        _context = context;
        _auth = auth;
    }

    [HttpGet("ficha/{passaporte}")]
    [AllowAnonymous]
    public async Task<ActionResult<FichaPublicaDto>> Ficha(string passaporte)
        => Ok(await _detentos.FichaPublicaAsync(passaporte));

    [HttpGet("foragidos")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<ForagidoDto>>> Foragidos()
    {
        var foragidos = await _context.Detentos
            .Where(d => d.StatusPrisao == StatusPrisao.Foragido && d.DestaqueProcurado)
            .OrderByDescending(d => d.Recompensa)
            .Take(5)
            .ToListAsync();

        return Ok(foragidos.Select(DtoMapper.ParaForagidoDto));
    }

    [HttpPost("recrutamento")]
    [AllowAnonymous]
    public async Task<ActionResult> Recrutar(RecrutamentoDto dto)
    {
        // Usa o serviço de auth para criar o oficial como pendente
        var oficial = new Oficial
        {
            Passaporte = dto.Passaporte,
            Nome = dto.Nome,
            Email = dto.Email,
            RespostasEdital = dto.RespostasEdital,
            DivisaoPretendida = dto.DivisaoPretendida,
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha),
            StatusConta = StatusConta.Pendente,
            CriadoEm = DateTime.UtcNow
        };

        _context.Oficiais.Add(oficial);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Candidatura enviada com sucesso. Aguarde a análise do Comando." });
    }
}
