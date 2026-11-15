using System.ComponentModel.DataAnnotations;

namespace DCE.Api.Models.Dtos;

public class OficialDto
{
    public int Id { get; set; }
    public string Passaporte { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Patente { get; set; } = string.Empty;
    public string Departamento { get; set; } = string.Empty;
    public int NivelAcesso { get; set; }
    public StatusConta StatusConta { get; set; }
    public int? AprovadoPor { get; set; }
    public DateTime CriadoEm { get; set; }
}

public class AprovarOficialRequest
{
    [Required, MaxLength(60)]
    public string Patente { get; set; } = string.Empty;

    /// <summary>Departamento atribuído ao oficial (ver <see cref="Departamentos"/>).</summary>
    [Required, MaxLength(60)]
    public string Departamento { get; set; } = string.Empty;

    [Range(1, 3)]
    public int NivelAcesso { get; set; }
}

public class AtualizarOficialRequest
{
    [MaxLength(60)]
    public string? Patente { get; set; }

    [Range(1, 3)]
    public int? NivelAcesso { get; set; }

    public StatusConta? StatusConta { get; set; }
}

public class OkResponse
{
    public bool Ok { get; set; } = true;
}
