using DCE.Api.Data;
using DCE.Api.Exceptions;
using DCE.Api.Models;
using DCE.Api.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace DCE.Api.Services;

/// <summary>Regras de autenticação, cadastro e consulta do oficial logado.</summary>
public class AuthService
{
    private readonly DceDbContext _db;
    private readonly JwtService _jwt;

    public AuthService(DceDbContext db, JwtService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest req)
    {
        var ident = req.Identificador.Trim();
        var identLower = ident.ToLowerInvariant();

        var oficial = await _db.Oficiais.FirstOrDefaultAsync(o =>
            o.Passaporte == ident || o.Email.ToLower() == identLower);

        // Mesma mensagem para usuário inexistente e senha errada (evita enumeração de contas).
        if (oficial is null || !BCrypt.Net.BCrypt.Verify(req.Senha, oficial.SenhaHash))
            throw AppException.NaoAutorizado("Credenciais inválidas. Verifique os dados informados.");

        if (oficial.StatusConta == StatusConta.Pendente)
            throw new AppException("Sua conta ainda está PENDENTE de aprovação pelo Comando.", 403, "CONTA_PENDENTE");

        if (oficial.StatusConta == StatusConta.Bloqueado)
            throw new AppException("Sua conta está BLOQUEADA. Procure o Comando do DCE.", 403, "CONTA_BLOQUEADA");

        return new LoginResponse
        {
            Token = _jwt.GerarToken(oficial),
            Oficial = DtoMapper.ParaDto(oficial),
        };
    }

    public async Task<OkResponse> RegisterAsync(RegisterRequest req)
    {
        var passaporte = req.Passaporte.Trim();
        var email = req.Email.Trim().ToLowerInvariant();

        if (await _db.Oficiais.AnyAsync(o => o.Passaporte == passaporte))
            throw AppException.Conflito("Já existe uma solicitação com este Passaporte.");

        if (await _db.Oficiais.AnyAsync(o => o.Email.ToLower() == email))
            throw AppException.Conflito("Já existe uma solicitação com este E-mail.");

        if (!Departamentos.EhValido(req.Departamento))
            throw AppException.Validacao("Departamento inválido.");

        _db.Oficiais.Add(new Oficial
        {
            Passaporte = passaporte,
            Nome = req.Nome.Trim(),
            Email = email,
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(req.Senha),
            Patente = "Recruta",
            Departamento = req.Departamento.Trim(),
            NivelAcesso = 3,
            StatusConta = StatusConta.Pendente,
        });

        await _db.SaveChangesAsync();
        return new OkResponse();
    }

    public async Task<OficialDto?> MeAsync(int oficialId)
    {
        var oficial = await _db.Oficiais.FindAsync(oficialId);
        return oficial is null ? null : DtoMapper.ParaDto(oficial);
    }
}
