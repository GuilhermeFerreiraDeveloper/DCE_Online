using System.Security.Claims;

namespace DCE.Api.Extensions;

/// <summary>Helpers para leitura das claims do JWT do oficial autenticado.</summary>
public static class ClaimsPrincipalExtensions
{
    public static int GetId(this ClaimsPrincipal user)
    {
        var raw = user.FindFirst("uid")?.Value;
        return int.TryParse(raw, out var id) ? id : 0;
    }

    public static int GetNivelAcesso(this ClaimsPrincipal user)
    {
        var raw = user.FindFirst("nivel")?.Value;
        return int.TryParse(raw, out var nivel) ? nivel : 0;
    }

    public static string GetNome(this ClaimsPrincipal user) =>
        user.FindFirst("nome")?.Value ?? "Oficial";
}
