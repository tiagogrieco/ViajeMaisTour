import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <<== IMPORTAR useNavigate
import './PlanejamentoViagens.css';
import { FaPlus, FaFilter, FaEdit, FaTrash, FaInfoCircle, FaMoneyBillWave, FaFileAlt } from 'react-icons/fa';

function PlanejamentoViagens() {
  const [viagens, setViagens] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatusPagamento, setFilterStatusPagamento] = useState('');
  const [filterStatusDocumento, setFilterStatusDocumento] = useState('');
  const navigate = useNavigate(); // <<== INICIALIZAR useNavigate

  const fetchData = async () => {
    try {
      setLoading(true);
      const [viagensRes, clientesRes] = await Promise.all([
        fetch('http://localhost:3000/viagens'),
        fetch('http://localhost:3000/clientes')
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
  }, []);

  const getClienteNome = (cliente_id) => {
    const cliente = clientes.find(c => c.id === cliente_id);
    return cliente ? cliente.nome : `ID: ${cliente_id}`;
  };

  const handleDeleteViagem = async (viagemId, destino) => {
    if (window.confirm(`Tem certeza que deseja excluir a viagem para "${destino}"? Essa ação é irreversível!`)) {
      try {
        const res = await fetch(`http://localhost:3000/viagens/${viagemId}`, {
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
    const nomeCliente = getClienteNome(viagem.cliente_id);
    const matchesSearch =
      (viagem.destino?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (nomeCliente?.toLowerCase() || '').includes(searchTerm.toLowerCase());

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
  };
  
  const handleEditViagem = (viagemId) => {
    navigate(`/viagens/editar/${viagemId}`); // <<== NAVEGAR PARA A ROTA DE EDIÇÃO
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
            placeholder="Buscar por destino ou cliente..."
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
                <p><strong>Cliente:</strong> {getClienteNome(viagem.cliente_id)}</p>
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
                <button onClick={() => handleEditViagem(viagem.id)} className="btn-action btn-editar"> {/* <<== CHAMAR handleEditViagem */}
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

export default PlanejamentoViagens;