export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  dataNascimento: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  status: 'Ativo' | 'Inativo';
  observacoes?: string;
  dataCriacao: string;
}

export interface Dependente {
  id: string;
  clienteId: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
  parentesco: string;
  observacoes?: string;
  dataCriacao: string;
}

export interface Fornecedor {
  id: string;
  nome: string;
  tipo: 'Operadora' | 'Cia Aérea' | 'Hotel' | 'Seguro' | 'Transporte' | 'Restaurante' | 'Companhia Aérea' | 'Agência' | 'Outro';
  contato: string;
  telefone: string;
  email: string;
  cnpj?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
  dataCriacao: string;
}

export interface Produto {
  id: string;
  nome: string;
  categoria: 'Pacote' | 'Hospedagem' | 'Transporte' | 'Seguro' | 'Passeio' | 'Pacote Nacional' | 'Pacote Internacional' | 'Hotel' | 'Passagem' | 'Outro';
  destino?: string;
  descricao: string;
  preco: number;
  duracao?: string;
  incluso?: string;
  naoIncluso?: string;
  fornecedorId?: string;
  observacoes?: string;
  dataCriacao: string;
}

export interface Cotacao {
  id: string;
  clienteId: string;
  produtoId: string;
  produtos: string[];
  dataViagem: string;
  dataRetorno: string;
  numeroPassageiros: number;
  valorTotal: number;
  status: 'Pendente' | 'Aprovada' | 'Rejeitada' | 'Em Análise' | 'Finalizada';
  observacoes?: string;
  cliente?: string;
  dataVencimento?: string;
  itens?: Record<string, unknown>[];
  comissao?: number;
  percentualComissao?: number;
  dataCriacao: string;
}

export interface AgendaItem {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  hora: string;
  local?: string;
  cliente: string;
  status: 'Agendado' | 'Confirmado' | 'Cancelado' | 'Concluído' | 'Reagendado';
  observacoes?: string;
  dataCriacao: string;
}