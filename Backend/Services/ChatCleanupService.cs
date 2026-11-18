using DCE.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace DCE.Api.Services;

/// <summary>
/// Serviço em segundo plano que remove mensagens do chat de dias anteriores às 00:00 UTC.
/// </summary>
public class ChatCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ChatCleanupService> _logger;

    public ChatCleanupService(IServiceProvider serviceProvider, ILogger<ChatCleanupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Chat Cleanup Service iniciado.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<DceDbContext>();

                var hoje = DateTime.UtcNow.Date;
                var mensagensAntigas = await context.ChatMensagens
                    .Where(m => m.DataEnvio < hoje)
                    .ToListAsync(stoppingToken);

                if (mensagensAntigas.Any())
                {
                    _logger.LogInformation("Removendo {Count} mensagens antigas do chat.", mensagensAntigas.Count);
                    context.ChatMensagens.RemoveRange(mensagensAntigas);
                    await context.SaveChangesAsync(stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao limpar o chat.");
            }

            // Aguarda 1 hora antes de verificar novamente
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }
}
