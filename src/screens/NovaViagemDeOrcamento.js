import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './NovaViagemDeOrcamento.css'; // IMPORTAR O NOVO ARQUIVO CSS

function NovaViagemDeOrcamento() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const orcamentoOrigem = location.state?.orcamentoOrigem;

  const [formData, setFormData] = useState({
    cliente_id: '',
    cliente_nome: '', 
    destino: '',
    checkin: '',
    checkout: '',
    valor: '', 
    pagamento_status: 'pendente', 
    documento_status: 'pendente', 
    observacoes: '',
  });

  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [clienteNomeExibicao, setClienteNomeExibicao] = useState('');


  useEffect(() => {
    if (orcamentoOrigem) {
      setFormData({
        cliente_id: orcamentoOrigem.cliente_id,
        destino: orcamentoOrigem.destino || '',
        checkin: orcamentoOrigem.checkin ? new Date(orcamentoOrigem.checkin).toISOString().split('T')[0] : '',
        checkout: orcamentoOrigem.checkout ? new Date(orcamentoOrigem.checkout).toISOString().split('T')[0] : '',
        // Usar o nome do cliente que já vem no orçamento (se você o adicionou lá, ou buscar)
        // Se o seu objeto 'orcamentoOrigem' não tiver 'nome_cliente', você precisará buscá-lo
        // Por exemplo, se 'orcamentoOrigem.cliente_nome' existir:
        cliente_nome: orcamentoOrigem.nome_cliente || `Cliente ID: ${orcamentoOrigem.cliente_id}`, 
        valor: parseFloat(orcamentoOrigem.total || 0).toFixed(2),
        pagamento_status: 'pendente',
        documento_status: 'pendente',
        observacoes: orcamentoOrigem.observacoes || '',
      });
      // Para exibir o nome do cliente corretamente, seria ideal que `orcamentoOrigem`
      // já contivesse o nome do cliente, ou faríamos um fetch aqui.
      // Vamos assumir que o nome do cliente pode ser passado ou buscado.
      // Temporariamente, se `orcamentoOrigem.nome_cliente` não existir, exibimos o ID.
      setClienteNomeExibicao(orcamentoOrigem.nome_cliente || `Cliente ID: ${orcamentoOrigem.cliente_id}`);


    } else {
      setErro("Dados do orçamento de origem não encontrados. Por favor, tente novamente a partir dos detalhes do cliente.");
    }
  }, [orcamentoOrigem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem('');
    setErro('');

    if (!formData.cliente_id || !formData.destino || !formData.checkin || !formData.checkout || !formData.valor) {
      setErro("Campos obrigatórios (Destino, Check-in, Check-out, Valor) não podem estar vazios.");
      setLoading(false);
      return;
    }
    
    let valorNumerico;
    try {
        // Tenta converter o valor para número, lidando com ',' e '.'
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


    const dadosViagemParaSalvar = {
      cliente_id: parseInt(formData.cliente_id),
      destino: formData.destino,
      checkin: formData.checkin,
      checkout: formData.checkout,
      valor: valorNumerico.toFixed(2), // Envia o valor numérico formatado
      pagamento_status: formData.pagamento_status,
      documento_status: formData.documento_status,
      observacoes: formData.observacoes,
    };

    try {
      const response = await fetch('http://localhost:3000/viagens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosViagemParaSalvar),
      });

      if (response.ok) {
        const novaViagem = await response.json();
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
              <label>Cliente:</label>
              <input type="text" value={clienteNomeExibicao} readOnly disabled />
            </div>

            <div className="form-group">
              <label htmlFor="destino">Destino *</label>
              <input type="text" id="destino" name="destino" value={formData.destino} onChange={handleChange} required />
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