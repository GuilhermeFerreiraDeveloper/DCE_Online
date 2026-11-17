-- ============================================================================
--  DCE — Departamento de Custódia do Estado
--  Script de criação do banco de dados (PostgreSQL 15+ — Neon.tech / Render)
--  Compatível com o backend ASP.NET Core 8 (EF Core / Npgsql).
--
--  Como aplicar:
--    psql "<sua-connection-string>" -f schema.sql
--  (ou, com o SDK do .NET instalado: dotnet ef database update)
--
--  Observação: este script cria o schema E popula dados iniciais (seed).
--  Use UMA das duas formas de provisionamento (psql OU migrations do EF),
--  não ambas sobre o mesmo banco vazio.
-- ============================================================================

-- Necessário para gerar o hash BCrypt da senha de seed via crypt().
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
--  Tabela: oficiais
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS oficiais (
    id            SERIAL PRIMARY KEY,
    passaporte    VARCHAR(32)  UNIQUE NOT NULL,
    nome          VARCHAR(120) NOT NULL,
    email         VARCHAR(160) UNIQUE NOT NULL,
    foto_url      TEXT,
    senha_hash    VARCHAR(255) NOT NULL,
    patente       VARCHAR(60)  NOT NULL DEFAULT 'Recruta',
    departamento  VARCHAR(60)  NOT NULL DEFAULT 'Departamento de Custódia do Estado',
    nivel_acesso  SMALLINT     NOT NULL DEFAULT 3 CHECK (nivel_acesso IN (1, 2, 3)),
    status_conta  VARCHAR(20)  NOT NULL DEFAULT 'PENDENTE'
                  CHECK (status_conta IN ('PENDENTE', 'ATIVO', 'BLOQUEADO')),
    aprovado_por  INTEGER      REFERENCES oficiais(id) ON DELETE SET NULL,
    criado_em     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Atualização idempotente para bancos criados antes do campo "departamento".
ALTER TABLE oficiais
    ADD COLUMN IF NOT EXISTS departamento VARCHAR(60) NOT NULL
    DEFAULT 'Departamento de Custódia do Estado';

-- Atualização idempotente para bancos criados antes do campo "foto_url" (foto de perfil do oficial).
ALTER TABLE oficiais
    ADD COLUMN IF NOT EXISTS foto_url TEXT;

CREATE INDEX IF NOT EXISTS ix_oficiais_nivel   ON oficiais (nivel_acesso);
CREATE INDEX IF NOT EXISTS ix_oficiais_status  ON oficiais (status_conta);

-- ----------------------------------------------------------------------------
--  Tabela: codigo_penal
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS codigo_penal (
    id              SERIAL PRIMARY KEY,
    artigo          VARCHAR(40)   NOT NULL,
    crime           VARCHAR(160)  NOT NULL,
    tornozeleira    BOOLEAN       NOT NULL DEFAULT FALSE,
    permite_fianca  BOOLEAN       NOT NULL DEFAULT TRUE,
    valor_fianca    NUMERIC(12,2) NOT NULL DEFAULT 0,
    tempo_meses     INTEGER       NOT NULL DEFAULT 0,
    valor_multa     NUMERIC(12,2) NOT NULL DEFAULT 0,
    descricao       TEXT
);

CREATE INDEX IF NOT EXISTS ix_codigo_penal_artigo ON codigo_penal (artigo);

-- ----------------------------------------------------------------------------
--  Tabela: detentos
--  crimes_cometidos: armazenado como TEXT com JSON (a API serializa/desserializa).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS detentos (
    id                     SERIAL PRIMARY KEY,
    passaporte_detento     VARCHAR(32)   NOT NULL,
    nome_detento           VARCHAR(120)  NOT NULL,
    foto_url               TEXT,
    crimes_cometidos       TEXT          NOT NULL DEFAULT '[]',
    tempo_total_meses      INTEGER       NOT NULL DEFAULT 0,
    valor_multa_total      NUMERIC(12,2) NOT NULL DEFAULT 0,
    exige_tornozeleira     BOOLEAN       NOT NULL DEFAULT FALSE,
    permite_fianca         BOOLEAN       NOT NULL DEFAULT TRUE,
    status_prisao          VARCHAR(20)   NOT NULL DEFAULT 'EM_CUSTODIA'
                           CHECK (status_prisao IN ('EM_CUSTODIA', 'LIBERADO', 'FORAGIDO')),
    policial_condutor      VARCHAR(120),
    oficial_registrou_id   INTEGER       REFERENCES oficiais(id) ON DELETE SET NULL,
    data_entrada           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    previsao_soltura       TIMESTAMPTZ,
    nivel_periculosidade   VARCHAR(15)
                           CHECK (nivel_periculosidade IN ('BAIXO', 'MODERADO', 'ALTO'))
);

CREATE INDEX IF NOT EXISTS ix_detentos_passaporte ON detentos (passaporte_detento);
CREATE INDEX IF NOT EXISTS ix_detentos_status     ON detentos (status_prisao);

-- ----------------------------------------------------------------------------
--  Tabela: historico_comportamento
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS historico_comportamento (
    id                     SERIAL PRIMARY KEY,
    detento_id             INTEGER NOT NULL REFERENCES detentos(id) ON DELETE CASCADE,
    tipo_registro          VARCHAR(30) NOT NULL
                           CHECK (tipo_registro IN ('BOM_COMPORTAMENTO', 'MAU_COMPORTAMENTO', 'SOLITARIA')),
    nivel_periculosidade   VARCHAR(15)
                           CHECK (nivel_periculosidade IN ('BAIXO', 'MODERADO', 'ALTO')),
    em_solitaria           BOOLEAN NOT NULL DEFAULT FALSE,
    motivo_solitaria       TEXT,
    termino_solitaria      TIMESTAMPTZ,
    descricao              TEXT,
    oficial_responsavel_id INTEGER REFERENCES oficiais(id) ON DELETE SET NULL,
    criado_em              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_historico_detento ON historico_comportamento (detento_id);

-- ----------------------------------------------------------------------------
--  Tabela: logs_auditoria
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS logs_auditoria (
    id           SERIAL PRIMARY KEY,
    oficial_id   INTEGER REFERENCES oficiais(id) ON DELETE SET NULL,
    acao         VARCHAR(80) NOT NULL,
    entidade     VARCHAR(40) NOT NULL,
    entidade_id  INTEGER,
    detalhe      TEXT,
    criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_logs_criado_em ON logs_auditoria (criado_em DESC);

-- ============================================================================
--  SEED — Código Penal (10 artigos de exemplo)
-- ============================================================================
INSERT INTO codigo_penal (id, artigo, crime, tornozeleira, permite_fianca, valor_fianca, tempo_meses, valor_multa, descricao) VALUES
 (1,  'ART. 01', 'Roubo à Caixa Registradora',   FALSE, TRUE,  3000.00,  6,  1500.00, 'Subtração de valores do caixa de estabelecimentos comerciais.'),
 (2,  'ART. 02', 'Roubo a Loja de Conveniência',  FALSE, TRUE,  3500.00,  8,  2000.00, 'Assalto a mão armada a lojas de conveniência e postos.'),
 (3,  'ART. 03', 'Assalto ao Banco Central',      TRUE,  FALSE,    0.00, 60, 25000.00, 'Ação criminosa de alta periculosidade contra instituição bancária federal.'),
 (4,  'ART. 04', 'Sequestro',                     TRUE,  FALSE,    0.00, 45, 20000.00, 'Privação ilegal da liberdade de um cidadão mediante cárcere privado.'),
 (5,  'ART. 05', 'Porte Ilegal de Arma de Fogo',  FALSE, TRUE,  5000.00, 12,  4000.00, 'Porte, posse ou transporte de arma de fogo sem autorização legal.'),
 (6,  'ART. 06', 'Tráfico de Drogas',             TRUE,  FALSE,    0.00, 30, 12000.00, 'Comércio e distribuição de entorpecentes ilícitos.'),
 (7,  'ART. 07', 'Violação de Condicional',       TRUE,  FALSE,    0.00, 20,  6000.00, 'Descumprimento das condições impostas na liberdade condicional.'),
 (8,  'ART. 08', 'Direção Perigosa',              FALSE, TRUE,  1200.00,  4,   800.00, 'Condução de veículo gerando risco à vida no perímetro urbano.'),
 (9,  'ART. 09', 'Resistência à Prisão',          FALSE, TRUE,  3000.00, 10,  2500.00, 'Oposição à ação de agente do Estado no cumprimento de ordem legal.'),
 (10, 'ART. 10', 'Homicídio',                     TRUE,  FALSE,    0.00, 90, 40000.00, 'Privação da vida de outro cidadão, isolado ou em conjunto.')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
--  SEED — Oficiais (senha padrão de todos: dce12345)
--  O hash é gerado com pgcrypto (compatível com BCrypt.Net-Next / $2a$).
-- ============================================================================
INSERT INTO oficiais (id, passaporte, nome, email, senha_hash, patente, departamento, nivel_acesso, status_conta, aprovado_por) VALUES
 (1, '1001', 'Ricardo Salles', 'comando@dce.gov',    crypt('dce12345', gen_salt('bf', 10)), 'Diretor Geral', 'Departamento de Custódia do Estado',     1, 'ATIVO',     NULL),
 (2, '1002', 'Helena Braga',   'supervisor@dce.gov', crypt('dce12345', gen_salt('bf', 10)), 'Capitão',       'Departamento de Custódia do Estado',     2, 'ATIVO',     1),
 (3, '1003', 'Marcos Vieira',  'agente@dce.gov',     crypt('dce12345', gen_salt('bf', 10)), '2º Soldado',    'Departamento de Custódia do Estado',     3, 'ATIVO',     2),
 (4, '1004', 'Julia Prado',    'recruta@dce.gov',    crypt('dce12345', gen_salt('bf', 10)), 'Recruta',       'Departamento de Polícia do Estado',      3, 'PENDENTE',  NULL),
 (5, '1005', 'Caio Mendonça',  'bloqueado@dce.gov',  crypt('dce12345', gen_salt('bf', 10)), 'Cabo',          'Departamento de Polícia de Vinewood',    3, 'BLOQUEADO', 1)
ON CONFLICT (id) DO NOTHING;

-- Garante o departamento nos registros de exemplo criados antes deste campo.
UPDATE oficiais SET departamento = 'Departamento de Custódia do Estado'
 WHERE id IN (1, 2, 3) AND (departamento IS NULL OR departamento = '');

-- ============================================================================
--  SEED — Detentos de exemplo (para a consulta pública já exibir resultados)
-- ============================================================================
INSERT INTO detentos
  (id, passaporte_detento, nome_detento, foto_url, crimes_cometidos, tempo_total_meses, valor_multa_total,
   exige_tornozeleira, permite_fianca, status_prisao, policial_condutor, oficial_registrou_id,
   data_entrada, previsao_soltura, nivel_periculosidade)
VALUES
 (2001, '2001', 'Carlos Andrade', NULL,
   $json$[
     {"artigoId":3,"artigo":"ART. 03","crime":"Assalto ao Banco Central","tempoMeses":60,"valorMulta":25000,"valorFianca":0,"tornozeleira":true,"permiteFianca":false},
     {"artigoId":5,"artigo":"ART. 05","crime":"Porte Ilegal de Arma de Fogo","tempoMeses":12,"valorMulta":4000,"valorFianca":5000,"tornozeleira":false,"permiteFianca":true}
   ]$json$,
   72, 29000.00, TRUE, FALSE, 'EM_CUSTODIA', 'PM — 3º Batalhão', 2,
   NOW() - INTERVAL '20 days', NOW() + INTERVAL '52 days', 'ALTO'),
 (2002, '2002', 'Fernanda Lopes', NULL,
   $json$[
     {"artigoId":1,"artigo":"ART. 01","crime":"Roubo à Caixa Registradora","tempoMeses":6,"valorMulta":1500,"valorFianca":3000,"tornozeleira":false,"permiteFianca":true},
     {"artigoId":8,"artigo":"ART. 08","crime":"Direção Perigosa","tempoMeses":4,"valorMulta":800,"valorFianca":1200,"tornozeleira":false,"permiteFianca":true}
   ]$json$,
   10, 2300.00, FALSE, TRUE, 'EM_CUSTODIA', 'PC — Divisão de Furtos', 3,
   NOW() - INTERVAL '4 days', NOW() + INTERVAL '6 days', 'BAIXO'),
 (2004, '2004', 'Bruna Carvalho', NULL,
   $json$[
     {"artigoId":4,"artigo":"ART. 04","crime":"Sequestro","tempoMeses":45,"valorMulta":20000,"valorFianca":0,"tornozeleira":true,"permiteFianca":false}
   ]$json$,
   45, 20000.00, TRUE, FALSE, 'FORAGIDO', 'PC — Anti-Sequestro', 1,
   NOW() - INTERVAL '55 days', NOW() - INTERVAL '10 days', 'ALTO')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
--  SEED — Histórico disciplinar de exemplo
-- ============================================================================
INSERT INTO historico_comportamento
  (detento_id, tipo_registro, nivel_periculosidade, em_solitaria, motivo_solitaria, termino_solitaria, descricao, oficial_responsavel_id, criado_em)
VALUES
 (2002, 'BOM_COMPORTAMENTO', 'BAIXO', FALSE, NULL, NULL, 'Participação exemplar nas atividades de ressocialização.', 2, NOW() - INTERVAL '1 day'),
 (2001, 'MAU_COMPORTAMENTO', 'ALTO',  FALSE, NULL, NULL, 'Tentativa de suborno de agente de custódia.', 3, NOW() - INTERVAL '6 days');

-- ============================================================================
--  SEED — Logs de auditoria de exemplo
-- ============================================================================
INSERT INTO logs_auditoria (oficial_id, acao, entidade, entidade_id, detalhe, criado_em) VALUES
 (1, 'APROVACAO_CADASTRO',  'oficiais',  3,    'Aprovou Marcos Vieira como 2º Soldado (Nível 3).', NOW() - INTERVAL '90 days'),
 (2, 'CRIACAO_DETENTO',     'detentos',  2001, 'Registrou a entrada de Carlos Andrade (Passaporte 2001).', NOW() - INTERVAL '20 days'),
 (1, 'BLOQUEIO_OFICIAL',    'oficiais',  5,    'Bloqueou a conta de Caio Mendonça por conduta irregular.', NOW() - INTERVAL '30 days');

-- ============================================================================
--  Ajuste das sequências SERIAL após inserts com IDs explícitos
-- ============================================================================
SELECT setval(pg_get_serial_sequence('oficiais', 'id'),    COALESCE((SELECT MAX(id) FROM oficiais), 1));
SELECT setval(pg_get_serial_sequence('codigo_penal', 'id'), COALESCE((SELECT MAX(id) FROM codigo_penal), 1));
SELECT setval(pg_get_serial_sequence('detentos', 'id'),     COALESCE((SELECT MAX(id) FROM detentos), 1));

-- ============================================================================
--  Fim do script.
-- ============================================================================
