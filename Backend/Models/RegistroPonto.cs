using System.ComponentModel.DataAnnotations;

namespace DCE.Api.Models;

/// <summary>
/// Registro de Ponto / Horas em Serviço. Tabela: registros_ponto.
/// </summary>
public class RegistroPonto
{
    public int Id { get; set; }

    public int OficialId { get; set; }
    public Oficial? Oficial { get; set; }

    public DateTime Entrada { get; set; } = DateTime.UtcNow;

    public DateTime? Saida { get; set; }

    public int? DuracaoMinutos { get; set; }
}
