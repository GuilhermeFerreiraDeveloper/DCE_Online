using System.ComponentModel.DataAnnotations;

namespace DCE.Api.Models;

/// <summary>
/// Chat Geral do Plantão. Tabela: chat_mensagens.
/// </summary>
public class ChatMessage
{
    public int Id { get; set; }

    public int OficialId { get; set; }
    public Oficial? Oficial { get; set; }

    [Required, MaxLength(120)]
    public string NomeOficial { get; set; } = string.Empty;

    [Required, MaxLength(60)]
    public string Patente { get; set; } = string.Empty;

    [Required]
    public string Mensagem { get; set; } = string.Empty;

    public DateTime DataEnvio { get; set; } = DateTime.UtcNow;
}
