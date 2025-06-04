import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './NovaViagemDeOrcamento.css'; // IMPORTAR O NOVO ARQUIVO CSS

function NovaViagemDeOrcamento() {
  const location = useLocation();
  const navigate = useNavigate();

  const orcamentoOrigem = location.state?.orcamentoOrigem;

  const [clientes, setClientes] = useState([]); // Lista de todos os clientes disponíveis
  const [formData, setFormData] = useState({
    cliente_id: '', // Cliente principal
    destino: '',
    checkin: '',
    checkout: '',
    valor: '',
    pagamento_status: 'pendente',
    documento_status: 'pendente',
    observacoes: '',
    participantes_ids: [], // NOVO: Array para IDs dos participantes adicionais
  });

  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [clienteNomeExibicao, setClienteNomeExibicao] = useState('');


  useEffect(() => {
    // Buscar todos os clientes para o select
    fetch('http://localhost:3000/clientes')
      .then(res => res.json())
      .then(data => setClientes(data))
      .catch(err => {
        console.error('Erro ao buscar clientes:', err);
        setErro('Falha ao carregar lista de clientes para participantes.');
      });

    if (orcamentoOrigem) {
      setFormData(prev => ({
        ...prev,
        cliente_id: orcamentoOrigem.cliente_id,
        destino: orcamentoOrigem.destino || '',
        checkin: orcamentoOrigem.checkin ? new Date(orcamentoOrigem.checkin).toISOString().split('T')[0] : '',
        checkout: orcamentoOrigem.checkout ? new Date(orcamentoOrigem.checkout).toISOString().split('T')[0] : '',
        valor: parseFloat(orcamentoOrigem.total || 0).toFixed(2),
        observacoes: orcamentoOrigem.observacoes || '',
        // Ao carregar de um orçamento, o cliente principal é automaticamente um participante.
        // Outros participantes seriam adicionados manualmente.
        participantes_ids: orcamentoOrigem.cliente_id ? [orcamentoOrigem.cliente_id] : [],
      }));
      setClienteNomeExibicao(orcamentoOrigem.nome_cliente || `Cliente ID: ${orcamentoOrigem.cliente_id}`);
    } else {
      setErro("Dados do orçamento de origem não encontrados. Por favor, tente novamente a partir dos detalhes do cliente.");
    }
  }, [orcamentoOrigem, location.state]);

  const handleChange = (e) => {
    const { name, value, options } = e.target;

    if (name === "participantes_ids") {
      const selectedOptions = Array.from(options)
        .filter(option => option.selected)
        .map(option => parseInt(option.value));
      setFormData(prev => ({ ...prev, [name]: selectedOptions }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setMensagem('');
    setErro('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem('');
    setErro('');

    if (!formData.cliente_id || !formData.destino || !formData.checkin || !formData.checkout || !formData.valor) {
      setErro("Campos obrigatórios (Cliente principal, Destino, Check-in, Check-out, Valor) não podem estar vazios.");
      setLoading(false);
      return;
    }

    let valorNumerico;
    try {
        const valorLimpo = String(formData.valor).replace(/\./g, '').replace(',', '.');
        valorNumerico = parseFloat(valorLimpo);
        if (isNaN(valorNumerico)) {
            throw new Error("Valor inválido");
        }
    } catch (error) {
        setErro("O campo Valor da Viagem deve ser um número válido (ex: 1250.75 ou 1.250,75).");
        setLoading(false);
        return;
    }

    // Garante que o cliente principal está sempre na lista de participantes
    const finalParticipantesIds = Array.from(new Set([
        parseInt(formData.cliente_id),
        ...(formData.participantes_ids || []).map(id => parseInt(id))
    ])).filter(id => !isNaN(id));


    const dadosViagemParaSalvar = {
      cliente_id: parseInt(formData.cliente_id), // Cliente principal
      destino: formData.destino,
      checkin: formData.checkin,
      checkout: formData.checkout,
      valor: valorNumerico.toFixed(2),
      pagamento_status: formData.pagamento_status,
      documento_status: formData.documento_status,
      observacoes: formData.observacoes,
      orcamento_origem_id: orcamentoOrigem ? orcamentoOrigem.id : null,
      participantes_ids: finalParticipantesIds, // NOVO: Envia a lista de participantes
    };

    try {
      const response = await fetch('http://localhost:3000/viagens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosViagemParaSalvar),
      });

      if (response.ok) {
        const novaViagem = await response.json();

        // Atualiza o status do orçamento original, se houver
        if (orcamentoOrigem && orcamentoOrigem.id) {
            const updateOrcamentoRes = await fetch(`http://localhost:3000/orcamentos/${orcamentoOrigem.id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status_orcamento: 'convertido', viagem_id_referencia: novaViagem.id })
            });

            if (!updateOrcamentoRes.ok) {
                console.warn('Falha ao atualizar status do orçamento:', await updateOrcamentoRes.json());
            }
        }

        setMensagem(`Viagem para ${novaViagem.destino} criada com sucesso (ID: ${novaViagem.id})! Redirecionando...`);
        setTimeout(() => {
          navigate(`/clientes/${formData.cliente_id}`);
        }, 2500);
      } else {
        const errorData = await response.json().catch(() => ({ erro: "Erro desconhecido ao criar viagem."}));
        setErro(`Erro ao criar viagem: ${errorData.erro || response.statusText}`);
      }
    } catch (err) {
      console.error("Erro ao submeter nova viagem:", err);
      setErro("Falha de conexão ao tentar criar a viagem.");
    } finally {
      setLoading(false);
    }
  };

  if (!orcamentoOrigem && !erro && !location.state) { // Checagem adicional por location.state
    return <div className="loading-message">Carregando dados do orçamento... Se demorar, verifique se o orçamento foi selecionado corretamente.</div>;
  }

  return (
    <div className="nova-viagem-orcamento-container">
      <h2>Criar Viagem a partir de Orçamento</h2>
      {orcamentoOrigem &&
        <p className="orcamento-origem-info">
          Baseado no Orçamento ID: {orcamentoOrigem.id} para o destino: <strong>{orcamentoOrigem.destino}</strong>
        </p>
      }

      {mensagem && <p className="mensagem-feedback sucesso">{mensagem}</p>}
      {erro && <p className="mensagem-feedback erro">{erro}</p>}

      {/* Só renderiza o formulário se tivermos orcamentoOrigem ou se não houver erro bloqueante */}
      {(orcamentoOrigem || !erro) && (
        <form onSubmit={handleSubmit} className="form-nova-viagem">
          <div className="form-section">
            <h3 className="form-section-title">Detalhes do Cliente e Destino</h3>
            <div className="form-group">
              <label>Cliente Principal:</label>
              <input type="text" value={clienteNomeExibicao} readOnly disabled />
            </div>

            <div className="form-group">
              <label htmlFor="destino">Destino *</label>
              <input type="text" id="destino" name="destino" value={formData.destino} onChange={handleChange} required />
            </div>
          </div>

          {/* NOVO: Seção para adicionar participantes */}
          <div className="form-section">
            <h3 className="form-section-title">Outros Participantes (Opcional)</h3>
            <div className="form-group">
              <label htmlFor="participantes_ids">Selecione Clientes Adicionais:</label>
              <select
                name="participantes_ids"
                id="participantes_ids"
                multiple
                value={formData.participantes_ids.map(String)} // Valores do select sempre são strings
                onChange={handleChange}
                className="select-multiple-participantes"
              >
                {clientes
                  .filter(cliente => cliente.id !== parseInt(formData.cliente_id)) // Exclui o cliente principal da lista de seleção
                  .map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome} (ID: {cliente.id})
                    </option>
                  ))}
              </select>
              <p className="hint-text">Mantenha 'Ctrl' (Windows/Linux) ou 'Cmd' (Mac) pressionado para selecionar múltiplos clientes.</p>
            </div>
          </div>


          <div className="form-section">
            <h3 className="form-section-title">Período da Viagem</h3>
            <div className="form-group-inline">
              <div className="form-group">
                <label htmlFor="checkin">Check-in *</label>
                <input type="date" id="checkin" name="checkin" value={formData.checkin} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="checkout">Check-out *</label>
                <input type="date" id="checkout" name="checkout" value={formData.checkout} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Valores e Status</h3>
            <div className="form-group">
              <label htmlFor="valor">Valor Final da Viagem (R$) *</label>
              <input
                type="text" // Mudar para text para melhor formatação e validação manual
                id="valor"
                name="valor"
                placeholder="Ex: 1250,75"
                value={formData.valor}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group-inline">
                <div className="form-group">
                    <label htmlFor="pagamento_status">Status do Pagamento</label>
                    <select id="pagamento_status" name="pagamento_status" value={formData.pagamento_status} onChange={handleChange}>
                        <option value="pendente">Pendente</option>
                        <option value="parcial">Parcial</option>
                        <option value="pago">Pago</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="documento_status">Status dos Documentos</label>
                    <select id="documento_status" name="documento_status" value={formData.documento_status} onChange={handleChange}>
                        <option value="pendente">Pendente</option>
                        <option value="aguardando_vistos">Aguardando Vistos</option>
                        <option value="completo">Completo</option>
                        <option value="atrasado">Atrasado</option>
                    </select>
                </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Observações</h3>
            <div className="form-group">
              <label htmlFor="observacoes">Observações da Viagem</label>
              <textarea id="observacoes" name="observacoes" value={formData.observacoes} onChange={handleChange} rows="4"></textarea>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate(`/clientes/${formData.cliente_id || ''}`)} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Criando Viagem...' : 'Criar Viagem'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default NovaViagemDeOrcamento;