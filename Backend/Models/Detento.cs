using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DCE.Api.Models;

/// <summary>
/// Ficha de um detento sob custódia do Estado. Tabela: detentos.
/// Os totais (tempo, multa, tornozeleira, fiança) são calculados no servidor
/// a partir dos artigos selecionados no momento do registro.
/// </summary>
public class Detento
{
    public int Id { get; set; }

    [Required, MaxLength(32)]
    public string PassaporteDetento { get; set; } = string.Empty;

    [Required, MaxLength(120)]
    public string NomeDetento { get; set; } = string.Empty;

    public string? FotoUrl { get; set; }

    /// <summary>Artigos/crimes efetivamente marcados. Persistido como JSONB.</summary>
    public List<CrimeCometido> CrimesCometidos { get; set; } = new();

    public int TempoTotalMeses { get; set; }

    [Column(TypeName = "numeric(12,2)")]
    public decimal ValorMultaTotal { get; set; }

    public bool ExigeTornozeleira { get; set; }

    public bool PermiteFianca { get; set; } = true;

    [Column(TypeName = "numeric(12,2)")]
    public decimal? Recompensa { get; set; }

    public bool DestaqueProcurado { get; set; } = false;

    public StatusPrisao StatusPrisao { get; set; } = StatusPrisao.EmCustodia;

    [MaxLength(120)]
    public string? PolicialCondutor { get; set; }

    /// <summary>Oficial do DCE que registrou a entrada (preenchido pelo token logado).</summary>
    public int? OficialRegistrouId { get; set; }
    public Oficial? OficialRegistrou { get; set; }

    public DateTime DataEntrada { get; set; } = DateTime.UtcNow;

    public DateTime? PrevisaoSoltura { get; set; }

    /// <summary>Periculosidade atual atribuída ao detento (atualizada por registros disciplinares).</summary>
    public NivelPericulosidade? NivelPericulosidade { get; set; }

    // Navegação
    public ICollection<HistoricoComportamento> Historicos { get; set; } = new List<HistoricoComportamento>();
}
