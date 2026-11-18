using System.Text.Json;
using DCE.Api.Exceptions;
using DCE.Api.Models.Dtos;

namespace DCE.Api.Middleware;

/// <summary>
/// Converte qualquer exceção não tratada no envelope de erro padrão
/// <c>{ erro, mensagem, statusCode }</c> consumido pelo frontend.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (AppException ex)
        {
            await EscreverAsync(context, ex.StatusCode, ex.Erro, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro inesperado ao processar {Metodo} {Path}", context.Request.Method, context.Request.Path);
            
            var mensagem = "Ocorreu um erro interno no servidor. Tente novamente.";
            
            // Em desenvolvimento, devolve a mensagem da exceção para facilitar o debug.
            var env = context.RequestServices.GetRequiredService<IHostEnvironment>();
            if (env.IsDevelopment())
            {
                mensagem = $"{mensagem} Erro: {ex.Message}";
            }

            await EscreverAsync(context, StatusCodes.Status500InternalServerError, "ERRO_INTERNO", mensagem);
        }
    }

    private static async Task EscreverAsync(HttpContext context, int status, string erro, string mensagem)
    {
        if (context.Response.HasStarted) return;

        context.Response.Clear();
        context.Response.StatusCode = status;
        context.Response.ContentType = "application/json; charset=utf-8";

        var corpo = JsonSerializer.Serialize(new ApiErrorResponse
        {
            Erro = erro,
            Mensagem = mensagem,
            StatusCode = status,
        }, JsonOptions);

        await context.Response.WriteAsync(corpo);
    }
}
