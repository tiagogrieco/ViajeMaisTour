// src/screens/GestaoClientes.js
import React, { useEffect, useState } from 'react';
import './GestaoClientes.css';
import { Link } from 'react-router-dom';
import { FaSearch, FaEdit, FaTrash, FaInfoCircle, FaPlus } from 'react-icons/fa';

function GestaoClientes() {
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define a URL base do backend usando a variável de ambiente
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/clientes`);
      if (!res.ok) {
        throw new Error('Erro ao carregar clientes. Tente novamente mais tarde.');
      }
      const data = await res.json();
      setClientes(data);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [BACKEND_URL]); // Adicionado BACKEND_URL às dependências

  const handleDelete = async (id, nomeCliente) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente ${nomeCliente}? Essa ação é irreversível!`)) {
      try {
        const res = await fetch(`${BACKEND_URL}/clientes/${id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setClientes(clientes.filter(cliente => cliente.id !== id));
          alert(`Cliente ${nomeCliente} excluído com sucesso!`);
        } else {
          // Tenta ler a mensagem de erro do backend
          const errorData = await res.json().catch(() => null); // Tenta parsear o JSON, se falhar, retorna null
          if (errorData && errorData.erro) {
            alert(`Erro ao excluir ${nomeCliente}: ${errorData.erro}`);
          } else {
            alert(`Erro ao excluir o cliente ${nomeCliente}. Status: ${res.status}`);
          }
        }
      } catch (err) {
        console.error('Erro de conexão ao excluir cliente:', err);
        alert('Erro de conexão ao tentar excluir o cliente.');
      }
    }
  };

  const filteredClientes = clientes.filter(cliente =>
    (cliente.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (cliente.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (cliente.cpf || '').includes(searchTerm)
  );

  if (loading) {
    return <div className="loading-message">Carregando clientes...</div>;
  }

  if (error) {
    return <div className="error-message">Erro: {error}</div>;
  }

  return (
    <div className="gestao-clientes-modern">
      <h2 className="titulo">👥 Gestão de Clientes</h2>

      <div className="clientes-actions-bar">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <Link to="/clientes/novo" className="btn-add-cliente">
          <FaPlus /> Novo Cliente
        </Link>
      </div>

      {filteredClientes.length === 0 ? (
        <div className="no-clientes-message">
          Nenhum cliente encontrado. {searchTerm && "Ajuste sua busca ou"} <Link to="/clientes/novo">cadastre um novo cliente</Link>.
        </div>
      ) : (
        <div className="clientes-container">
          {filteredClientes.map(cliente => (
            <div key={cliente.id} className="cliente-card">
              <div className="cliente-header">
                <h3>{cliente.nome}</h3>
                <span className="cliente-id">ID #{cliente.id}</span>
              </div>
              <div className="cliente-info">
                <p>📞 {cliente.telefone}</p>
                <p>✉️ {cliente.email}</p>
                {cliente.cpf && <p>🆔 CPF: {cliente.cpf}</p>}
                {cliente.data_nascimento && <p>🎂 Nasc: {new Date(cliente.data_nascimento).toLocaleDateString('pt-BR')}</p>}
                {cliente.endereco_cidade && <p>📍 {cliente.endereco_cidade} - {cliente.endereco_estado}</p>}
                {cliente.passaporte && <p>🛂 Passaporte: {cliente.passaporte}</p>}
                {cliente.observacoes && <p className="obs">📝 {cliente.observacoes}</p>}
              </div>
              <div className="card-actions">
                <Link to={`/clientes/${cliente.id}`} className="btn-action btn-detalhes">
                  <FaInfoCircle /> Detalhes
                </Link>
                <Link to={`/clientes/editar/${cliente.id}`} className="btn-action btn-editar">
                  <FaEdit /> Editar
                </Link>
                <button onClick={() => handleDelete(cliente.id, cliente.nome)} className="btn-action btn-excluir">
                  <FaTrash /> Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}