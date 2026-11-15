namespace DCE.Api.Models;

/// <summary>
/// Departamentos policiais do estado. O departamento é um campo informativo
/// do oficial (não altera as patentes nem o nível de acesso).
/// </summary>
public static class Departamentos
{
    public const string Estado = "Departamento de Polícia do Estado";
    public const string Vinewood = "Departamento de Polícia de Vinewood";
    public const string MissionRow = "Departamento de Polícia de Mission Row";
    public const string LaMesa = "Departamento de Polícia de La Mesa";
    public const string Vespucci = "Departamento de Polícia de Vespucci";
    public const string Norte = "Departamento de Polícia do Norte";
    public const string Justica = "Departamento de Polícia de Justiça";
    public const string Dce = "Departamento de Custódia do Estado";

    /// <summary>Todos os departamentos aceitos pelo sistema.</summary>
    public static readonly IReadOnlyList<string> Todos = new[]
    {
        Estado, Vinewood, MissionRow, LaMesa, Vespucci, Norte, Justica, Dce,
    };

    /// <summary>Verifica se o valor informado corresponde a um departamento válido.</summary>
    public static bool EhValido(string? valor) =>
        !string.IsNullOrWhiteSpace(valor) && Todos.Contains(valor.Trim());
}
