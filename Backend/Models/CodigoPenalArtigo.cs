using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DCE.Api.Models;

/// <summary>
/// Artigo do código penal utilizável pela calculadora de penas. Tabela: codigo_penal.
/// </summary>
public class CodigoPenalArtigo
{
    public int Id { get; set; }

    [Required, MaxLength(40)]
    public string Artigo { get; set; } = string.Empty;

    [Required, MaxLength(160)]
    public string Crime { get; set; } = string.Empty;

    /// <summary>Se o artigo exige monitoramento por tornozeleira eletrônica.</summary>
    public bool Tornozeleira { get; set; }

    /// <summary>Se o artigo permite o pagamento de fiança.</summary>
    public bool PermiteFianca { get; set; } = true;

    [Column(TypeName = "numeric(12,2)")]
    public decimal ValorFianca { get; set; }

    public int TempoMeses { get; set; }

    [Column(TypeName = "numeric(12,2)")]
    public decimal ValorMulta { get; set; }

    public string? Descricao { get; set; }
}
