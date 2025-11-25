-- Copie e cole este código no "SQL Editor" do seu painel Supabase para criar o banco de dados

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABELA: CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf_cnpj TEXT,
  email TEXT,
  telefone TEXT,
  data_nascimento DATE,
  endereco TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: DEPENDENTES
CREATE TABLE IF NOT EXISTS dependentes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  data_nascimento DATE,
  parentesco TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: FORNECEDORES
CREATE TABLE IF NOT EXISTS fornecedores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome_fantasia TEXT NOT NULL,
  razao_social TEXT,
  cnpj TEXT,
  email TEXT,
  telefone TEXT,
  categoria TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: PRODUTOS
CREATE TABLE IF NOT EXISTS produtos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,
  tipo TEXT,
  valor_custo NUMERIC(10,2),
  valor_venda NUMERIC(10,2),
  descricao TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: COTAÇÕES
CREATE TABLE IF NOT EXISTS cotacoes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  data_cotacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'Pendente',
  valor_total NUMERIC(10,2),
  observacoes TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: ITENS DA COTAÇÃO
CREATE TABLE IF NOT EXISTS itens_cotacao (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cotacao_id UUID REFERENCES cotacoes(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id) ON DELETE RESTRICT,
  quantidade INTEGER DEFAULT 1,
  valor_unitario NUMERIC(10,2),
  subtotal NUMERIC(10,2)
);

-- TABELA: AGENDA
CREATE TABLE IF NOT EXISTS agenda (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_fim TIMESTAMP WITH TIME ZONE,
  tipo TEXT,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'Agendado',
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- POLÍTICAS DE SEGURANÇA (RLS) - Configuração Aberta para facilitar o uso inicial
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Clientes" ON clientes FOR ALL USING (true);

ALTER TABLE dependentes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Dependentes" ON dependentes FOR ALL USING (true);

ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Fornecedores" ON fornecedores FOR ALL USING (true);

ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Produtos" ON produtos FOR ALL USING (true);

ALTER TABLE cotacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Cotacoes" ON cotacoes FOR ALL USING (true);

ALTER TABLE itens_cotacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Itens" ON itens_cotacao FOR ALL USING (true);

ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Agenda" ON agenda FOR ALL USING (true);