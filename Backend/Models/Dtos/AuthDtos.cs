using System.ComponentModel.DataAnnotations;

namespace DCE.Api.Models.Dtos;

public class LoginRequest
{
    /// <summary>E-mail OU Passaporte do oficial.</summary>
    [Required]
    public string Identificador { get; set; } = string.Empty;

    [Required]
    public string Senha { get; set; } = string.Empty;
}

public class RegisterRequest
{
    [Required, MaxLength(32)]
    public string Passaporte { get; set; } = string.Empty;

    [Required, MaxLength(120)]
    public string Nome { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(160)]
    public string Email { get; set; } = string.Empty;

    /// <summary>Departamento pretendido (ver <see cref="Models.Departamentos"/>).</summary>
    [Required, MaxLength(60)]
    public string Departamento { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string Senha { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public OficialDto Oficial { get; set; } = new();
}

/// <summary>Troca de senha pelo próprio oficial (exige a senha atual).</summary>
public class AlterarSenhaRequest
{
    [Required]
    public string SenhaAtual { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string NovaSenha { get; set; } = string.Empty;
}

/// <summary>Atualização do próprio perfil (foto de rosto).</summary>
public class AtualizarPerfilRequest
{
    /// <summary>Base64/data URL ou link da foto. Vazio remove a foto.</summary>
    public string? FotoUrl { get; set; }
}
