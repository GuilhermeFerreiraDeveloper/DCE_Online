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

/// <summary>Resultado da verificação de passaporte antes de abrir uma nova ficha.</summary>
public class VerificacaoPassaporteDto
{
    /// <summary>Indica se o cidadão já possui alguma ficha registrada.</summary>
    public bool Existe { get; set; }

    /// <summary>Verdadeiro quando a ficha mais recente está em custódia (prisão ativa).</summary>
    public bool EmCustodia { get; set; }

    /// <summary>Quantidade total de passagens (fichas) registradas para o passaporte.</summary>
    public int TotalPassagens { get; set; }

    /// <summary>Nome do detento na ficha mais recente (para autopreenchimento).</summary>
    public string? Nome { get; set; }

    /// <summary>Mugshot da ficha mais recente (para autopreenchimento).</summary>
    public string? FotoUrl { get; set; }

    public int? UltimaFichaId { get; set; }
    public StatusPrisao? StatusPrisao { get; set; }
    public DateTime? UltimaEntrada { get; set; }
}

/// <summary>Resumo de um artigo no histórico de prisões do detento.</summary>
public class ArtigoResumoDto
{
    public string Artigo { get; set; } = string.Empty;
    public string Crime { get; set; } = string.Empty;
    public int Ocorrencias { get; set; }
}

/// <summary>Ficha resumida para a linha do tempo de prisões.</summary>
public class FichaResumoDto
{
    public int Id { get; set; }
    public int NumeroPrisioneiro { get; set; }
    public string NomeDetento { get; set; } = string.Empty;
    public string PassaporteDetento { get; set; } = string.Empty;
    public DateTime DataEntrada { get; set; }
    public StatusPrisao StatusPrisao { get; set; }
    public int TempoTotalMeses { get; set; }
    public decimal ValorMultaTotal { get; set; }
    public bool ExigeTornozeleira { get; set; }
    public bool PermiteFianca { get; set; }
    public string? PolicialCondutor { get; set; }
    public string? OficialRegistrouNome { get; set; }
    public List<string> Artigos { get; set; } = new();
    public List<string> Crimes { get; set; } = new();
}

/// <summary>Histórico completo de prisões de um detento (por passaporte) com resumo.</summary>
public class HistoricoFichasDto
{
    public string NomeDetento { get; set; } = string.Empty;
    public string PassaporteDetento { get; set; } = string.Empty;
    public int TotalFichas { get; set; }
    public int TotalMesesPena { get; set; }
    public decimal TotalMultas { get; set; }
    public List<ArtigoResumoDto> Artigos { get; set; } = new();
    public List<FichaResumoDto> Fichas { get; set; } = new();
}
