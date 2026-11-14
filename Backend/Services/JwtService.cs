using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DCE.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace DCE.Api.Services;

/// <summary>Emissão dos tokens JWT dos oficiais autenticados.</summary>
public class JwtService
{
    private readonly IConfiguration _config;

    public JwtService(IConfiguration config) => _config = config;

    public string GerarToken(Oficial oficial)
    {
        var key = _config["Jwt:Key"]
            ?? throw new InvalidOperationException("Jwt:Key não configurada em appsettings.");

        var credenciais = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new("uid", oficial.Id.ToString()),
            new("nome", oficial.Nome),
            new("passaporte", oficial.Passaporte),
            new("email", oficial.Email),
            new("patente", oficial.Patente),
            new("nivel", oficial.NivelAcesso.ToString()),
        };

        var horas = _config.GetValue<int?>("Jwt:ExpiraHoras") ?? 12;

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddHours(horas),
            signingCredentials: credenciais);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
