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
public class ChatController : ControllerBase
{
    private readonly DceDbContext _context;

    public ChatController(DceDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ChatMessageDto>>> GetMessages()
    {
        // Limpeza automática: mantém apenas mensagens do dia atual (UTC)
        var hoje = DateTime.UtcNow.Date;
        
        var mensagens = await _context.ChatMensagens
            .Where(m => m.DataEnvio >= hoje)
            .OrderBy(m => m.DataEnvio)
            .ToListAsync();

        return Ok(mensagens.Select(DtoMapper.ParaDto));
    }

    [HttpPost]
    public async Task<ActionResult<ChatMessageDto>> PostMessage(CreateChatMessageDto dto)
    {
        var oficialId = User.GetId();
        var oficial = await _context.Oficiais.FindAsync(oficialId);

        if (oficial == null) return Unauthorized();

        var mensagem = new ChatMessage
        {
            OficialId = oficialId,
            NomeOficial = oficial.Nome,
            Patente = oficial.Patente,
            Mensagem = dto.Mensagem,
            DataEnvio = DateTime.UtcNow
        };

        _context.ChatMensagens.Add(mensagem);
        await _context.SaveChangesAsync();

        return Ok(DtoMapper.ParaDto(mensagem));
    }
}
