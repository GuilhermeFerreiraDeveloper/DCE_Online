using System.ComponentModel.DataAnnotations;

namespace DCE.Api.Models;

/// <summary>
/// Trilha de auditoria das ações sensíveis do sistema. Tabela: logs_auditoria.
/// </summary>
public class LogAuditoria
{
    public int Id { get; set; }

    public int? OficialId { get; set; }
    public Oficial? Oficial { get; set; }

    [Required, MaxLength(80)]
    public string Acao { get; set; } = string.Empty;

    [Required, MaxLength(40)]
    public string Entidade { get; set; } = string.Empty;

    public int? EntidadeId { get; set; }

    public string? Detalhe { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
