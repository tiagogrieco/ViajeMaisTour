import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ClienteDetalhes.css';
import { FaEdit, FaArrowLeft, FaTrash, FaFilePdf, FaEye, FaArrowCircleRight, FaUsers } from 'react-icons/fa';

export default function ClienteDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [viagens, setViagens] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [loadingCliente, setLoadingCliente] = useState(true);
  const [loadingOrcamentos, setLoadingOrcamentos] = useState(true);
  const [loadingViagens, setLoadingViagens] = useState(true);
  const [error, setError] = useState(null);
  const [orcamentoDetalhado, setOrcamentoDetalhado] = useState(null);

  // Define a URL base do backend usando a variável de ambiente
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchClienteData = async () => {
      setLoadingCliente(true);
      try {
        const response = await fetch(`${BACKEND_URL}/clientes/${id}`);
        if (!response.ok) {
          throw new Error('Cliente não encontrado ou falha ao carregar dados do cliente.');
        }
        const data = await response.json();
        setCliente(data);
      } catch (err) {
        console.error('Erro ao buscar cliente:', err);
        setError(prevError => prevError ? `${prevError}\n${err.message}` : err.message);
      } finally {
        setLoadingCliente(false);
      }
    };

    const fetchOrcamentosData = async () => {
      setLoadingOrcamentos(true);
      try {
        const response = await fetch(`${BACKEND_URL}/orcamentos?cliente_id=${parseInt(id)}`);
        if (!response.ok) {
          throw new Error('Falha ao carregar histórico de orçamentos.');
        }
        const data = await response.json();
        setOrcamentos(data);
      } catch (err) {
        console.error('Erro ao buscar orçamentos:', err);
        setError(prevError => prevError ? `${prevError}\n${err.message}` : err.message);
      } finally {
        setLoadingOrcamentos(false);
      }
    };

    const fetchViagensData = async () => {
        setLoadingViagens(true);
        try {
            const response = await fetch(`${BACKEND_URL}/viagens?cliente_id=${parseInt(id)}&participante_id=${parseInt(id)}`);
            if (!response.ok) {
                throw new Error('Falha ao carregar histórico de viagens.');
            }
            const data = await response.json();
            setViagens(data);
        } catch (err) {
            console.error('Erro ao buscar viagens:', err);
            setError(prevError => prevError ? `${prevError}\n${err.message}` : err.message);
        } finally {
            setLoadingViagens(false);
        }
    };

    fetchClienteData();
    fetchOrcamentosData();
    fetchViagensData();
  }, [id, BACKEND_URL]); // Adicionado id e BACKEND_URL às dependências

  const handleDeleteCliente = async () => {
    if (!cliente) return;
    if (window.confirm(`Tem certeza que deseja excluir o cliente ${cliente.nome}? Essa ação é irreversível e não excluirá orçamentos ou viagens vinculados (conforme Opção A definida).`)) {
      try {
        const res = await fetch(`${BACKEND_URL}/clientes/${cliente.id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          alert(`Cliente ${cliente.nome} excluído com sucesso!`);
          navigate('/clientes');
        } else {
          const errorData = await res.json().catch(() => ({ erro: "Erro desconhecido ao excluir cliente." }));
          alert(`Erro ao excluir o cliente ${cliente.nome}: ${errorData.erro || 'Verifique se há registros associados.'}`);
        }
      } catch (err) {
        console.error('Erro ao excluir cliente:', err);
        alert('Erro de conexão ao tentar excluir o cliente.');
      }
    }
  };
  
  const handleVerDetalhesOrcamento = (orcamento) => {
    setOrcamentoDetalhado(orcamento);
  };

  const fecharModalDetalhes = () => {
    setOrcamentoDetalhado(null);
  };

  const handleConverterParaViagem = (orcamento) => {
    console.log("Dados do orçamento para converter:", orcamento);
    navigate('/viagens/nova-de-orcamento', { state: { orcamentoOrigem: orcamento } });
  };

  const handleExcluirOrcamento = async (orcamentoId, destinoOrcamento) => {
    if (window.confirm(`Tem certeza que deseja excluir o orçamento para "${destinoOrcamento}" (ID: ${orcamentoId})? Esta ação é irreversível.`)) {
      try {
        const res = await fetch(`${BACKEND_URL}/orcamentos/${orcamentoId}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setOrcamentos(prevOrcamentos => prevOrcamentos.filter(orc => orc.id !== orcamentoId));
          alert(`Orçamento para "${destinoOrcamento}" (ID: ${orcamentoId}) excluído com sucesso!`);
        } else {
          const errorData = await res.json().catch(() => null);
          const mensagemErro = errorData && errorData.erro
                             ? errorData.erro
                             : `Status: ${res.status}`;
          alert(`Erro ao excluir o orçamento "${destinoOrcamento}": ${mensagemErro}`);
        }
      } catch (err) {
        console.error('Erro de conexão ao excluir orçamento:', err);
        alert(`Erro de conexão ao tentar excluir o orçamento "${destinoOrcamento}".`);
      }
    }
  };

  if (loadingCliente) return <div className="loading-message">Carregando detalhes do cliente...</div>;
  
  if (error && !cliente) return <div className="error-message">Erro Crítico: {error}</div>;
  
  if (!cliente) return <div className="no-data-message">Cliente não encontrado.</div>;

  return (
    <div className="cliente-detalhes-container">
      <h2>Detalhes do Cliente: {cliente.nome}</h2>
      {error && !loadingOrcamentos && orcamentos.length === 0 && (
          <p className="error-message mini-error">Aviso: {error.includes("histórico de orçamentos") ? error : ""}</p>
      )}

      <div className="cliente-info-grid">
        <div className="info-item"><strong>Nome:</strong><span>{cliente.nome}</span></div>
        <div className="info-item"><strong>Email:</strong><span>{cliente.email}</span> </div>
        <div className="info-item"><strong>Telefone:</strong><span>{cliente.telefone}</span></div>
        {cliente.cpf && (<div className="info-item"><strong>CPF:</strong><span>{cliente.cpf}</span></div>)}
        {cliente.data_nascimento && (<div className="info-item"><strong>Nascimento:</strong><span>{new Date(cliente.data_nascimento).toLocaleDateString('pt-BR')}</span></div>)}
        {cliente.passaporte && (<div className="info-item"><strong>Passaporte:</strong><span>{cliente.passaporte}</span></div>)}
        {cliente.nacionalidade && (<div className="info-item"><strong>Nacionalidade:</strong><span>{cliente.nacionalidade}</span></div>)}
        {cliente.endereco_rua && (
          <div className="info-item full-width">
            <strong>Endereço:</strong>
            <span>
              {cliente.endereco_rua}, {cliente.endereco_numero} {cliente.endereco_complemento && `(${cliente.endereco_complemento})`}
              <br />{cliente.endereco_bairro}, {cliente.endereco_cidade} - {cliente.endereco_estado} (CEP: {cliente.endereco_cep})
            </span>
          </div>
        )}
        {cliente.preferencias_viagem && (<div className="info-item full-width"><strong>Preferências:</strong><span>{cliente.preferencias_viagem}</span></div>)}
        {cliente.observacoes && (<div className="info-item full-width"><strong>Observações:</strong><span>{cliente.observacoes}</span></div>)}
      </div>

      <section className="historico-viagens-section">
        <h3>Histórico de Viagens</h3>
        {loadingViagens ? (
          <p className="loading-message">Carregando viagens...</p>
        ) : viagens.length > 0 ? (
          <table className="historico-viagens-table">
            <thead>
              <tr>
                <th>Destino</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Valor</th>
                <th>Status Pag.</th>
                <th>Status Docs.</th>
                <th>Participantes</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {viagens.map(viagem => (
                <tr key={viagem.id}>
                  <td>{viagem.destino}</td>
                  <td>{viagem.checkin ? new Date(viagem.checkin).toLocaleDateString('pt-BR') : '-'}</td>
                  <td>{viagem.checkout ? new Date(viagem.checkout).toLocaleDateString('pt-BR') : '-'}</td>
                  <td>R$ {parseFloat(viagem.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>{viagem.pagamento_status}</td>
                  <td>{viagem.documento_status}</td>
                  <td>
                    {viagem.participantes_detalhes && viagem.participantes_detalhes.length > 0 ? (
                        <FaUsers title={viagem.participantes_detalhes.map(p => p.nome).join(', ')} />
                    ) : '-'}
                  </td>
                  <td className="actions-cell">
                    <button onClick={() => navigate(`/viagens/editar/${viagem.id}`)} className="btn-action-table btn-view-details" title="Editar Viagem">
                        <FaEdit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data-message">Nenhuma viagem registrada para este cliente.</p>
        )}
      </section>

      <section className="historico-orcamentos-section">
        <h3>Histórico de Orçamentos</h3>
        {loadingOrcamentos ? (
          <p className="loading-message">Carregando orçamentos...</p>
        ) : orcamentos.length > 0 ? (
          <table className="historico-orcamentos-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Destino</th>
                <th className="text-right">Total (R$)</th>
                <th>Observações</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {orcamentos.map(orc => (
                <tr key={orc.id}>
                  <td>{orc.data_formatada || new Date(orc.data_criacao).toLocaleDateString('pt-BR')}</td>
                  <td>{orc.destino}</td>
                  <td className="text-right">R$ {parseFloat(orc.total).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>{orc.observacoes || '-'}</td>
                  <td className="actions-cell">
                     <button
                        onClick={() => handleVerDetalhesOrcamento(orc)}
                        className="btn-action-table btn-view-details"
                        title="Ver Detalhes do Orçamento">
                       <FaEye />
                     </button>
                     <button
                        onClick={() => handleConverterParaViagem(orc)}
                        className="btn-action-table btn-convert-viagem"
                        title="Converter Orçamento para Viagem">
                       <FaArrowCircleRight />
                     </button>
                    <button
                      onClick={() => handleExcluirOrcamento(orc.id, orc.destino)}
                      className="btn-action-table btn-delete-orcamento"
                      style={{color: '#dc3545'}}
                      title="Excluir Orçamento">
                     <FaTrash />
                   </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data-message">Nenhum orçamento registrado para este cliente.</p>
        )}
      </section>

      {orcamentoDetalhado && (
        <div className="modal-overlay" onClick={fecharModalDetalhes}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Detalhes do Orçamento (ID: {orcamentoDetalhado.id})</h4>
            <p><strong>Destino:</strong> {orcamentoDetalhado.destino}</p>
            <p><strong>Data:</strong> {orcamentoDetalhado.data_formatada || new Date(orcamentoDetalhado.data_criacao).toLocaleDateString()}</p>
            <p><strong>Total:</strong> R$ {parseFloat(orcamentoDetalhado.total).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <h5>Itens:</h5>
            <ul>
              {orcamentoDetalhado.itens?.map((item, index) => (
                <li key={index}>{item.descricao}: R$ {parseFloat(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</li>
              ))}
            </ul>
            {orcamentoDetalhado.observacoes && <p><strong>Observações:</strong> {orcamentoDetalhado.observacoes}</p>}
            {orcamentoDetalhado.pdf_filename && <p><strong>Arquivo PDF:</strong> {orcamentoDetalhado.pdf_filename}</p>}
            <button onClick={fecharModalDetalhes} className="btn-modal-close">Fechar</button>
          </div>
        </div>
      )}

      <div className="cliente-detalhes-actions">
        <button onClick={() => navigate('/clientes')} className="btn-back">
          <FaArrowLeft /> Voltar
        </button>
        <button onClick={() => navigate(`/clientes/editar/${cliente.id}`)} className="btn-edit">
          <FaEdit /> Editar Cliente
        </button>
        <button onClick={handleDeleteCliente} className="btn-delete">
          <FaTrash /> Excluir Cliente
        </button>
      </div>
    </div>
  );
}