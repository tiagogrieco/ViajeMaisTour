import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { AgendaTab } from '@/components/AgendaTab';
import { ClientesTab } from '@/components/ClientesTab';
import { DependentesTab } from '@/components/DependentesTab';
import { FornecedoresTab } from '@/components/FornecedoresTab';
import { ProdutosTab } from '@/components/ProdutosTab';
import { CotacoesTab } from '@/components/CotacoesTab';
import { Cliente, Dependente, Fornecedor, Produto, Cotacao, AgendaItem } from '@/types';

export default function Index() {
  const [activeTab, setActiveTab] = useState('agenda');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [dependentes, setDependentes] = useState<Dependente[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);

  // Função segura para fazer parse do JSON
  const safeJsonParse = <T,>(data: string | null, defaultValue: T): T => {
    if (!data || data === 'undefined' || data === 'null') {
      return defaultValue;
    }
    try {
      return JSON.parse(data) as T;
    } catch (error) {
      console.warn('Erro ao fazer parse do JSON:', error);
      return defaultValue;
    }
  };

  // Carregar dados do localStorage
  useEffect(() => {
    const savedClientes = localStorage.getItem('clientes');
    const savedDependentes = localStorage.getItem('dependentes');
    const savedFornecedores = localStorage.getItem('fornecedores');
    const savedProdutos = localStorage.getItem('produtos');
    const savedCotacoes = localStorage.getItem('cotacoes');
    const savedAgenda = localStorage.getItem('agenda');

    setClientes(safeJsonParse<Cliente[]>(savedClientes, []));
    setDependentes(safeJsonParse<Dependente[]>(savedDependentes, []));
    setFornecedores(safeJsonParse<Fornecedor[]>(savedFornecedores, []));
    setProdutos(safeJsonParse<Produto[]>(savedProdutos, []));
    setCotacoes(safeJsonParse<Cotacao[]>(savedCotacoes, []));
    setAgenda(safeJsonParse<AgendaItem[]>(savedAgenda, []));
  }, []);

  // Salvar dados no localStorage
  useEffect(() => {
    if (clientes.length > 0 || localStorage.getItem('clientes')) {
      localStorage.setItem('clientes', JSON.stringify(clientes));
    }
  }, [clientes]);

  useEffect(() => {
    if (dependentes.length > 0 || localStorage.getItem('dependentes')) {
      localStorage.setItem('dependentes', JSON.stringify(dependentes));
    }
  }, [dependentes]);

  useEffect(() => {
    if (fornecedores.length > 0 || localStorage.getItem('fornecedores')) {
      localStorage.setItem('fornecedores', JSON.stringify(fornecedores));
    }
  }, [fornecedores]);

  useEffect(() => {
    if (produtos.length > 0 || localStorage.getItem('produtos')) {
      localStorage.setItem('produtos', JSON.stringify(produtos));
    }
  }, [produtos]);

  useEffect(() => {
    if (cotacoes.length > 0 || localStorage.getItem('cotacoes')) {
      localStorage.setItem('cotacoes', JSON.stringify(cotacoes));
    }
  }, [cotacoes]);

  useEffect(() => {
    if (agenda.length > 0 || localStorage.getItem('agenda')) {
      localStorage.setItem('agenda', JSON.stringify(agenda));
    }
  }, [agenda]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'agenda':
        return (
          <AgendaTab
            agenda={agenda}
            setAgenda={setAgenda}
          />
        );
      case 'clientes':
        return (
          <ClientesTab
            clientes={clientes}
            setClientes={setClientes}
          />
        );
      case 'dependentes':
        return (
          <DependentesTab
            dependentes={dependentes}
            setDependentes={setDependentes}
            clientes={clientes}
          />
        );
      case 'fornecedores':
        return (
          <FornecedoresTab
            fornecedores={fornecedores}
            setFornecedores={setFornecedores}
          />
        );
      case 'produtos':
        return (
          <ProdutosTab
            produtos={produtos}
            setProdutos={setProdutos}
          />
        );
      case 'cotacoes':
        return (
          <CotacoesTab
            cotacoes={cotacoes}
            setCotacoes={setCotacoes}
            clientes={clientes}
            produtos={produtos}
          />
        );
      default:
        return (
          <AgendaTab
            agenda={agenda}
            setAgenda={setAgenda}
          />
        );
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderTabContent()}
    </Layout>
  );
}