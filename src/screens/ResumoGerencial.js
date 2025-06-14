// src/screens/ResumoGerencial.js
import React, { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import './ResumoGerencial.css';
import { FaMoneyBillWave, FaCalendarCheck, FaTasks, FaExclamationTriangle, FaTicketAlt } from 'react-icons/fa';

function ResumoGerencial() {
  const [resumo, setResumo] = useState({
    viagensMes: 0,
    faturamentoTotal: 0,
    pagamentosPendentes: 0,
    tarefasPendentes: 0,
    ticketMedio: 0,
    totalClientes: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define a URL base do backend usando a variável de ambiente
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchResumoData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BACKEND_URL}/resumo`); // Use a porta correta
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.erro || errorData.detalhes || 'Erro ao buscar dados do resumo.');
        }
        const data = await response.json();
        setResumo({
            viagensMes: data.viagensMes || 0,
            faturamentoTotal: data.faturamentoTotal || 0,
            pagamentosPendentes: data.pagamentosPendentes || 0,
            tarefasPendentes: data.tarefasPendentes || 0,
            ticketMedio: data.ticketMedio || 0,
            totalClientes: data.totalClientes || 0
        });
      } catch (err) {
        console.error('Erro ao buscar dados do resumo:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResumoData();
  }, [BACKEND_URL]); // Adicionado BACKEND_URL às dependências

  if (loading) return <p className="loading-message">Carregando resumo gerencial...</p>;
  if (error) return <p className="error-message">Erro ao carregar resumo: {error}</p>;

  return (
    <div className="resumo-container">
      <h2>📊 Resumo Gerencial</h2>
      <div className="cards">
        <Card 
          title="Total de Clientes" 
          value={resumo.totalClientes} 
          icon={<FaTasks color="#8e44ad" />}
          borderColor="#8e44ad"
          valueColor="#8e44ad"
        />
        <Card 
          title="Viagens no Mês" 
          value={resumo.viagensMes} 
          icon={<FaCalendarCheck color="#2980b9" />}
          borderColor="#3498db"
          valueColor="#2980b9"
        />
        <Card 
          title="Faturamento Total" 
          value={`R$ ${resumo.faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<FaMoneyBillWave color="#27ae60" />}
          borderColor="#2ecc71"
          valueColor="#27ae60"
        />
        <Card 
          title="Pagamentos Pendentes" 
          value={resumo.pagamentosPendentes} 
          icon={<FaExclamationTriangle color="#c0392b" />}
          borderColor="#e74c3c"
          valueColor="#c0392b"
        />
        <Card 
          title="Tarefas Pendentes" 
          value={resumo.tarefasPendentes} 
          icon={<FaTasks color="#d35400" />}
          borderColor="#f39c12"
          valueColor="#d35400"
        />
        <Card 
          title="Ticket Médio" 
          value={`R$ ${resumo.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<FaTicketAlt color="#7f8c8d" />}
          borderColor="#95a5a6"
          valueColor="#7f8c8d"
        />
      </div>
    </div>
  );
}

export default ResumoGerencial;