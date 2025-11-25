import { supabase } from '@/lib/supabase';
import { Cliente, Dependente, Fornecedor, Produto, Cotacao, AgendaItem } from '@/types';

// --- CLIENTES ---
const mapClienteFromDB = (db: any): Cliente => ({
  id: db.id,
  nome: db.nome,
  email: db.email,
  telefone: db.telefone,
  cpf: db.cpf || '', // FIXED: db.cpf instead of db.cpf_cnpj
  dataNascimento: db.data_nascimento || '',
  endereco: db.endereco || '',
  cidade: db.cidade || '', 
  estado: db.estado || '', 
  cep: db.cep || '', 
  status: db.status || 'Ativo', 
  observacoes: db.observacoes || '', 
  dataCriacao: db.data_criacao
});

const mapClienteToDB = (app: Partial<Cliente>) => {
  return {
    nome: app.nome,
    cpf: app.cpf, // FIXED: cpf instead of cpf_cnpj
    email: app.email,
    telefone: app.telefone,
    data_nascimento: app.dataNascimento || null,
    endereco: app.endereco,
    cidade: app.cidade,
    estado: app.estado,
    cep: app.cep,
    status: app.status,
    observacoes: app.observacoes
  };
};

// --- DEPENDENTES ---
const mapDependenteFromDB = (db: any): Dependente => ({
  id: db.id,
  clienteId: db.cliente_id,
  nome: db.nome,
  cpf: db.cpf || '', 
  dataNascimento: db.data_nascimento || '',
  parentesco: db.parentesco || '',
  observacoes: db.observacoes || '', 
  dataCriacao: db.data_criacao
});

const mapDependenteToDB = (app: Partial<Dependente>) => {
  return {
    cliente_id: app.clienteId,
    nome: app.nome,
    cpf: app.cpf,
    data_nascimento: app.dataNascimento || null,
    parentesco: app.parentesco,
    observacoes: app.observacoes
  };
};

// --- FORNECEDORES ---
const mapFornecedorFromDB = (db: any): Fornecedor => ({
  id: db.id,
  nome: db.nome_fantasia,
  tipo: db.tipo as any, // FIXED: db.tipo instead of db.categoria
  contato: db.contato || db.razao_social || '',
  telefone: db.telefone || '',
  email: db.email || '',
  cnpj: db.cnpj || '',
  endereco: db.endereco || '', 
  cidade: db.cidade || '', 
  estado: db.estado || '', 
  cep: db.cep || '', 
  observacoes: db.observacoes || '', 
  dataCriacao: db.data_criacao
});

const mapFornecedorToDB = (app: Partial<Fornecedor>) => {
  return {
    nome_fantasia: app.nome,
    tipo: app.tipo, // FIXED: tipo instead of categoria
    contato: app.contato,
    razao_social: app.contato, // Backup
    cnpj: app.cnpj,
    email: app.email,
    telefone: app.telefone,
    endereco: app.endereco,
    cidade: app.cidade,
    estado: app.estado,
    cep: app.cep,
    observacoes: app.observacoes
  };
};

// --- PRODUTOS ---
const mapProdutoFromDB = (db: any): Produto => ({
  id: db.id,
  nome: db.nome,
  categoria: db.tipo as any,
  descricao: db.descricao || '',
  preco: db.valor_venda || 0,
  fornecedorId: db.fornecedor_id || '',
  observacoes: db.observacoes || '',
  dataCriacao: db.data_criacao
});

const mapProdutoToDB = (app: Partial<Produto>) => {
  return {
    nome: app.nome,
    fornecedor_id: app.fornecedorId && app.fornecedorId.trim() !== '' ? app.fornecedorId : null, // FIXED: null instead of empty string
    tipo: app.categoria,
    valor_venda: app.preco,
    descricao: app.descricao,
    observacoes: app.observacoes
  };
};

// --- COTAÇÕES ---
const mapCotacaoFromDB = (db: any): Cotacao => ({
  id: db.id,
  clienteId: db.cliente_id,
  produtoId: '', 
  produtos: [], 
  dataViagem: db.data_viagem || db.data_cotacao || '', 
  dataRetorno: db.data_retorno || '', 
  numeroPassageiros: db.numero_passageiros || 1, 
  valorTotal: db.valor_total || 0,
  status: db.status as any,
  observacoes: db.observacoes || '',
  dataCriacao: db.data_criacao
});

const mapCotacaoToDB = (app: Partial<Cotacao>) => {
  return {
    cliente_id: app.clienteId,
    data_cotacao: app.dataViagem || new Date().toISOString(),
    data_viagem: app.dataViagem,
    data_retorno: app.dataRetorno,
    numero_passageiros: app.numeroPassageiros,
    status: app.status,
    valor_total: app.valorTotal,
    observacoes: app.observacoes
  };
};

// --- AGENDA ---
const mapAgendaFromDB = (db: any): AgendaItem => {
  let data = '';
  let hora = '';
  
  if (db.data_inicio) {
    const start = new Date(db.data_inicio);
    data = start.toISOString().split('T')[0];
    hora = start.toTimeString().substring(0, 5);
  }

  return {
    id: db.id,
    titulo: db.titulo,
    descricao: db.descricao || '',
    data: data,
    hora: hora,
    cliente: '', 
    status: db.status as any,
    observacoes: db.observacoes || '',
    dataCriacao: db.data_criacao
  };
};

