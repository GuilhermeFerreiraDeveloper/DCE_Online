namespace DCE.Api.Models.Dtos;

public class LogAuditoriaDto
{
    public int Id { get; set; }
    public int? OficialId { get; set; }
    public string? OficialNome { get; set; }
    public string Acao { get; set; } = string.Empty;
    public string Entidade { get; set; } = string.Empty;
    public int? EntidadeId { get; set; }
    public string? Detalhe { get; set; }
    public DateTime CriadoEm { get; set; }
}
