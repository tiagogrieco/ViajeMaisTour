import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TelaInicial.css';
import logo from '../assets/logo.png'; 
import { FaUsers, FaUserPlus, FaCalendarAlt, FaCheckCircle, FaChartBar, FaFileInvoice, FaPlane, FaPlaneDeparture } from 'react-icons/fa';
import Card from '../components/ui/Card'; 

function TelaInicial() {
  const navigate = useNavigate();
  const [saudacao, setSaudacao] = useState('');
  const [resumoDados, setResumoDados] = useState({
    viagensMes: 0,
    pagamentosPendentes: 0,
    tarefasPendentes: 0,
    totalRevenue: 0
  });
  const [loadingResumo, setLoadingResumo] = useState(true);
  const [errorResumo, setErrorResumo] = useState(null);

  const [proximasViagens, setProximasViagens] = useState([]);
  const [loadingProximasViagens, setLoadingProximasViagens] = useState(true);
  const [errorProximasViagens, setErrorProximasViagens] = useState(null);

  useEffect(() => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) {
      setSaudacao('Bom dia');
    } else if (hora >= 12 && hora < 18) {
      setSaudacao('Boa tarde');
    } else {
      setSaudacao('Boa noite');
    }
  }, []);

  useEffect(() => {
    const fetchResumoData = async () => {
      setLoadingResumo(true);
      try {
        const resumoResponse = await fetch('http://localhost:3000/resumo');
        if (!resumoResponse.ok) {
            throw new Error('Erro ao carregar dados de resumo do backend.');
        }
        const resumoDataBackend = await resumoResponse.json();
        setResumoDados({
            viagensMes: resumoDataBackend.viagensMes,
            pagamentosPendentes: resumoDataBackend.pagamentosPendentes,
            tarefasPendentes: resumoDataBackend.tarefasPendentes,
            totalRevenue: resumoDataBackend.faturamentoTotal 
        });

      } catch (err) {
        console.error('Erro ao buscar resumo:', err);
        setErrorResumo('Não foi possível carregar o resumo rápido.');
      } finally {
        setLoadingResumo(false);
      }
    };

    const fetchProximasViagens = async () => {
      setLoadingProximasViagens(true);
      try {
        const response = await fetch('http://localhost:3000/viagens/proximas');
        if (!response.ok) {
          throw new Error('Falha ao carregar próximas viagens.');
        }
        const data = await response.json();
        setProximasViagens(data);
      } catch (err) {
        console.error('Erro ao buscar próximas viagens:', err);
        setErrorProximasViagens(err.message);
      } finally {
        setLoadingProximasViagens(false);
      }
    };

    fetchResumoData();
    fetchProximasViagens();
  }, []);

  // FUNÇÃO DE FORMATAR DATA CORRIGIDA
  const formatarData = (dataISO) => {
    if (!dataISO) return '-';
    const dataObj = new Date(dataISO); // Alteração principal aqui
    if (isNaN(dataObj.getTime())) { // Verifica se a data é inválida
        console.warn('Tentativa de formatar data inválida:', dataISO);
        return 'Data Inválida'; // Retorna uma string amigável em caso de falha
    }
    // Usar timeZone: 'UTC' garante que a data seja interpretada como é (meia-noite UTC)
    // e não convertida para o fuso local que poderia mudar o dia.
    return dataObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };


  const botoesPrincipais = [
    { icon: <FaUsers className="icon" />, label: 'Clientes', rota: '/clientes' },
    { icon: <FaPlane className="icon" />, label: 'Viagens', rota: '/viagens' },
    { icon: <FaCheckCircle className="icon" />, label: 'Tarefas', rota: '/tarefas' },
    { icon: <FaFileInvoice className="icon" />, label: 'Hist. Orçamentos', rota: '/orcamentos/historico' }, // Rota atualizada
  ];

  const botoesAcoesRapidas = [
    { icon: <FaUserPlus className="icon" />, label: 'Novo Cliente', rota: '/clientes/novo' },
    { icon: <FaFileInvoice className="icon" />, label: 'Gerar Orçamento', rota: '/orcamento' }, // Adicionada ação rápida
    { icon: <FaChartBar className="icon" />, label: 'Ver Resumo Completo', rota: '/resumo' },
  ];

  return (
    <div className="home-container">
      <div className="home-content">
        <img src={logo} alt="Logo Viaje Mais Tour" className="home-logo" />
        {/* Saudação ajustada para não ter nome fixo, pode vir de um estado de usuário logado no futuro */}
        <h1 className="home-title">🌎 {saudacao}!</h1> 
        <p className="home-subtitle">Seu painel de controle da Viaje Mais Tour.</p>

        <div className="resumo-rapido">
          <h3>Visão Rápida</h3>
          {loadingResumo ? (
            <p className="loading-message-home">Carregando resumo...</p>
          ) : errorResumo ? (
            <p className="error-message-home">{errorResumo}</p>
          ) : (
            <div className="cards-resumo-rapido">
              <Card title="Viagens Mês" value={resumoDados.viagensMes} color="blue" />
              <Card title="Pagamentos Pendentes" value={resumoDados.pagamentosPendentes} color="red" />
              <Card title="Tarefas Abertas" value={resumoDados.tarefasPendentes} color="orange" />
              <Card title="Faturamento Total" value={`R$ ${parseFloat(resumoDados.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} color="green" />
            </div>
          )}
        </div>

        <div className="proximas-viagens-section">
          <div className="section-title"><FaPlaneDeparture style={{ marginRight: '10px'}} /> Próximas Viagens</div>
          {loadingProximasViagens ? (
            <p className="loading-message-home">Carregando próximas viagens...</p>
          ) : errorProximasViagens ? (
            <p className="error-message-home">{errorProximasViagens}</p>
          ) : proximasViagens.length > 0 ? (
            <ul className="proximas-viagens-list">
              {proximasViagens.map(viagem => (
                <li key={viagem.id} className="proxima-viagem-item" onClick={() => navigate(`/clientes/${viagem.cliente_id}`)} title="Ver detalhes do cliente">
                  <span className="destino">{viagem.destino}</span>
                  <span className="cliente">Cliente: {viagem.nome_cliente}</span>
                  <span className="data">Check-in: {formatarData(viagem.checkin)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data-message-home">Nenhuma viagem programada para os próximos dias.</p>
          )}
        </div>

        <div className="home-sections-buttons">
          <div className="section-title">Navegação Principal</div>
          <div className="home-buttons-grid">
            {botoesPrincipais.map((botao, index) => (
              <div key={index} className="icon-button" onClick={() => navigate(botao.rota)}>
                {botao.icon}
                <span>{botao.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="home-sections-buttons">
          <div className="section-title">Ações Rápidas</div>
          <div className="home-buttons-grid">
            {botoesAcoesRapidas.map((botao, index) => (
              <div key={index} className="icon-button small" onClick={() => navigate(botao.rota)}>
                {botao.icon}
                <span>{botao.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="home-footer">Versão 1.0 • Feito com 💙 por Tiago</p>
    </div>
  );
}

export default TelaInicial;