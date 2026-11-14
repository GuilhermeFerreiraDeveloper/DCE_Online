using DCE.Api.Models;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace DCE.Api.Data;

/// <summary>
/// Converte os enums entre a representação C# (PascalCase) e os valores
/// SCREAMING_SNAKE_CASE usados no banco (VARCHAR + CHECK) e na API JSON.
/// Ex.: <c>EmCustodia</c> &lt;-&gt; <c>EM_CUSTODIA</c>.
/// </summary>
public static class DbEnum
{
    public static string ToDb(StatusConta v) => v switch
    {
        StatusConta.Pendente => "PENDENTE",
        StatusConta.Ativo => "ATIVO",
        StatusConta.Bloqueado => "BLOQUEADO",
        _ => throw new ArgumentOutOfRangeException(nameof(v), v, null),
    };

    public static StatusConta ContaFromDb(string v) => v switch
    {
        "PENDENTE" => StatusConta.Pendente,
        "ATIVO" => StatusConta.Ativo,
        "BLOQUEADO" => StatusConta.Bloqueado,
        _ => throw new ArgumentOutOfRangeException(nameof(v), v, null),
    };

    public static string ToDb(StatusPrisao v) => v switch
    {
        StatusPrisao.EmCustodia => "EM_CUSTODIA",
        StatusPrisao.Liberado => "LIBERADO",
        StatusPrisao.Foragido => "FORAGIDO",
        _ => throw new ArgumentOutOfRangeException(nameof(v), v, null),
    };

    public static StatusPrisao PrisaoFromDb(string v) => v switch
    {
        "EM_CUSTODIA" => StatusPrisao.EmCustodia,
        "LIBERADO" => StatusPrisao.Liberado,
        "FORAGIDO" => StatusPrisao.Foragido,
        _ => throw new ArgumentOutOfRangeException(nameof(v), v, null),
    };

    public static string ToDb(TipoRegistro v) => v switch
    {
        TipoRegistro.BomComportamento => "BOM_COMPORTAMENTO",
        TipoRegistro.MauComportamento => "MAU_COMPORTAMENTO",
        TipoRegistro.Solitaria => "SOLITARIA",
        _ => throw new ArgumentOutOfRangeException(nameof(v), v, null),
    };

    public static TipoRegistro RegistroFromDb(string v) => v switch
    {
        "BOM_COMPORTAMENTO" => TipoRegistro.BomComportamento,
        "MAU_COMPORTAMENTO" => TipoRegistro.MauComportamento,
        "SOLITARIA" => TipoRegistro.Solitaria,
        _ => throw new ArgumentOutOfRangeException(nameof(v), v, null),
    };

    public static string ToDb(NivelPericulosidade v) => v switch
    {
        NivelPericulosidade.Baixo => "BAIXO",
        NivelPericulosidade.Moderado => "MODERADO",
        NivelPericulosidade.Alto => "ALTO",
        _ => throw new ArgumentOutOfRangeException(nameof(v), v, null),
    };

    public static NivelPericulosidade PericulosidadeFromDb(string v) => v switch
    {
        "BAIXO" => NivelPericulosidade.Baixo,
        "MODERADO" => NivelPericulosidade.Moderado,
        "ALTO" => NivelPericulosidade.Alto,
        _ => throw new ArgumentOutOfRangeException(nameof(v), v, null),
    };

    /// <summary>
    /// Conversor do enum anulável <see cref="NivelPericulosidade"/> usado em
    /// colunas que podem ser nulas (detentos.nivel_periculosidade e
    /// historico_comportamento.nivel_periculosidade).
    /// </summary>
    public static ValueConverter<NivelPericulosidade?, string?> ConverterNivel() =>
        new(
            v => v == null ? null : ToDb(v.Value),
            v => string.IsNullOrEmpty(v) ? null : PericulosidadeFromDb(v));
}
