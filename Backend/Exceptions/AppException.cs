namespace DCE.Api.Exceptions;

/// <summary>
/// Exceção de negócio com status HTTP associado. Tratada pelo
/// <see cref="DCE.Api.Middleware.ExceptionHandlingMiddleware"/> e convertida
/// no envelope padrão <c>{ erro, mensagem, statusCode }</c>.
/// </summary>
public class AppException : Exception
{
    public int StatusCode { get; }
    public string Erro { get; }

    public AppException(string mensagem, int statusCode = 400, string erro = "ERRO")
        : base(mensagem)
    {
        StatusCode = statusCode;
        Erro = erro;
    }

    public static AppException NaoAutorizado(string mensagem) => new(mensagem, 401, "NAO_AUTORIZADO");
    public static AppException AcessoNegado(string mensagem = "Acesso negado.") => new(mensagem, 403, "ACESSO_NEGADO");
    public static AppException NaoEncontrado(string mensagem) => new(mensagem, 404, "NAO_ENCONTRADO");
    public static AppException Conflito(string mensagem) => new(mensagem, 409, "CONFLITO");
    public static AppException Validacao(string mensagem) => new(mensagem, 400, "VALIDACAO");
}
