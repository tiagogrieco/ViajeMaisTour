// src/screens/EditarCliente.js
import React, { useEffect, useState } from 'react';
import './EditarCliente.css';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';

function EditarCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    data_nascimento: '',
    endereco_rua: '',
    endereco_numero: '',
    endereco_complemento: '',
    endereco_bairro: '',
    endereco_cidade: '',
    endereco_estado: '',
    endereco_cep: '',
    passaporte: '',
    nacionalidade: '',
    preferencias_viagem: '',
    observacoes: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const fetchClienteData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3000/clientes/${id}`); // Certifique-se que a porta está correta
        if (!res.ok) {
          throw new Error('Cliente não encontrado ou erro ao carregar.');
        }
        const data = await res.json();
        const sanitizedData = {};
        for (const key in formData) {
          // Formatar data_nascimento para YYYY-MM-DD se existir
          if (key === 'data_nascimento' && data[key]) {
            sanitizedData[key] = new Date(data[key]).toISOString().split('T')[0];
          } else {
            sanitizedData[key] = data[key] || '';
          }
        }
        setFormData(sanitizedData);
      } catch (err) {
        console.error('Erro ao buscar cliente para edição:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClienteData();
  }, [id]); // Removido formData das dependências para evitar loops

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMensagem('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setError('');

    if (!formData.nome || !formData.email || !formData.telefone) {
      setError('Nome, Email e Telefone são campos obrigatórios.');
      return;
    }
    // Adicione outras validações como no NovoCliente.js se desejar

    try {
      const res = await fetch(`http://localhost:3000/clientes/${id}`, { // Certifique-se que a porta está correta
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMensagem('Cliente atualizado com sucesso!');
        setTimeout(() => {
          navigate(`/clientes/${id}`);
        }, 1500);
      } else {
        const errorData = await res.json().catch(() => ({ message: "Erro desconhecido do servidor." }));
        setError(`Erro ao atualizar o cliente: ${errorData.erro || errorData.message || res.statusText}`);
      }
    } catch (err) {
      console.error('Erro ao atualizar cliente:', err);
      setError('Erro de conexão ao tentar atualizar o cliente.');
    }
  };

  if (loading) {
    return <div className="loading-message">Carregando dados para edição...</div>;
  }

  if (error && !formData.nome) {
     return <div className="error-message">Erro ao carregar dados do cliente: {error}</div>;
  }

  return (
    <div className="editar-cliente-container">
      <h2>Editar Cliente: {formData.nome || ''}</h2>
      {mensagem && <p className="success-message">{mensagem}</p>}
      {error && <p className="error-message">{error}</p>}
      
      <form onSubmit={handleSubmit} className="form-editar-cliente">
        <div className="form-section-title">Dados Pessoais</div>
        <div className="form-group">
          <label htmlFor="nome">Nome Completo *</label>
          <input type="text" id="nome" name="nome" placeholder="Nome Completo" value={formData.nome} onChange={handleChange} required />
        </div>
        <div className="form-group-inline">
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input type="email" id="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="telefone">Telefone *</label>
            <input type="tel" id="telefone" name="telefone" placeholder="Telefone" value={formData.telefone} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-group-inline">
          <div className="form-group">
            <label htmlFor="cpf">CPF</label>
            <input type="text" id="cpf" name="cpf" placeholder="CPF" value={formData.cpf} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="data_nascimento">Data de Nascimento</label>
            <input type="date" id="data_nascimento" name="data_nascimento" value={formData.data_nascimento} onChange={handleChange} />
          </div>
        </div>
         <div className="form-group-inline">
            <div className="form-group">
                <label htmlFor="passaporte">Passaporte</label>
                <input type="text" id="passaporte" name="passaporte" placeholder="Número do Passaporte" value={formData.passaporte} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label htmlFor="nacionalidade">Nacionalidade</label>
                <input type="text" id="nacionalidade" name="nacionalidade" placeholder="Nacionalidade" value={formData.nacionalidade} onChange={handleChange} />
            </div>
        </div>

        <div className="form-section-title">Endereço</div>
        <div className="form-group">
          <label htmlFor="endereco_rua">Rua</label>
          <input type="text" id="endereco_rua" name="endereco_rua" placeholder="Rua" value={formData.endereco_rua} onChange={handleChange} />
        </div>
        <div className="form-group-inline">
          <div className="form-group">
            <label htmlFor="endereco_numero">Número</label>
            <input type="text" id="endereco_numero" name="endereco_numero" placeholder="Número" value={formData.endereco_numero} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="endereco_complemento">Complemento</label>
            <input type="text" id="endereco_complemento" name="endereco_complemento" placeholder="Complemento" value={formData.endereco_complemento} onChange={handleChange} />
          </div>
        </div>
        <div className="form-group-inline">
          <div className="form-group">
            <label htmlFor="endereco_bairro">Bairro</label>
            <input type="text" id="endereco_bairro" name="endereco_bairro" placeholder="Bairro" value={formData.endereco_bairro} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="endereco_cidade">Cidade</label>
            <input type="text" id="endereco_cidade" name="endereco_cidade" placeholder="Cidade" value={formData.endereco_cidade} onChange={handleChange} />
          </div>
        </div>
        <div className="form-group-inline">
          <div className="form-group">
            <label htmlFor="endereco_estado">Estado</label>
            <input type="text" id="endereco_estado" name="endereco_estado" placeholder="Estado (UF)" value={formData.endereco_estado} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="endereco_cep">CEP</label>
            <input type="text" id="endereco_cep" name="endereco_cep" placeholder="CEP" value={formData.endereco_cep} onChange={handleChange} />
          </div>
        </div>

        <div className="form-section-title">Outras Informações</div>
        <div className="form-group">
          <label htmlFor="preferencias_viagem">Preferências de Viagem</label>
          <textarea id="preferencias_viagem" name="preferencias_viagem" placeholder="Preferências de Viagem" value={formData.preferencias_viagem} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="observacoes">Observações</label>
          <textarea id="observacoes" name="observacoes" placeholder="Observações Gerais" value={formData.observacoes} onChange={handleChange} />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate(`/clientes/${id}`)}> {/* Voltar para detalhes do cliente */}
            <FaArrowLeft /> Cancelar
          </button>
          <button type="submit" className="btn-primary">
            <FaSave /> Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditarCliente;