namespace DCE.Api.Models.Dtos;

public class PassagemPublicaDto
{
    public int Id { get; set; }
    public string Artigo { get; set; } = string.Empty;
    public string Crime { get; set; } = string.Empty;
    public int TempoMeses { get; set; }
    public decimal Multa { get; set; }
    public DateTime DataEntrada { get; set; }
    public StatusPrisao StatusPrisao { get; set; }
}

public class FichaPublicaDto
{
    public bool Encontrado { get; set; }
    public string? Nome { get; set; }
    public string? Passaporte { get; set; }

    /// <summary>EM_CUSTODIA | LIBERADO | FORAGIDO | TORNOZELEIRA</summary>
    public string? StatusAtual { get; set; }

    public string? FotoUrl { get; set; }
    public bool? EmSolitaria { get; set; }
    public NivelPericulosidade? NivelPericulosidade { get; set; }
    public int? TotalMeses { get; set; }
    public decimal? TotalMulta { get; set; }
    public List<PassagemPublicaDto>? Passagens { get; set; }
}
