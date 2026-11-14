using DCE.Api.Data;
using DCE.Api.Models;

namespace DCE.Api.Services;

/// <summary>Gravação dos registros de auditoria das ações sensíveis.</summary>
public class AuditoriaService
{
    private readonly DceDbContext _db;

    public AuditoriaService(DceDbContext db) => _db = db;

    /// <summary>Adiciona o log ao contexto (persistido junto com o SaveChanges do fluxo).</summary>
    public void Registrar(int? oficialId, string acao, string entidade, int? entidadeId, string? detalhe)
    {
        _db.LogsAuditoria.Add(new LogAuditoria
        {
            OficialId = oficialId,
            Acao = acao,
            Entidade = entidade,
            EntidadeId = entidadeId,
            Detalhe = detalhe,
            CriadoEm = DateTime.UtcNow,
        });
    }

    /// <summary>Adiciona o log e persiste imediatamente.</summary>
    public async Task RegistrarAsync(int? oficialId, string acao, string entidade, int? entidadeId, string? detalhe)
    {
        Registrar(oficialId, acao, entidade, entidadeId, detalhe);
        await _db.SaveChangesAsync();
    }
}
