namespace DCE.Api.Models;

/// <summary>
/// Crime específico marcado no ato do registro de um detento.
/// Persistido como JSONB na coluna <c>detentos.crimes_cometidos</c> e
/// também devolvido ao frontend no mesmo formato (espelho da calculadora penal).
/// </summary>
public class CrimeCometido
{
    public int ArtigoId { get; set; }
    public string Artigo { get; set; } = string.Empty;
    public string Crime { get; set; } = string.Empty;
    public int TempoMeses { get; set; }
    public decimal ValorMulta { get; set; }
    public decimal ValorFianca { get; set; }
    public bool Tornozeleira { get; set; }
    public bool PermiteFianca { get; set; }
}
