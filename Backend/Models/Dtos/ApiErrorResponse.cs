namespace DCE.Api.Models.Dtos;

/// <summary>Envelope padrão de erro da API (usado pelo middleware de exceções).</summary>
public class ApiErrorResponse
{
    public string Erro { get; set; } = "ERRO";
    public string Mensagem { get; set; } = string.Empty;
    public int StatusCode { get; set; }
}
