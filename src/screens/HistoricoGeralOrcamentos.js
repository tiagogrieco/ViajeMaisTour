import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaArrowCircleRight, FaTrash, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'; // Importar mais ícones
import './ClienteDetalhes.css'; // Reutilizando temporariamente, idealmente crie um dedicado

function HistoricoGeralOrcamentos() {
  const [orcamentos, setOrcamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [orcamentoDetalhado, setOrcamentoDetalhado] = useState(null);

  useEffect(() => {
    const fetchTodosOrcamentos = async () => {
      setLoading(true);
      setError(null);
      try {
        // Garantir que o status_orcamento e viagem_id_referencia sejam retornados
        const response = await fetch('http://localhost:3000/orcamentos');
        if (!response.ok) {
          throw new Error('Falha ao carregar o histórico geral de orçamentos.');
        }
        const data = await response.json();
        setOrcamentos(data);
      } catch (err) {
        console.error('Erro ao buscar todos os orçamentos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTodosOrcamentos();
  }, []);

  const handleVerDetalhesOrcamento = (orcamento) => {
    setOrcamentoDetalhado(orcamento);
  };

  const fecharModalDetalhes = () => {
    setOrcamentoDetalhado(null);
  };

  const handleConverterParaViagem = (orcamento) => {
    if (orcamento.status_orcamento === 'convertido') {
      alert('Este orçamento já foi convertido em uma viagem.');
      return;
    }
    console.log("Dados do orçamento para converter:", orcamento);
    navigate('/viagens/nova-de-orcamento', { state: { orcamentoOrigem: orcamento } });
  };

  const handleExcluirOrcamento = async (orcamentoId, destinoOrcamento) => {
    if (window.confirm(`Tem certeza que deseja excluir o orçamento para "${destinoOrcamento}" (ID: ${orcamentoId})? Esta ação é irreversível.`)) {
      try {
        const res = await fetch(`http://localhost:3000/orcamentos/${orcamentoId}`, {
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

  if (loading) {
    return <div className="loading-message" style={{margin: '20px auto', textAlign: 'center'}}>Carregando histórico de orçamentos...</div>;
  }

  if (error) {
    return <div className="error-message" style={{margin: '20px auto', textAlign: 'center'}}>Erro: {error}</div>;
  }

  return (
    <div className="cliente-detalhes-container" style={{maxWidth: '1200px'}}>
      <h2>Histórico Geral de Orçamentos</h2>
      {orcamentos.length > 0 ? (
        <table className="historico-orcamentos-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Cliente</th>
              <th>Destino</th>
              <th className="text-right">Total (R$)</th>
              <th>Status</th> {/* NOVO: Coluna para status */}
              <th>Observações</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {orcamentos.map(orc => (
              <tr key={orc.id}>
                <td>{orc.data_formatada || new Date(orc.data_criacao).toLocaleDateString('pt-BR')}</td>
                <td>
                  {orc.nome_cliente ? (
                    <span
                      onClick={() => navigate(`/clientes/${orc.cliente_id}`)}
                      style={{cursor: 'pointer', color: '#0B3D91', textDecoration: 'underline'}}
                      title="Ver detalhes do cliente"
                    >
                      {orc.nome_cliente}
                    </span>
                  ) : orc.cliente_id ? (
                    `ID Cliente: ${orc.cliente_id}`
                  ) : (
                    'Cliente não informado'
                  )}
                </td>
                <td>{orc.destino}</td>
                <td className="text-right">R$ {parseFloat(orc.total).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td> {/* NOVO: Célula para status */}
                    <span className={`orcamento-status-tag ${orc.status_orcamento}`}>
                        {orc.status_orcamento === 'convertido' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                        {' '} {orc.status_orcamento === 'convertido' ? 'Convertido' : 'Pendente'}
                        {orc.viagem_id_referencia && (
                          <span
                            onClick={() => navigate(`/viagens/editar/${orc.viagem_id_referencia}`)}
                            style={{cursor: 'pointer', color: '#0B3D91', textDecoration: 'underline', marginLeft: '5px'}}
                            title="Ver detalhes da viagem"
                          >
                            (Viagem ID: {orc.viagem_id_referencia})
                          </span>
                        )}
                    </span>
                </td>
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
                      className={`btn-action-table btn-convert-viagem ${orc.status_orcamento === 'convertido' ? 'disabled' : ''}`} // Desabilitar se já convertido
                      title={orc.status_orcamento === 'convertido' ? 'Já convertido para viagem' : 'Converter Orçamento para Viagem'}
                      disabled={orc.status_orcamento === 'convertido'}>
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
        <p className="no-data-message" style={{textAlign: 'center'}}>Nenhum orçamento registrado no sistema.</p>
      )}

      {orcamentoDetalhado && (
        <div className="modal-overlay" onClick={fecharModalDetalhes}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Detalhes do Orçamento (ID: {orcamentoDetalhado.id})</h4>
            <p><strong>Cliente:</strong> {orcamentoDetalhado.nome_cliente || (orcamentoDetalhado.cliente_id ? `ID Cliente: ${orcamentoDetalhado.cliente_id}` : 'Cliente não informado')}</p>
            <p><strong>Destino:</strong> {orcamentoDetalhado.destino}</p>
            <p><strong>Data:</strong> {orcamentoDetalhado.data_formatada || new Date(orcamentoDetalhado.data_criacao).toLocaleDateString()}</p>
            <p><strong>Total:</strong> R$ {parseFloat(orcamentoDetalhado.total).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p><strong>Status:</strong> <span className={`orcamento-status-tag ${orcamentoDetalhado.status_orcamento}`}>{orcamentoDetalhado.status_orcamento === 'convertido' ? 'Convertido' : 'Pendente'}</span>
                {orcamentoDetalhado.viagem_id_referencia && (
                     <span
                        onClick={() => navigate(`/viagens/editar/${orcamentoDetalhado.viagem_id_referencia}`)}
                        style={{cursor: 'pointer', color: '#0B3D91', textDecoration: 'underline', marginLeft: '5px'}}
                        title="Ver detalhes da viagem"
                    >
                        (Viagem ID: {orcamentoDetalhado.viagem_id_referencia})
                    </span>
                )}
            </p> {/* NOVO: Exibir status e referência */}
            <h5>Itens:</h5>
            {orcamentoDetalhado.itens && Array.isArray(orcamentoDetalhado.itens) ? (
                <ul>
                {orcamentoDetalhado.itens.map((item, index) => (
                    <li key={index}>{item.descricao}: R$ {parseFloat(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</li>
                ))}
                </ul>
            ) : (
                <p>Itens não disponíveis ou em formato incorreto.</p>
            )}
            {orcamentoDetalhado.observacoes && <p><strong>Observações:</strong> {orcamentoDetalhado.observacoes}</p>}
            {orcamentoDetalhado.pdf_filename && <p><strong>Arquivo PDF:</strong> {orcamentoDetalhado.pdf_filename}</p>}
            <button onClick={fecharModalDetalhes} className="btn-modal-close">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoricoGeralOrcamentos;