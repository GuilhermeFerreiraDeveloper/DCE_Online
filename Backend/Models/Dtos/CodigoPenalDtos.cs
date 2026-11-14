using System.ComponentModel.DataAnnotations;

namespace DCE.Api.Models.Dtos;

/// <summary>Payload de criação/edição de um artigo do código penal (sem Id).</summary>
public class CodigoPenalArtigoInput
{
    [Required, MaxLength(40)]
    public string Artigo { get; set; } = string.Empty;

    [Required, MaxLength(160)]
    public string Crime { get; set; } = string.Empty;

    public bool Tornozeleira { get; set; }

    public bool PermiteFianca { get; set; } = true;

    public decimal ValorFianca { get; set; }

    public int TempoMeses { get; set; }

    public decimal ValorMulta { get; set; }

    public string? Descricao { get; set; }
}
