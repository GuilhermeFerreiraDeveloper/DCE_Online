namespace DCE.Api.Models.Dtos;

public class EstatisticasDto
{
    public int TotalDetentos { get; set; }
    public int EmCustodia { get; set; }
    public int Liberados { get; set; }
    public int Foragidos { get; set; }
    public int EmSolitaria { get; set; }
    public int ExigeTornozeleira { get; set; }
    public int OficiaisAtivos { get; set; }
    public int OficiaisPendentes { get; set; }
    public int TotalArtigos { get; set; }
    public int TotalOcorrencias { get; set; }
}
