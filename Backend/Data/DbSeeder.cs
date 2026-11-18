using DCE.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DCE.Api.Data;

/// <summary>
/// Popula o banco com dados iniciais quando as tabelas estão vazias:
/// conta de Comando (para o primeiro acesso), contas de exemplo por nível
/// e alguns detentos para que a consulta pública já exiba resultados.
/// Executado de forma idempotente na inicialização (controlado por <c>Database:AutoSeed</c>).
/// </summary>
public static class DbSeeder
{
    public const string SenhaPadrao = "dce12345";

    public static void Seed(DceDbContext db)
    {
        if (!db.Oficiais.Any())
        {
            string Hash(string senha) => BCrypt.Net.BCrypt.HashPassword(senha);

            db.Oficiais.AddRange(
                new Oficial
                {
                    Passaporte = "1001",
                    Nome = "Ricardo Salles",
                    Email = "comando@dce.gov",
                    SenhaHash = Hash(SenhaPadrao),
                    Patente = "Diretor Geral",
                    Departamento = Departamentos.Dce,
                    NivelAcesso = 1,
                    StatusConta = StatusConta.Ativo,
                },
                new Oficial
                {
                    Passaporte = "0001",
                    Nome = "Comando Geral",
                    Email = "diretoria@dce.gov",
                    SenhaHash = Hash("dce2026"),
                    Patente = "Diretor Geral",
                    Departamento = Departamentos.Dce,
                    NivelAcesso = 1,
                    StatusConta = StatusConta.Ativo,
                },
                new Oficial
                {
                    Passaporte = "1002",
                    Nome = "Helena Braga",
                    Email = "supervisor@dce.gov",
                    SenhaHash = Hash(SenhaPadrao),
                    Patente = "Capitão",
                    Departamento = Departamentos.Dce,
                    NivelAcesso = 2,
                    StatusConta = StatusConta.Ativo,
                },
                new Oficial
                {
                    Passaporte = "1003",
                    Nome = "Marcos Vieira",
                    Email = "agente@dce.gov",
                    SenhaHash = Hash(SenhaPadrao),
                    Patente = "2º Soldado",
                    Departamento = Departamentos.Dce,
                    NivelAcesso = 3,
                    StatusConta = StatusConta.Ativo,
                });

            db.SaveChanges();
        }

        // Garante o código penal mesmo quando o schema é criado sem migrations
        // (EnsureCreated não aplica o HasData do DbContext).
        if (!db.CodigoPenal.Any())
        {
            db.CodigoPenal.AddRange(DceDbContext.SeedCodigoPenal());
            db.SaveChanges();
        }

        if (!db.Detentos.Any() && db.CodigoPenal.Any())
        {
            var comando = db.Oficiais.First(o => o.NivelAcesso == 1);
            var nivel2 = db.Oficiais.FirstOrDefault(o => o.NivelAcesso == 2) ?? comando;

            Detento Criar(string passaporte, string nome, int[] artigoIds, string policial, StatusPrisao status, NivelPericulosidade nivel, int diasAtras)
            {
                var artigos = db.CodigoPenal.Where(a => artigoIds.Contains(a.Id)).ToList();
                var crimes = artigos.Select(a => new CrimeCometido
                {
                    ArtigoId = a.Id,
                    Artigo = a.Artigo,
                    Crime = a.Crime,
                    TempoMeses = a.TempoMeses,
                    ValorMulta = a.ValorMulta,
                    ValorFianca = a.ValorFianca,
                    Tornozeleira = a.Tornozeleira,
                    PermiteFianca = a.PermiteFianca,
                }).ToList();

                var tempo = crimes.Sum(c => c.TempoMeses);
                var entrada = DateTime.UtcNow.AddDays(-diasAtras);

                return new Detento
                {
                    PassaporteDetento = passaporte,
                    NomeDetento = nome,
                    FotoUrl = null,
                    CrimesCometidos = crimes,
                    TempoTotalMeses = tempo,
                    ValorMultaTotal = crimes.Sum(c => c.ValorMulta),
                    ExigeTornozeleira = crimes.Any(c => c.Tornozeleira),
                    PermiteFianca = crimes.All(c => c.PermiteFianca),
                    StatusPrisao = status,
                    PolicialCondutor = policial,
                    OficialRegistrouId = nivel2.Id,
                    DataEntrada = entrada,
                    PrevisaoSoltura = entrada.AddDays(tempo * 30),
                    NivelPericulosidade = nivel,
                };
            }

            db.Detentos.AddRange(
                Criar("2001", "Carlos Andrade", new[] { 3, 5 }, "PM — 3º Batalhão", StatusPrisao.EmCustodia, NivelPericulosidade.Alto, 20),
                Criar("2002", "Fernanda Lopes", new[] { 1, 8 }, "PC — Divisão de Furtos", StatusPrisao.EmCustodia, NivelPericulosidade.Baixo, 4),
                Criar("2004", "Bruna Carvalho", new[] { 4 }, "PC — Anti-Sequestro", StatusPrisao.Foragido, NivelPericulosidade.Alto, 55));

            db.SaveChanges();
        }
    }
}
