using DCE.Api.Exceptions;
using DCE.Api.Extensions;
using DCE.Api.Models.Dtos;
using DCE.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DCE.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _auth;

    public AuthController(AuthService auth) => _auth = auth;

    /// <summary>Autentica por e-mail ou passaporte e devolve o token JWT.</summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest req)
        => Ok(await _auth.LoginAsync(req));

    /// <summary>Solicita um novo cadastro (status PENDENTE até aprovação do Comando).</summary>
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<OkResponse>> Register([FromBody] RegisterRequest req)
        => Ok(await _auth.RegisterAsync(req));

    /// <summary>Dados do oficial autenticado (a partir do token).</summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<OficialDto>> Me()
    {
        var id = User.GetId();
        var dto = await _auth.MeAsync(id);
        return dto is null ? throw AppException.NaoEncontrado("Oficial não encontrado.") : Ok(dto);
    }

    /// <summary>Troca a senha do próprio oficial autenticado.</summary>
    [HttpPut("senha")]
    [Authorize]
    public async Task<ActionResult<OkResponse>> AlterarSenha([FromBody] AlterarSenhaRequest req)
    {
        var id = User.GetId();
        await _auth.AlterarSenhaAsync(id, req);
        return Ok(new OkResponse());
    }

    /// <summary>Atualiza o próprio perfil (foto de perfil/rosto).</summary>
    [HttpPut("perfil")]
    [Authorize]
    public async Task<ActionResult<OficialDto>> AtualizarPerfil([FromBody] AtualizarPerfilRequest req)
    {
        var id = User.GetId();
        return Ok(await _auth.AtualizarPerfilAsync(id, req));
    }
}
