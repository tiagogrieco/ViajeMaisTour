// src/screens/EditarViagem.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditarViagem.css'; // Importar o CSS
import { FaSave, FaArrowLeft } from 'react-icons/fa';

function EditarViagem() {
  const { id: viagemId } = useParams(); // Renomear id para viagemId para clareza
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]); // NOVO: Lista de todos os clientes
  const [formData, setFormData] = useState({
    cliente_id: '',
    destino: '',
    checkin: '',
    checkout: '',
    valor: '',
    pagamento_status: 'pendente',
    documento_status: 'pendente',
    observacoes: '',
    participantes_ids: [], // NOVO: Array para IDs dos participantes
  });
  const [viagemOriginal, setViagemOriginal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  // Define a URL base do backend usando a variável de ambiente
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchViagemEClientes = async () => {
      setLoading(true);
      setErro('');
      try {
        const [viagemRes, clientesRes] = await Promise.all([
          fetch(`${BACKEND_URL}/viagens/${viagemId}`),
          fetch(`${BACKEND_URL}/clientes`) // Buscar todos os clientes
        ]);

        if (!viagemRes.ok) {
          throw new Error(`Falha ao carregar dados da viagem (ID: ${viagemId}). Status: ${viagemRes.status}`);
        }
        const viagemData = await viagemRes.json();
        
        if (!clientesRes.ok) {
          throw new Error('Falha ao carregar lista de clientes.');
        }
        const clientesData = await clientesRes.json();
        setClientes(clientesData); // Armazena a lista de clientes

        setViagemOriginal({
            destino: viagemData.destino,
            nome_cliente: viagemData.nome_cliente,
            participantes_detalhes: viagemData.participantes_detalhes || [],
        });

        // Formatar datas para o input type="date" (YYYY-MM-DD)
        const checkinFormatado = viagemData.checkin ? new Date(viagemData.checkin).toISOString().split('T')[0] : '';
        const checkoutFormatado = viagemData.checkout ? new Date(viagemData.checkout).toISOString().split('T')[0] : '';
        // Formatar valor para exibição (ex: 1250.75)
        const valorFormatado = parseFloat(String(viagemData.valor || '0').replace(',', '.')).toFixed(2);

        // Extrai os IDs dos participantes existentes
        const existingParticipantsIds = viagemData.participantes_detalhes
            ? viagemData.participantes_detalhes.map(p => p.id)
            : [];

        setFormData({
          cliente_id: viagemData.cliente_id.toString(), // Precisa ser string para o select
          destino: viagemData.destino,
          checkin: checkinFormatado,
          checkout: checkoutFormatado,
          valor: valorFormatado,
          pagamento_status: viagemData.pagamento_status,
          documento_status: viagemData.documento_status,
          observacoes: viagemData.observacoes || '',
          participantes_ids: existingParticipantsIds, // NOVO: Define os participantes existentes
        });

      } catch (err) {
        console.error("Erro ao buscar dados para edição da viagem:", err);
        setErro(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (viagemId) {
      fetchViagemEClientes();
    }
  }, [viagemId, BACKEND_URL]); // Adicionado BACKEND_URL às dependências

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
    setSubmitting(true);
    setMensagem('');
    setErro('');

    if (!formData.cliente_id || !formData.destino || !formData.checkin || !formData.checkout || !formData.valor) {
      setErro("Campos Cliente, Destino, Check-in, Check-out e Valor são obrigatórios.");
      setSubmitting(false);
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
        setErro("O campo Valor da Viagem deve ser um número válido (ex: 1250,75).");
        setSubmitting(false);
        return;
    }

    // Garante que o cliente principal está sempre na lista de participantes
    const finalParticipantesIds = Array.from(new Set([
        parseInt(formData.cliente_id),
        ...(formData.participantes_ids || []).map(id => parseInt(id))
    ])).filter(id => !isNaN(id));


    const dadosViagemParaAtualizar = {
      ...formData,
      cliente_id: parseInt(formData.cliente_id),
      valor: valorNumerico.toFixed(2),
      participantes_ids: finalParticipantesIds, // NOVO: Envia a lista de participantes atualizada
    };

    try {
      const response = await fetch(`${BACKEND_URL}/viagens/${viagemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosViagemParaAtualizar),
      });

      if (response.ok) {
        const viagemAtualizada = await response.json();
        setMensagem(`Viagem para ${viagemAtualizada.destino} atualizada com sucesso! Redirecionando...`);
        setTimeout(() => {
          // Você pode escolher para onde navegar:
          // navigate('/viagens'); // Para a lista de planejamento
          navigate(`/clientes/${viagemAtualizada.cliente_id}`); // Para os detalhes do cliente da viagem
        }, 2000);
      } else {
        const errorData = await response.json().catch(() => ({ erro: "Erro desconhecido ao atualizar viagem."}));
        setErro(`Erro ao atualizar viagem: ${errorData.erro || response.statusText}`);
      }
    } catch (err) {
      console.error("Erro ao submeter atualização da viagem:", err);
      setErro("Falha de conexão ao tentar atualizar a viagem.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-message-editar-viagem">Carregando dados da viagem para edição...</div>;
  }

  if (erro && !formData.destino) { // Se houver erro e nenhum dado do formulário carregado
    return <div className="mensagem-feedback erro">{erro}</div>;
  }

  const tituloCliente = viagemOriginal?.nome_cliente || (formData.cliente_id ? `Cliente ID ${formData.cliente_id}` : 'Cliente');
  const tituloDestino = viagemOriginal?.destino || formData.destino || 'Destino';

  return (
    <div className="editar-viagem-container">
      <h2>Editar Viagem: {tituloDestino} (Cliente: {tituloCliente})</h2>
      {viagemOriginal?.participantes_detalhes && viagemOriginal.participantes_detalhes.length > 1 && (
        <p className="info-participantes-existentes">
          Esta viagem possui {viagemOriginal.participantes_detalhes.length} participantes:
          {' '}
          {viagemOriginal.participantes_detalhes.map(p => p.nome).join(', ')}.
        </p>
      )}

      {mensagem && <p className="mensagem-feedback sucesso">{mensagem}</p>}
      {erro && !submitting && <p className="mensagem-feedback erro">{erro}</p>} {/* Mostra erro apenas se não estiver submetendo para evitar piscar */}

      <form onSubmit={handleSubmit} className="form-editar-viagem">
        <div className="form-section">
          <h3 className="form-section-title">Detalhes do Cliente e Destino</h3>
          <div className="form-group">
            <label htmlFor="cliente_id">Cliente Principal *</label>
            <select id="cliente_id" name="cliente_id" value={formData.cliente_id} onChange={handleChange} required>
              <option value="">Selecione um Cliente</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="destino">Destino *</label>
            <input type="text" id="destino" name="destino" value={formData.destino} onChange={handleChange} required />
          </div>
        </div>

        {/* NOVO: Seção para adicionar/editar participantes */}
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
            <label htmlFor="valor">Valor da Viagem (R$) *</label>
            <input
              type="text" // Usar text para melhor formatação e validação no backend/submit
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
          <button type="button" className="btn-cancelar" onClick={() => navigate('/viagens')} disabled={submitting}>
            <FaArrowLeft /> Cancelar
          </button>
          <button type="submit" className="btn-salvar" disabled={submitting}>
            <FaSave /> {submitting ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}