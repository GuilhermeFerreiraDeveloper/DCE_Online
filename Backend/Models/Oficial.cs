using System.ComponentModel.DataAnnotations;

namespace DCE.Api.Models;

/// <summary>
/// Oficial do Departamento de Custódia do Estado (DCE). Tabela: oficiais.
/// </summary>
public class Oficial
{
    public int Id { get; set; }

    [Required, MaxLength(32)]
    public string Passaporte { get; set; } = string.Empty;

    [Required, MaxLength(120)]
    public string Nome { get; set; } = string.Empty;

    [Required, MaxLength(160)]
    public string Email { get; set; } = string.Empty;

    /// <summary>Hash BCrypt da senha (nunca exposto em DTOs).</summary>
    [Required, MaxLength(255)]
    public string SenhaHash { get; set; } = string.Empty;

    [Required, MaxLength(60)]
    public string Patente { get; set; } = "Recruta";

    /// <summary>Nível hierárquico: 1 = Comando, 2 = Oficialidade, 3 = Praças.</summary>
    public int NivelAcesso { get; set; } = 3;

    public StatusConta StatusConta { get; set; } = StatusConta.Pendente;

    public int? AprovadoPor { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    // Navegação
    public ICollection<Detento> DetentosRegistrados { get; set; } = new List<Detento>();
    public ICollection<HistoricoComportamento> RegistrosDisciplinares { get; set; } = new List<HistoricoComportamento>();
}