const mapAgendaToDB = (app: Partial<AgendaItem>) => {
  let data_inicio = null;
  if (app.data && app.hora) {
    data_inicio = `${app.data}T${app.hora}:00`;
  } else if (app.data) {
    data_inicio = `${app.data}T00:00:00`;
  }
  
  return {
    titulo: app.titulo,
    descricao: app.descricao,
    data_inicio: data_inicio,
    status: app.status,
    observacoes: app.observacoes
  };
};

export const supabaseService = {
  clientes: {
    list: async () => {
      const { data, error } = await supabase.from('clientes').select('*').order('nome');
      if (error) { console.error('Error fetching clientes:', error); return []; }
      return data?.map(mapClienteFromDB) || [];
    },
    create: async (item: any) => {
      const payload = mapClienteToDB(item);
      const { data, error } = await supabase.from('clientes').insert(payload).select().single();
      if (error) throw error;
      return mapClienteFromDB(data);
    },
    update: async (id: string, item: any) => {
      const payload = mapClienteToDB(item);
      const { data, error } = await supabase.from('clientes').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return mapClienteFromDB(data);
    },
    delete: async (id: string) => { await supabase.from('clientes').delete().eq('id', id); }
  },

  dependentes: {
    list: async () => {
      const { data, error } = await supabase.from('dependentes').select('*');
      if (error) { console.error('Error fetching dependentes:', error); return []; }
      return data?.map(mapDependenteFromDB) || [];
    },
    create: async (item: any) => {
      const payload = mapDependenteToDB(item);
      const { data, error } = await supabase.from('dependentes').insert(payload).select().single();
      if (error) throw error;
      return mapDependenteFromDB(data);
    },
    update: async (id: string, item: any) => {
      const payload = mapDependenteToDB(item);
      const { data, error } = await supabase.from('dependentes').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return mapDependenteFromDB(data);
    },
    delete: async (id: string) => { await supabase.from('dependentes').delete().eq('id', id); }
  },

  fornecedores: {
    list: async () => {
      const { data, error } = await supabase.from('fornecedores').select('*');
      if (error) { console.error('Error fetching fornecedores:', error); return []; }
      return data?.map(mapFornecedorFromDB) || [];
    },
    create: async (item: any) => {
      const payload = mapFornecedorToDB(item);
      const { data, error } = await supabase.from('fornecedores').insert(payload).select().single();
      if (error) throw error;
      return mapFornecedorFromDB(data);
    },
    update: async (id: string, item: any) => {
      const payload = mapFornecedorToDB(item);
      const { data, error } = await supabase.from('fornecedores').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return mapFornecedorFromDB(data);
    },
    delete: async (id: string) => { await supabase.from('fornecedores').delete().eq('id', id); }
  },

  produtos: {
    list: async () => {
      const { data, error } = await supabase.from('produtos').select('*');
      if (error) { console.error('Error fetching produtos:', error); return []; }
      return data?.map(mapProdutoFromDB) || [];
    },
    create: async (item: any) => {
      const payload = mapProdutoToDB(item);
      console.log('Payload enviado para produtos:', payload);
      const { data, error } = await supabase.from('produtos').insert(payload).select().single();
      if (error) {
        console.error('Erro ao criar produto:', error);
        throw error;
      }
      return mapProdutoFromDB(data);
    },
    update: async (id: string, item: any) => {
      const payload = mapProdutoToDB(item);
      const { data, error } = await supabase.from('produtos').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return mapProdutoFromDB(data);
    },
    delete: async (id: string) => { await supabase.from('produtos').delete().eq('id', id); }
  },

  cotacoes: {
    list: async () => {
      const { data, error } = await supabase.from('cotacoes').select('*');
      if (error) { console.error('Error fetching cotacoes:', error); return []; }
      return data?.map(mapCotacaoFromDB) || [];
    },
    create: async (item: any) => {
      const payload = mapCotacaoToDB(item);
      const { data, error } = await supabase.from('cotacoes').insert(payload).select().single();
      if (error) throw error;
      return mapCotacaoFromDB(data);
    },
    update: async (id: string, item: any) => {
      const payload = mapCotacaoToDB(item);
      const { data, error } = await supabase.from('cotacoes').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return mapCotacaoFromDB(data);
    },
    delete: async (id: string) => { await supabase.from('cotacoes').delete().eq('id', id); }
  },

  agenda: {
    list: async () => {
      const { data, error } = await supabase.from('agenda').select('*');
      if (error) { console.error('Error fetching agenda:', error); return []; }
      return data?.map(mapAgendaFromDB) || [];
    },
    create: async (item: any) => {
      const payload = mapAgendaToDB(item);
      const { data, error } = await supabase.from('agenda').insert(payload).select().single();
      if (error) throw error;
      return mapAgendaFromDB(data);
    },
    update: async (id: string, item: any) => {
      const payload = mapAgendaToDB(item);
      const { data, error } = await supabase.from('agenda').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return mapAgendaFromDB(data);
    },
    delete: async (id: string) => { await supabase.from('agenda').delete().eq('id', id); }
  }
};