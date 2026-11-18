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
public class AvisosController : ControllerBase
{
    private readonly DceDbContext _context;

    public AvisosController(DceDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AvisoDto>>> GetAvisos()
    {
        var avisos = await _context.Avisos
            .Include(a => a.Autor)
            .OrderByDescending(a => a.DataCriacao)
            .ToListAsync();

        return Ok(avisos.Select(DtoMapper.ParaDto));
    }

    [HttpPost]
    public async Task<ActionResult<AvisoDto>> PostAviso(CreateAvisoDto dto)
    {
        var oficialId = User.GetId();
        var oficial = await _context.Oficiais.FindAsync(oficialId);

        if (oficial == null || oficial.NivelAcesso != 1)
        {
            return Forbid();
        }

        var aviso = new Aviso
        {
            AutorId = oficialId,
            Titulo = dto.Titulo,
            Mensagem = dto.Mensagem,
            ImagemUrl = dto.ImagemUrl,
            NivelUrgencia = dto.NivelUrgencia,
            DataCriacao = DateTime.UtcNow
        };

        _context.Avisos.Add(aviso);
        await _context.SaveChangesAsync();

        // Recarrega para incluir o autor no DTO
        await _context.Entry(aviso).Reference(a => a.Autor).LoadAsync();

        return CreatedAtAction(nameof(GetAvisos), new { id = aviso.Id }, DtoMapper.ParaDto(aviso));
    }
}
