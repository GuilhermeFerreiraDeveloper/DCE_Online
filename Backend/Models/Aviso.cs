using System.ComponentModel.DataAnnotations;

namespace DCE.Api.Models;

/// <summary>
/// Mural de Avisos do Comando. Tabela: avisos.
/// </summary>
public class Aviso
{
    public int Id { get; set; }

    public int AutorId { get; set; }
    public Oficial? Autor { get; set; }

    [Required, MaxLength(200)]
    public string Titulo { get; set; } = string.Empty;

    [Required]
    public string Mensagem { get; set; } = string.Empty;

    public string? ImagemUrl { get; set; }

    public NivelUrgencia NivelUrgencia { get; set; } = NivelUrgencia.INFORMATIVO;

    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
}
