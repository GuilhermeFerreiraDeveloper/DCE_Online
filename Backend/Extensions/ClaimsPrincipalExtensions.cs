using System.Security.Claims;

namespace DCE.Api.Extensions;

/// <summary>Helpers para leitura das claims do JWT do oficial autenticado.</summary>
public static class ClaimsPrincipalExtensions
{
    public static int? OficialId(this ClaimsPrincipal user)
    {
        var raw = user.FindFirst("uid")?.Value;
        return int.TryParse(raw, out var id) ? id : null;
    }

    public static int NivelAcesso(this ClaimsPrincipal user)
    {
        var raw = user.FindFirst("nivel")?.Value;
        return int.TryParse(raw, out var nivel) ? nivel : 0;
    }

    public static string Nome(this ClaimsPrincipal user) =>
        user.FindFirst("nome")?.Value ?? "Oficial";
}
