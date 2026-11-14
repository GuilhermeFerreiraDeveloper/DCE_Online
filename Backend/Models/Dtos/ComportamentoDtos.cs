namespace DCE.Api.Models.Dtos;

public class RegistrarComportamentoRequest
{
    public TipoRegistro TipoRegistro { get; set; } = TipoRegistro.BomComportamento;

    public NivelPericulosidade NivelPericulosidade { get; set; } = NivelPericulosidade.Baixo;

    public bool EmSolitaria { get; set; }

    public string? MotivoSolitaria { get; set; }

    public DateTime? TerminoSolitaria { get; set; }

    public string? Descricao { get; set; }
}

public class HistoricoComportamentoDto
{
    public int Id { get; set; }
    public int DetentoId { get; set; }
    public TipoRegistro TipoRegistro { get; set; }
    public NivelPericulosidade? NivelPericulosidade { get; set; }
    public bool EmSolitaria { get; set; }
    public string? MotivoSolitaria { get; set; }
    public DateTime? TerminoSolitaria { get; set; }
    public string? Descricao { get; set; }
    public int? OficialResponsavelId { get; set; }
    public string? OficialResponsavelNome { get; set; }
    public DateTime CriadoEm { get; set; }
}
