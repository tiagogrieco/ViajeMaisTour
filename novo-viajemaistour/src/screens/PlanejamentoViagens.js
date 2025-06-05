// src/screens/PlanejamentoViagens.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PlanejamentoViagens.css';
import { FaPlus, FaFilter, FaEdit, FaTrash, FaInfoCircle, FaMoneyBillWave, FaFileAlt, FaUsers } from 'react-icons/fa'; // Importar FaUsers

function PlanejamentoViagens() {
  const [viagens, setViagens] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatusPagamento, setFilterStatusPagamento] = useState('');
  const [filterStatusDocumento, setFilterStatusDocumento] = useState('');
  const navigate = useNavigate();

  // Define a URL base do backend usando a variável de ambiente
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [viagensRes, clientesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/viagens`),
        fetch(`${BACKEND_URL}/clientes`)
      ]);

      if (!viagensRes.ok) throw new Error('Erro ao carregar viagens.');
      if (!clientesRes.ok) throw new Error('Erro ao carregar clientes.');

      const viagensData = await viagensRes.json();
      const clientesData = await clientesRes.json();

      setViagens(viagensData);
      setClientes(clientesData);

    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [BACKEND_URL]); // Adicionado BACKEND_URL às dependências

  const getClienteNome = (cliente_id) => {
    const cliente = clientes.find(c => c.id === cliente_id);
    return cliente ? cliente.nome : `ID: ${cliente_id}`;
  };

  const handleDeleteViagem = async (viagemId, destino) => {
    if (window.confirm(`Tem certeza que deseja excluir a viagem para "${destino}"? Essa ação é irreversível!`)) {
      try {
        const res = await fetch(`${BACKEND_URL}/viagens/${viagemId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setViagens(viagens.filter(v => v.id !== viagemId));
          alert(`Viagem para ${destino} excluída com sucesso!`);
        } else {
          const errorData = await res.json().catch(() => ({erro: 'Erro desconhecido.'}));
          alert(`Erro ao excluir a viagem para ${destino}: ${errorData.erro}`);
        }
      } catch (err) {
        console.error('Erro ao excluir viagem:', err);
        alert('Erro de conexão ao tentar excluir a viagem.');
      }
    }
  };

  const filteredViagens = viagens.filter(viagem => {
    const nomeClientePrincipal = getClienteNome(viagem.cliente_id);
    // Combina o nome do cliente principal com os nomes dos participantes para a busca
    const todosNomes = [nomeClientePrincipal, ...(viagem.participantes_detalhes || []).map(p => p.nome)].join(' ').toLowerCase();

    const matchesSearch =
      (viagem.destino?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      todosNomes.includes(searchTerm.toLowerCase()); // NOVO: Busca por nome de participante ou cliente principal

    const matchesPagamento = filterStatusPagamento === '' || viagem.pagamento_status === filterStatusPagamento;
    const matchesDocumento = filterStatusDocumento === '' || viagem.documento_status === filterStatusDocumento;

    return matchesSearch && matchesPagamento && matchesDocumento;
  });

  if (loading) {
    return <div className="loading-message">Carregando planejamento de viagens...</div>;
  }

  if (error) {
    return <div className="error-message">Erro: {error}</div>;
  }

  const handleNovaViagemClick = () => {
    // Idealmente, isso navegaria para um formulário de nova viagem
    // Por enquanto, vamos manter um alerta, mas o correto seria navigate('/viagens/nova');
    alert('Funcionalidade de Adicionar Nova Viagem será implementada em uma tela dedicada!');
    // Para simplificar, vou manter o alerta, mas para um fluxo real, seria:
    // navigate('/viagens/nova'); // Você pode criar um componente `NovaViagem` para isso
  };
  
  const handleEditViagem = (viagemId) => {
    navigate(`/viagens/editar/${viagemId}`);
  };


  return (
    <div className="planejamento-container">
      <div className="planejamento-header-wrapper">
        <div className="planejamento-header">
          <h2>📍 Planejamento de Viagens</h2>
          <button onClick={handleNovaViagemClick} className="btn-add-viagem">
            <FaPlus /> Nova Viagem
          </button>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-input-wrapper">
          <FaFilter className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por destino, cliente principal ou participante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          value={filterStatusPagamento}
          onChange={(e) => setFilterStatusPagamento(e.target.value)}
          className="filter-select"
        >
          <option value="">Status Pagamento (Todos)</option>
          <option value="pendente">Pendente</option>
          <option value="parcial">Parcial</option>
          <option value="pago">Pago</option>
          <option value="cancelado">Cancelado</option>
        </select>

        <select
          value={filterStatusDocumento}
          onChange={(e) => setFilterStatusDocumento(e.target.value)}
          className="filter-select"
        >
          <option value="">Status Documentos (Todos)</option>
          <option value="pendente">Pendente</option>
          <option value="aguardando_vistos">Aguardando Vistos</option>
          <option value="completo">Completo</option>
          <option value="atrasado">Atrasado</option>
        </select>
      </div>

      {filteredViagens.length === 0 ? (
        <div className="no-viagens-message">
          Nenhuma viagem encontrada com os filtros aplicados.
          {!searchTerm && !filterStatusPagamento && !filterStatusDocumento && " Comece adicionando uma nova viagem!"}
        </div>
      ) : (
        <div className="viagens-grid">
          {filteredViagens.map((viagem) => (
            <div className="viagem-card" key={viagem.id}>
              <div className="card-header">
                <h3>{viagem.destino}</h3>
                <span className="viagem-id">ID #{viagem.id}</span>
              </div>
              <div className="card-body">
                <p><strong>Cliente Principal:</strong> {viagem.nome_cliente}</p> {/* Exibe o nome do cliente principal */}
                {viagem.participantes_detalhes && viagem.participantes_detalhes.length > 1 && (
                    <p className="participantes-list">
                        <FaUsers style={{ marginRight: '5px' }} />
                        <strong>Participantes:</strong> {viagem.participantes_detalhes
                            .filter(p => p.id !== viagem.cliente_id) // Exclui o cliente principal da lista de "outros"
                            .map(p => p.nome).join(', ')}
                    </p>
                )}
                <p><strong>Check-in:</strong> {viagem.checkin ? new Date(viagem.checkin).toLocaleDateString('pt-BR') : '-'}</p>
                <p><strong>Check-out:</strong> {viagem.checkout ? new Date(viagem.checkout).toLocaleDateString('pt-BR') : '-'}</p>
                <p><strong>Valor:</strong> R$ {parseFloat(viagem.valor?.replace(',', '.') || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>

                <div className="status-tags">
                  <span className={`status-tag pagamento-status ${viagem.pagamento_status}`}>
                    <FaMoneyBillWave /> Pag.: {viagem.pagamento_status ? (viagem.pagamento_status.charAt(0).toUpperCase() + viagem.pagamento_status.slice(1)) : 'N/A'}
                  </span>
                  <span className={`status-tag documento-status ${viagem.documento_status}`}>
                    <FaFileAlt /> Docs: {viagem.documento_status ? (viagem.documento_status.charAt(0).toUpperCase() + viagem.documento_status.slice(1).replace('_', ' ')) : 'N/A'}
                  </span>
                </div>

                {viagem.observacoes && <p className="obs">📝 {viagem.observacoes}</p>}
              </div>
              <div className="card-actions">
                <button onClick={() => navigate(`/clientes/${viagem.cliente_id}`)} className="btn-action btn-detalhes" title="Ver detalhes do cliente">
                  <FaInfoCircle /> Cliente
                </button>
                <button onClick={() => handleEditViagem(viagem.id)} className="btn-action btn-editar">
                  <FaEdit /> Editar Viagem
                </button>
                <button onClick={() => handleDeleteViagem(viagem.id, viagem.destino)} className="btn-action btn-excluir">
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