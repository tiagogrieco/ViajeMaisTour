// src/screens/NovoCliente.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NovoCliente.css';

function NovoCliente() {
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
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  // Define a URL base do backend usando a variável de ambiente
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');

    // Validação básica
    if (!formData.nome || !formData.email || !formData.telefone) {
      setErro('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Validação de email (simples)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErro('Por favor, insira um email válido.');
      return;
    }

    // Validação de telefone (apenas dígitos)
    const telefoneRegex = /^\d+$/;
    if (formData.telefone && !telefoneRegex.test(formData.telefone)) { // Permite telefone vazio, mas se preenchido, só dígitos
      setErro('Por favor, insira um telefone válido (apenas números).');
      return;
    }

    // Validação de CPF (muito básica)
    if (formData.cpf && formData.cpf.length !== 11) { // Permite CPF vazio, mas se preenchido, 11 dígitos
      setErro('Por favor, insira um CPF válido (11 dígitos).');
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/clientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMensagem('Cliente cadastrado com sucesso!');
        setFormData({
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
        setTimeout(() => {
          navigate('/clientes');
        }, 1500);
      } else {
        setErro('Erro ao cadastrar o cliente.');
      }
    } catch (err) {
      console.error('Erro:', err);
      setErro('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div className="novo-cliente-container">
      <h2>Novo Cliente</h2>
      {mensagem && <p className="mensagem">{mensagem}</p>}
      {erro && <p className="erro">{erro}</p>}
      <form className="form-cliente" onSubmit={handleSubmit}>
        <input type="text" name="nome" placeholder="Nome Completo *" value={formData.nome} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email *" value={formData.email} onChange={handleChange} required />
        <input type="tel" name="telefone" placeholder="Telefone *" value={formData.telefone} onChange={handleChange} required />
        <input type="text" name="cpf" placeholder="CPF" value={formData.cpf} onChange={handleChange} />
        <input type="date" name="data_nascimento" placeholder="Data de Nascimento" value={formData.data_nascimento} onChange={handleChange} />

        <input type="text" name="endereco_rua" placeholder="Rua" value={formData.endereco_rua} onChange={handleChange} />
        <input type="text" name="endereco_numero" placeholder="Número" value={formData.endereco_numero} onChange={handleChange} />
        <input type="text" name="endereco_complemento" placeholder="Complemento" value={formData.endereco_complemento} onChange={handleChange} />
        <input type="text" name="endereco_bairro" placeholder="Bairro" value={formData.endereco_bairro} onChange={handleChange} />
        <input type="text" name="endereco_cidade" placeholder="Cidade" value={formData.endereco_cidade} onChange={handleChange} />
        <input type="text" name="endereco_estado" placeholder="Estado" value={formData.endereco_estado} onChange={handleChange} />
        <input type="text" name="endereco_cep" placeholder="CEP" value={formData.endereco_cep} onChange={handleChange} />

        <input type="text" name="passaporte" placeholder="Passaporte" value={formData.passaporte} onChange={handleChange} />
        <input type="text" name="nacionalidade" placeholder="Nacionalidade" value={formData.nacionalidade} onChange={handleChange} />
        <textarea name="preferencias_viagem" placeholder="Preferências de Viagem" value={formData.preferencias_viagem} onChange={handleChange} />
        <textarea name="observacoes" placeholder="Observações" value={formData.observacoes} onChange={handleChange} />

        <button type="submit">Cadastrar Cliente</button>
      </form>
    </div>
  );
}