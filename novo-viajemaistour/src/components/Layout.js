import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom'; // useLocation importado
import {
  FaHome,
  FaUsers,
  FaCalendarAlt,
  FaTasks,
  FaChartBar,
  FaFileAlt,
  FaListAlt // Exemplo de novo ícone para Histórico de Orçamentos
} from 'react-icons/fa';
import './Layout.css';

export default function Layout() {
  const location = useLocation(); // Para destacar o link ativo

  // Função para verificar se o link deve estar ativo
  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo"> {/* Adicionando uma div para o logo, se você tiver um */}
          {/* <img src="/path-to-your-logo.png" alt="Logo" /> */}
          <h2>Viaje Mais</h2>
        </div>
        <nav>
          {/* Removido <ul> desnecessário se os links são filhos diretos de nav */}
          <Link to="/" className={isActive('/') ? 'active' : ''}>
            <FaHome /> Início
          </Link>
          <Link to="/clientes" className={isActive('/clientes') ? 'active' : ''}>
            <FaUsers /> Clientes
          </Link>
          <Link to="/viagens" className={isActive('/viagens') ? 'active' : ''}>
            <FaCalendarAlt /> Agenda
          </Link>
          <Link to="/tarefas" className={isActive('/tarefas') ? 'active' : ''}>
            <FaTasks /> Tarefas
          </Link>
          {/* NOVO LINK ADICIONADO ABAIXO */}
          <Link to="/orcamentos/historico" className={isActive('/orcamentos/historico') ? 'active' : ''}>
            <FaListAlt /> Hist. Orçamentos
          </Link>
          <Link to="/orcamento" className={isActive('/orcamento') ? 'active' : ''}>
            <FaFileAlt /> Gerar Orçamento
          </Link>
          <Link to="/resumo" className={isActive('/resumo') ? 'active' : ''}>
            <FaChartBar /> Resumo
          </Link>
        </nav>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}