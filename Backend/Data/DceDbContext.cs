using DCE.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DCE.Api.Data;

/// <summary>
/// Contexto EF Core da aplicação DCE (provider PostgreSQL/Npgsql).
/// Mapeia as tabelas: oficiais, codigo_penal, detentos,
/// historico_comportamento e logs_auditoria.
/// </summary>
public class DceDbContext : DbContext
{
    public DceDbContext(DbContextOptions<DceDbContext> options) : base(options) { }

    public DbSet<Oficial> Oficiais => Set<Oficial>();
    public DbSet<CodigoPenalArtigo> CodigoPenal => Set<CodigoPenalArtigo>();
    public DbSet<Detento> Detentos => Set<Detento>();
    public DbSet<HistoricoComportamento> HistoricoComportamento => Set<HistoricoComportamento>();
    public DbSet<LogAuditoria> LogsAuditoria => Set<LogAuditoria>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        // ------------------------------- oficiais -------------------------------
        b.Entity<Oficial>(e =>
        {
            e.ToTable("oficiais");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Passaporte).HasColumnName("passaporte").HasMaxLength(32).IsRequired();
            e.Property(x => x.Nome).HasColumnName("nome").HasMaxLength(120).IsRequired();
            e.Property(x => x.Email).HasColumnName("email").HasMaxLength(160).IsRequired();
            e.Property(x => x.SenhaHash).HasColumnName("senha_hash").HasMaxLength(255).IsRequired();
            e.Property(x => x.Patente).HasColumnName("patente").HasMaxLength(60).IsRequired();
            e.Property(x => x.NivelAcesso).HasColumnName("nivel_acesso").IsRequired();
            e.Property(x => x.StatusConta)
                .HasColumnName("status_conta")
                .HasMaxLength(20)
                .HasConversion(v => DbEnum.ToDb(v), v => DbEnum.ContaFromDb(v))
                .IsRequired();
            e.Property(x => x.AprovadoPor).HasColumnName("aprovado_por");
            e.Property(x => x.CriadoEm).HasColumnName("criado_em").IsRequired();

            e.HasIndex(x => x.Passaporte).IsUnique();
            e.HasIndex(x => x.Email).IsUnique();
        });

        // ----------------------------- codigo_penal -----------------------------
        b.Entity<CodigoPenalArtigo>(e =>
        {
            e.ToTable("codigo_penal");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Artigo).HasColumnName("artigo").HasMaxLength(40).IsRequired();
            e.Property(x => x.Crime).HasColumnName("crime").HasMaxLength(160).IsRequired();
            e.Property(x => x.Tornozeleira).HasColumnName("tornozeleira").IsRequired();
            e.Property(x => x.PermiteFianca).HasColumnName("permite_fianca").IsRequired();
            e.Property(x => x.ValorFianca).HasColumnName("valor_fianca").HasColumnType("numeric(12,2)").IsRequired();
            e.Property(x => x.TempoMeses).HasColumnName("tempo_meses").IsRequired();
            e.Property(x => x.ValorMulta).HasColumnName("valor_multa").HasColumnType("numeric(12,2)").IsRequired();
            e.Property(x => x.Descricao).HasColumnName("descricao");

            e.HasData(SeedCodigoPenal());
        });

        // -------------------------------- detentos -------------------------------
        b.Entity<Detento>(e =>
        {
            e.ToTable("detentos");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.PassaporteDetento).HasColumnName("passaporte_detento").HasMaxLength(32).IsRequired();
            e.Property(x => x.NomeDetento).HasColumnName("nome_detento").HasMaxLength(120).IsRequired();
            e.Property(x => x.FotoUrl).HasColumnName("foto_url");
            e.Property(x => x.CrimesCometidos)
                .HasColumnName("crimes_cometidos")
                .HasColumnType("text")
                .HasConversion(new JsonListConverter<CrimeCometido>())
                .IsRequired();
            e.Property(x => x.TempoTotalMeses).HasColumnName("tempo_total_meses").IsRequired();
            e.Property(x => x.ValorMultaTotal).HasColumnName("valor_multa_total").HasColumnType("numeric(12,2)").IsRequired();
            e.Property(x => x.ExigeTornozeleira).HasColumnName("exige_tornozeleira").IsRequired();
            e.Property(x => x.PermiteFianca).HasColumnName("permite_fianca").IsRequired();
            e.Property(x => x.StatusPrisao)
                .HasColumnName("status_prisao")
                .HasMaxLength(20)
                .HasConversion(v => DbEnum.ToDb(v), v => DbEnum.PrisaoFromDb(v))
                .IsRequired();
            e.Property(x => x.PolicialCondutor).HasColumnName("policial_condutor").HasMaxLength(120);
            e.Property(x => x.OficialRegistrouId).HasColumnName("oficial_registrou_id");
            e.Property(x => x.DataEntrada).HasColumnName("data_entrada").IsRequired();
            e.Property(x => x.PrevisaoSoltura).HasColumnName("previsao_soltura");
            e.Property(x => x.NivelPericulosidade)
                .HasColumnName("nivel_periculosidade")
                .HasMaxLength(15)
                .HasConversion(DbEnum.ConverterNivel());

            e.HasIndex(x => x.PassaporteDetento);

            e.HasOne(x => x.OficialRegistrou)
                .WithMany(o => o.DetentosRegistrados)
                .HasForeignKey(x => x.OficialRegistrouId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // ------------------------- historico_comportamento -----------------------
        b.Entity<HistoricoComportamento>(e =>
        {
            e.ToTable("historico_comportamento");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.DetentoId).HasColumnName("detento_id").IsRequired();
            e.Property(x => x.TipoRegistro)
                .HasColumnName("tipo_registro")
                .HasMaxLength(30)
                .HasConversion(v => DbEnum.ToDb(v), v => DbEnum.RegistroFromDb(v))
                .IsRequired();
            e.Property(x => x.NivelPericulosidade)
                .HasColumnName("nivel_periculosidade")
                .HasMaxLength(15)
                .HasConversion(DbEnum.ConverterNivel());
            e.Property(x => x.EmSolitaria).HasColumnName("em_solitaria").IsRequired();
            e.Property(x => x.MotivoSolitaria).HasColumnName("motivo_solitaria");
            e.Property(x => x.TerminoSolitaria).HasColumnName("termino_solitaria");
            e.Property(x => x.Descricao).HasColumnName("descricao");
            e.Property(x => x.OficialResponsavelId).HasColumnName("oficial_responsavel_id");
            e.Property(x => x.CriadoEm).HasColumnName("criado_em").IsRequired();

            e.HasOne(x => x.Detento)
                .WithMany(d => d.Historicos)
                .HasForeignKey(x => x.DetentoId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.OficialResponsavel)
                .WithMany(o => o.RegistrosDisciplinares)
                .HasForeignKey(x => x.OficialResponsavelId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // ------------------------------ logs_auditoria ---------------------------
        b.Entity<LogAuditoria>(e =>
        {
            e.ToTable("logs_auditoria");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.OficialId).HasColumnName("oficial_id");
            e.Property(x => x.Acao).HasColumnName("acao").HasMaxLength(80).IsRequired();
            e.Property(x => x.Entidade).HasColumnName("entidade").HasMaxLength(40).IsRequired();
            e.Property(x => x.EntidadeId).HasColumnName("entidade_id");
            e.Property(x => x.Detalhe).HasColumnName("detalhe");
            e.Property(x => x.CriadoEm).HasColumnName("criado_em").IsRequired();

            e.HasOne(x => x.Oficial)
                .WithMany()
                .HasForeignKey(x => x.OficialId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }

    /// <summary>Seed dos artigos do código penal (mesmos dados do modo demonstração).</summary>
    public static IEnumerable<CodigoPenalArtigo> SeedCodigoPenal() => new List<CodigoPenalArtigo>
    {
        new() { Id = 1, Artigo = "ART. 01", Crime = "Roubo à Caixa Registradora", Tornozeleira = false, PermiteFianca = true, ValorFianca = 3000m, TempoMeses = 6, ValorMulta = 1500m, Descricao = "Subtração de valores do caixa de estabelecimentos comerciais." },
        new() { Id = 2, Artigo = "ART. 02", Crime = "Roubo a Loja de Conveniência", Tornozeleira = false, PermiteFianca = true, ValorFianca = 3500m, TempoMeses = 8, ValorMulta = 2000m, Descricao = "Assalto a mão armada a lojas de conveniência e postos." },
        new() { Id = 3, Artigo = "ART. 03", Crime = "Assalto ao Banco Central", Tornozeleira = true, PermiteFianca = false, ValorFianca = 0m, TempoMeses = 60, ValorMulta = 25000m, Descricao = "Ação criminosa de alta periculosidade contra instituição bancária federal." },
        new() { Id = 4, Artigo = "ART. 04", Crime = "Sequestro", Tornozeleira = true, PermiteFianca = false, ValorFianca = 0m, TempoMeses = 45, ValorMulta = 20000m, Descricao = "Privação ilegal da liberdade de um cidadão mediante cárcere privado." },
        new() { Id = 5, Artigo = "ART. 05", Crime = "Porte Ilegal de Arma de Fogo", Tornozeleira = false, PermiteFianca = true, ValorFianca = 5000m, TempoMeses = 12, ValorMulta = 4000m, Descricao = "Porte, posse ou transporte de arma de fogo sem autorização legal." },
        new() { Id = 6, Artigo = "ART. 06", Crime = "Tráfico de Drogas", Tornozeleira = true, PermiteFianca = false, ValorFianca = 0m, TempoMeses = 30, ValorMulta = 12000m, Descricao = "Comércio e distribuição de entorpecentes ilícitos." },
        new() { Id = 7, Artigo = "ART. 07", Crime = "Violação de Condicional", Tornozeleira = true, PermiteFianca = false, ValorFianca = 0m, TempoMeses = 20, ValorMulta = 6000m, Descricao = "Descumprimento das condições impostas na liberdade condicional." },
        new() { Id = 8, Artigo = "ART. 08", Crime = "Direção Perigosa", Tornozeleira = false, PermiteFianca = true, ValorFianca = 1200m, TempoMeses = 4, ValorMulta = 800m, Descricao = "Condução de veículo gerando risco à vida no perímetro urbano." },
        new() { Id = 9, Artigo = "ART. 09", Crime = "Resistência à Prisão", Tornozeleira = false, PermiteFianca = true, ValorFianca = 3000m, TempoMeses = 10, ValorMulta = 2500m, Descricao = "Oposição à ação de agente do Estado no cumprimento de ordem legal." },
        new() { Id = 10, Artigo = "ART. 10", Crime = "Homicídio", Tornozeleira = true, PermiteFianca = false, ValorFianca = 0m, TempoMeses = 90, ValorMulta = 40000m, Descricao = "Privação da vida de outro cidadão, isolado ou em conjunto." },
    };
}
