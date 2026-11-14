namespace DCE.Api.Models;

/// <summary>Situação da conta de um oficial no processo de aprovação.</summary>
public enum StatusConta
{
    Pendente,
    Ativo,
    Bloqueado,
}

/// <summary>Situação atual do detento no sistema de custódia.</summary>
public enum StatusPrisao
{
    EmCustodia,
    Liberado,
    Foragido,
}

/// <summary>Tipo de registro na linha do tempo disciplinar.</summary>
public enum TipoRegistro
{
    BomComportamento,
    MauComportamento,
    Solitaria,
}

/// <summary>Nível de periculosidade atribuído ao detento.</summary>
public enum NivelPericulosidade
{
    Baixo,
    Moderado,
    Alto,
}
