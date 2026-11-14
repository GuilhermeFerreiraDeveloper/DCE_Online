using System.ComponentModel.DataAnnotations;

namespace DCE.Api.Models;

/// <summary>
/// Registro da linha do tempo disciplinar: bom/mau comportamento ou envio à solitária.
/// Tabela: historico_comportamento.
/// </summary>
public class HistoricoComportamento
{
    public int Id { get; set; }

    public int DetentoId { get; set; }
    public Detento? Detento { get; set; }

    public TipoRegistro TipoRegistro { get; set; }

    public NivelPericulosidade? NivelPericulosidade { get; set; }

    public bool EmSolitaria { get; set; }

    public string? MotivoSolitaria { get; set; }

    public DateTime? TerminoSolitaria { get; set; }

    public string? Descricao { get; set; }

    public int? OficialResponsavelId { get; set; }
    public Oficial? OficialResponsavel { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
