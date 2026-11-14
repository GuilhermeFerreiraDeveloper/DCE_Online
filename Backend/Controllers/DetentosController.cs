using DCE.Api.Exceptions;
using DCE.Api.Extensions;
using DCE.Api.Models.Dtos;
using DCE.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DCE.Api.Controllers;

[ApiController]
[Route("api/detentos")]
[Authorize(Policy = "Operacional")]
public class DetentosController : ControllerBase
{
    private readonly DetentoService _svc;

    public DetentosController(DetentoService svc) => _svc = svc;

    private int OficialId => User.OficialId() ?? throw AppException.NaoAutorizado("Sessão inválida.");

    /// <summary>Lista os detentos, com filtro instantâneo por nome ou passaporte.</summary>
    [HttpGet]
    public async Task<ActionResult<List<DetentoDto>>> Listar([FromQuery] string? busca)
        => Ok(await _svc.ListarAsync(busca));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<DetentoDto>> Obter(int id)
    {
        var dto = await _svc.ObterAsync(id);
        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>Registra a entrada de um detento (cálculo dos totais no servidor).</summary>
    [HttpPost]
    public async Task<ActionResult<DetentoDto>> Criar([FromBody] CriarDetentoRequest req)
        => Ok(await _svc.CriarAsync(req, OficialId, User.Nome()));

    /// <summary>Edita a ficha do detento (Nível 1 e 2).</summary>
    [HttpPut("{id:int}")]
    [Authorize(Policy = "Oficialidade")]
    public async Task<ActionResult<DetentoDto>> Atualizar(int id, [FromBody] AtualizarDetentoRequest req)
        => Ok(await _svc.AtualizarAsync(id, req, OficialId));

    /// <summary>Concede liberdade ao detento (baixa).</summary>
    [HttpPost("{id:int}/baixa")]
    [Authorize(Policy = "Oficialidade")]
    public async Task<ActionResult<DetentoDto>> Baixa(int id, [FromBody] BaixaRequest req)
        => Ok(await _svc.DarBaixaAsync(id, req.Motivo, OficialId));

    /// <summary>Exclui definitivamente uma ficha (apenas Comando).</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "Comando")]
    public async Task<ActionResult<OkResponse>> Excluir(int id)
    {
        await _svc.ExcluirAsync(id, OficialId);
        return Ok(new OkResponse());
    }

    /// <summary>Registra ocorrência de comportamento / envio à solitária (Nível 1 e 2).</summary>
    [HttpPost("{id:int}/comportamento")]
    [Authorize(Policy = "Oficialidade")]
    public async Task<ActionResult<HistoricoComportamentoDto>> Comportamento(int id, [FromBody] RegistrarComportamentoRequest req)
        => Ok(await _svc.RegistrarComportamentoAsync(id, req, OficialId, User.Nome()));

    [HttpGet("{id:int}/historico")]
    public async Task<ActionResult<List<HistoricoComportamentoDto>>> Historico(int id)
        => Ok(await _svc.HistoricoAsync(id));
}
