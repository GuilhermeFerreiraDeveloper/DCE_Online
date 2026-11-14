using System.Text.Json;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace DCE.Api.Data;

/// <summary>
/// Converte uma lista de objetos para JSON (string) na coluna de banco e vice-versa.
/// Usa as opções "web" do System.Text.Json (camelCase + leitura case-insensitive),
/// garantindo round-trip estável independentemente do provider.
/// </summary>
public class JsonListConverter<T> : ValueConverter<List<T>, string> where T : class
{
    private static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web);

    public JsonListConverter() : base(
        lista => JsonSerializer.Serialize(lista, Options),
        json => string.IsNullOrWhiteSpace(json)
            ? new List<T>()
            : JsonSerializer.Deserialize<List<T>>(json, Options) ?? new List<T>())
    {
    }
}
