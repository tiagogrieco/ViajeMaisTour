// src/screens/ResumoGerencial.js
// src/screens/ResumoGerencial.js
import React, { useEffect, useState } from 'react';
import Card from '../components/ui/Card'; // Verifique o caminho correto do seu componente Card
import './ResumoGerencial.css';
import { FaMoneyBillWave, FaCalendarCheck, FaTasks, FaExclamationTriangle, FaTicketAlt } from 'react-icons/fa'; // Ícones

function ResumoGerencial() {
  const [resumo, setResumo] = useState({
    viagensMes: 0,
    faturamentoTotal: 0,
    pagamentosPendentes: 0,
    tarefasPendentes: 0,
    ticketMedio: 0,
    totalClientes: 0 // Adicionado
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
            viagensMes: data.viagensMes,
            faturamentoTotal: data.faturamentoTotal,
            pagamentosPendentes: data.pagamentosPendentes,
            tarefasPendentes: data.tarefasPendentes,
            ticketMedio: data.ticketMedio,
            totalClientes: data.totalClientes
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
          icon={<FaTasks color="#8e44ad" />} // Cor do ícone diferente da borda
          borderColor="#8e44ad" // Roxo
          valueColor="#8e44ad"
        />
        <Card 
          title="Viagens Mês" 
          value={resumo.viagensMes} 
          icon={<FaCalendarCheck color="#2980b9" />}
          borderColor="#3498db" // Azul
          valueColor="#2980b9"
        />
        <Card 
          title="Faturamento Total" 
          value={`R$ ${resumo.faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<FaMoneyBillWave color="#27ae60" />}
          borderColor="#2ecc71" // Verde
          valueColor="#27ae60"
        />
        <Card 
          title="Pagamentos Pendentes" 
          value={resumo.pagamentosPendentes} 
          icon={<FaExclamationTriangle color="#c0392b" />}
          borderColor="#e74c3c" // Vermelho
          valueColor="#c0392b"
        />
        <Card 
          title="Tarefas Pendentes" 
          value={resumo.tarefasPendentes} 
          icon={<FaTasks color="#d35400" />}
          borderColor="#f39c12" // Laranja
          valueColor="#d35400"
        />
        <Card 
          title="Ticket Médio" 
          value={`R$ ${resumo.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<FaTicketAlt color="#7f8c8d" />}
          borderColor="#95a5a6" // Cinza
          valueColor="#7f8c8d"
        />
      </div>
      {/* Você pode adicionar mais seções aqui, como gráficos ou listas detalhadas */}
    </div>
  );
}
// Ajuste no componente Card para aceitar ícone e cores de forma mais flexível
// Se você já tem um Card.js, precisará adaptá-lo ou usar este.
// Idealmente, o Card.js seria algo como:
// function Card({ title, value, icon, borderColor, valueColor, textColor = '#333' }) {
//   return (
//     <div className="card" style={{ borderBottomColor: borderColor }}>
//       {icon && <div className="card-icon">{icon}</div>}
//       <h3 style={{ color: textColor }}>{title}</h3>
//       <p style={{ color: valueColor }}>{value}</p>
//     </div>
//   );
// }
// E o Card.css seria ajustado para acomodar .card-icon.
// Por simplicidade, a cor do valor é passada como prop para o Card.js
// e o ResumoGerencial.css já define as cores da borda com classes .blue, .green, etc.
// Vou assumir que seu Card.js pode receber `color` para a borda e o texto do valor como no CSS.

export default ResumoGerencial;