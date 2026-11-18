using System.ComponentModel.DataAnnotations;

namespace DCE.Api.Models.Dtos;

// --- Mural de Avisos ---
public record AvisoDto(
    int Id,
    int AutorId,
    string AutorNome,
    string AutorPatente,
    string Titulo,
    string Mensagem,
    string? ImagemUrl,
    string NivelUrgencia,
    DateTime DataCriacao
);

public record CreateAvisoDto(
    [Required, MaxLength(200)] string Titulo,
    [Required] string Mensagem,
    string? ImagemUrl,
    NivelUrgencia NivelUrgencia = NivelUrgencia.INFORMATIVO
);

// --- Chat Geral ---
public record ChatMessageDto(
    int Id,
    int OficialId,
    string NomeOficial,
    string Patente,
    string Mensagem,
    DateTime DataEnvio
);

public record CreateChatMessageDto(
    [Required] string Mensagem
);

// --- Condecorações ---
public record MedalhaDto(
    int Id,
    string NomeMedalha,
    string Descricao,
    string? Icone,
    DateTime DataConcessao,
    string ConcedidoPorNome,
    string ConcedidoPorPatente
);

public record ConcederMedalhaDto(
    [Required, MaxLength(100)] string NomeMedalha,
    [Required] string Descricao,
    string? Icone
);

// --- Bate-Ponto ---
public record RegistroPontoDto(
    int Id,
    int OficialId,
    string NomeOficial,
    string Patente,
    DateTime Entrada,
    DateTime? Saida,
    int? DuracaoMinutos
);

public record RankingPontoDto(
    int OficialId,
    string NomeOficial,
    string Patente,
    int TotalMinutos,
    int TotalTurnos
);

// --- Recrutamento ---
public record RecrutamentoDto(
    [Required, MaxLength(32)] string Passaporte,
    [Required, MaxLength(120)] string Nome,
    [Required, MaxLength(160)] string Email,
    [Required] string Senha,
    [Required] string RespostasEdital,
    [Required, MaxLength(100)] string DivisaoPretendida
);

// --- Detentos (Procurados) ---
public record ForagidoDto(
    int Id,
    string Passaporte,
    string Nome,
    string? FotoUrl,
    List<string> Crimes,
    decimal? Recompensa
);
