using System.ComponentModel.DataAnnotations;

namespace DCE.Api.Models;

/// <summary>
/// Sistema de Condecorações e Medalhas. Tabela: medalhas_oficiais.
/// </summary>
public class MedalhaOficial
{
    public int Id { get; set; }

    public int OficialId { get; set; }
    public Oficial? Oficial { get; set; }

    public int ConcedidoPorId { get; set; }
    public Oficial? ConcedidoPor { get; set; }

    [Required, MaxLength(100)]
    public string NomeMedalha { get; set; } = string.Empty;

    [Required]
    public string Descricao { get; set; } = string.Empty;

    public string? Icone { get; set; }

    public DateTime DataConcessao { get; set; } = DateTime.UtcNow;
}
