using DCE.Api.Models.Dtos;
using DCE.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DCE.Api.Controllers;

/// <summary>Consulta pública de fichas criminais (sem autenticação).</summary>
[ApiController]
[Route("api/public")]
public class PublicController : ControllerBase
{
    private readonly DetentoService _detentos;

    public PublicController(DetentoService detentos) => _detentos = detentos;

    [HttpGet("ficha/{passaporte}")]
    [AllowAnonymous]
    public async Task<ActionResult<FichaPublicaDto>> Ficha(string passaporte)
        => Ok(await _detentos.FichaPublicaAsync(passaporte));
}
