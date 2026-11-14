using System.ComponentModel.DataAnnotations;

namespace DCE.Api.Models.Dtos;

public class DetentoDto
{
    public int Id { get; set; }
    public string PassaporteDetento { get; set; } = string.Empty;
    public string NomeDetento { get; set; } = string.Empty;
    public string? FotoUrl { get; set; }
    public List<CrimeCometido> CrimesCometidos { get; set; } = new();
    public int TempoTotalMeses { get; set; }
    public decimal ValorMultaTotal { get; set; }
    public bool ExigeTornozeleira { get; set; }
    public bool PermiteFianca { get; set; }
    public StatusPrisao StatusPrisao { get; set; }
    public string? PolicialCondutor { get; set; }
    public int? OficialRegistrouId { get; set; }
    public string? OficialRegistrouNome { get; set; }
    public DateTime DataEntrada { get; set; }
    public DateTime? PrevisaoSoltura { get; set; }

    // Derivados do histórico disciplinar
    public NivelPericulosidade? NivelPericulosidade { get; set; }
    public bool EmSolitaria { get; set; }
    public string? MotivoSolitaria { get; set; }
    public DateTime? TerminoSolitaria { get; set; }
}

public class CriarDetentoRequest
{
    [Required, MaxLength(32)]
    public string PassaporteDetento { get; set; } = string.Empty;

    [Required, MaxLength(120)]
    public string NomeDetento { get; set; } = string.Empty;

    public string? FotoUrl { get; set; }

    /// <summary>Ids dos artigos do código penal marcados na calculadora.</summary>
    [MinLength(1)]
    public List<int> ArtigoIds { get; set; } = new();

    [MaxLength(120)]
    public string? PolicialCondutor { get; set; }

    public NivelPericulosidade NivelPericulosidade { get; set; } = NivelPericulosidade.Baixo;
}

public class AtualizarDetentoRequest
{
    [MaxLength(32)]
    public string? PassaporteDetento { get; set; }

    [MaxLength(120)]
    public string? NomeDetento { get; set; }

    public string? FotoUrl { get; set; }

    [MaxLength(120)]
    public string? PolicialCondutor { get; set; }

    public NivelPericulosidade? NivelPericulosidade { get; set; }

    public StatusPrisao? StatusPrisao { get; set; }

    /// <summary>Se informado, recalcula os totais com base nestes artigos.</summary>
    public List<int>? ArtigoIds { get; set; }
}

public class BaixaRequest
{
    [MaxLength(400)]
    public string? Motivo { get; set; }
}
