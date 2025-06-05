// src/screens/OrcamentoViagem.js
import React, { useState, useEffect } from 'react';
import './OrcamentoViagem.css';
import { FaPlus, FaTrash, FaFilePdf, FaCalculator } from 'react-icons/fa';

import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Garante que o plugin autotable seja carregado

export default function OrcamentoViagem() {
  const [clientes, setClientes] = useState([]);
  const [dados, setDados] = useState({
    cliente_id: '',
    destino: '',
    checkin: '',
    checkout: '',
    observacoes: '',
  });
  const [itensOrcamento, setItensOrcamento] = useState([
    { id: Date.now(), descricao: 'Passagem Aérea', valor: '' }, // Usar Date.now() para IDs temporários únicos
    { id: Date.now() + 1, descricao: 'Hospedagem', valor: '' },
  ]);
  const [totalOrcamento, setTotalOrcamento] = useState(0);
  const [selectedClientName, setSelectedClientName] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  // Define a URL base do backend usando a variável de ambiente
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetch(`${BACKEND_URL}/clientes`) // Certifique-se que a porta está correta
      .then(res => res.json())
      .then(data => setClientes(data))
      .catch(err => {
        console.error('Erro ao buscar clientes:', err);
        setErro('Falha ao carregar lista de clientes.');
      });
  }, [BACKEND_URL]); // Adicionado BACKEND_URL às dependências

  useEffect(() => {
    const cliente = clientes.find(c => c.id === parseInt(dados.cliente_id));
    setSelectedClientName(cliente ? cliente.nome : '');
  }, [dados.cliente_id, clientes]);

  const parseFormattedCurrency = (valorStringFormatado) => {
    if (!valorStringFormatado || typeof valorStringFormatado !== 'string') {
      return 0;
    }
    const semPontosMilhar = valorStringFormatado.replace(/\./g, '');
    const comPontoDecimal = semPontosMilhar.replace(',', '.');
    return parseFloat(comPontoDecimal) || 0;
  };

  useEffect(() => {
    const total = itensOrcamento.reduce((acc, item) => {
      const valorNumerico = parseFormattedCurrency(item.valor);
      return acc + valorNumerico;
    }, 0);
    setTotalOrcamento(total);
  }, [itensOrcamento]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDados(prev => ({ ...prev, [name]: value }));
    setMensagem('');
    setErro('');
  };

  const handleItemChange = (id, field, value) => {
    const updatedItens = itensOrcamento.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setItensOrcamento(updatedItens);
  };

  const handleAddItem = () => {
    setItensOrcamento(prev => [
      ...prev,
      { id: Date.now(), descricao: '', valor: '' } // Usar Date.now() para ID temporário
    ]);
  };

  const handleRemoveItem = (id) => {
    setItensOrcamento(prev => prev.filter(item => item.id !== id));
  };

  const formatCurrencyForDisplay = (value) => {
    const valorString = value?.toString() || '0';
    // Limpeza para garantir que estamos trabalhando com um número válido antes de formatar
    const semPontosMilhar = valorString.replace(/\./g, ''); // Remove separadores de milhar
    const comPontoDecimalCorreto = semPontosMilhar.replace(',', '.'); // Converte vírgula decimal para ponto
    const numValue = parseFloat(comPontoDecimalCorreto) || 0;

    return numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const salvarOrcamentoNoServidor = async (orcamentoData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/orcamentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orcamentoData),
      });

      if (response.ok) {
        return true;
      } else {
        const errorData = await response.json().catch(() => ({ message: "Erro desconhecido do servidor." }));
        console.error("Erro ao salvar orçamento no servidor:", response.status, errorData);
        setErro(`Erro ao salvar orçamento no histórico: ${errorData.message || response.statusText}`);
        return false;
      }
    } catch (error) {
      console.error('Falha de conexão ao salvar orçamento:', error);
      setErro('Falha de conexão ao tentar salvar o orçamento no histórico.');
      return false;
    }
  };

  const gerarPDF = async () => {
    setMensagem('');
    setErro('');

    if (!dados.cliente_id || !dados.destino || !dados.checkin || !dados.checkout || itensOrcamento.length === 0 || itensOrcamento.some(item => !item.descricao || !item.valor)) {
      setErro('Por favor, preencha todos os campos obrigatórios, incluindo descrição e valor de cada item do orçamento.');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18); // Ajuste no tamanho da fonte do título
    doc.setTextColor(44, 62, 80); // Cor #2c3e50
    doc.text("Orçamento de Viagem - Viaje Mais Tour", 105, 22, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(52, 73, 94); // Cor #34495e
    let currentY = 35;
    doc.text(`Cliente: ${selectedClientName}`, 14, currentY);
    currentY += 7;
    doc.text(`Destino: ${dados.destino}`, 14, currentY);
    currentY += 7;
    doc.text(`Período: ${dados.checkin ? new Date(dados.checkin).toLocaleDateString('pt-BR') : ''} a ${dados.checkout ? new Date(dados.checkout).toLocaleDateString('pt-BR') : ''}`, 14, currentY);
    currentY += 10;


    const tableColumn = ["Descrição", "Valor (R$)"];
    const tableRows = [];
    const itensParaSalvar = [];

    itensOrcamento.forEach(item => {
      const valorNumerico = parseFormattedCurrency(item.valor);
      tableRows.push([
        item.descricao || 'Item sem descrição',
        valorNumerico.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      ]);
      itensParaSalvar.push({
        descricao: item.descricao || 'Item sem descrição',
        valor: valorNumerico.toFixed(2)
      });
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: currentY,
        theme: 'striped', // Tema 'striped' ou 'grid'
        headStyles: { fillColor: [11, 61, 145], textColor: [255,255,255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 2.5 },
        columnStyles: { 1: { halign: 'right' } },
        didDrawPage: function (data) { // Adiciona rodapé com número da página
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text('Página ' + doc.internal.getNumberOfPages(), data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
    });

    const finalY = doc.autoTable.previous.finalY || currentY; // Garante que finalY tem um valor

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(44, 62, 80);
    doc.text(`TOTAL: R$ ${totalOrcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 195, finalY + 12, { align: 'right' });

    currentY = finalY + 20; // Espaço após o total

    if (dados.observacoes) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(86, 101, 115); // Cor #566573
        doc.text("Observações:", 14, currentY);
        currentY += 5;
        const splitObservations = doc.splitTextToSize(dados.observacoes, 180); // Largura de 180mm
        doc.text(splitObservations, 14, currentY);
    }
    
    const nomeArquivo = `Orcamento_${selectedClientName?.replace(/\s/g, '_') || 'Cliente'}_${dados.destino?.replace(/\s/g, '_') || 'Viagem'}.pdf`;
    doc.save(nomeArquivo);
    
    const orcamentoData = {
      cliente_id: parseInt(dados.cliente_id),
      data_criacao: new Date().toISOString(),
      destino: dados.destino,
      checkin: dados.checkin,
      checkout: dados.checkout,
      itens: itensParaSalvar,
      total: totalOrcamento.toFixed(2),
      observacoes: dados.observacoes,
      pdf_filename: nomeArquivo
    };

    const salvoComSucesso = await salvarOrcamentoNoServidor(orcamentoData);

    if (salvoComSucesso) {
      setMensagem('PDF gerado e orçamento salvo no histórico do cliente com sucesso!');
      // Limpar formulário opcionalmente
      setDados({ cliente_id: '', destino: '', checkin: '', checkout: '', observacoes: '' });
      setItensOrcamento([{ id: Date.now(), descricao: '', valor: '' }]);
    } else {
      // A mensagem de erro já foi definida por salvarOrcamentoNoServidor
      // Apenas garantimos que a mensagem de sucesso não apareça.
      setMensagem('');
    }
  };

  return (
    <div className="orcamento-container">
      <h2><FaFilePdf style={{ marginRight: '10px' }} /> Gerar Orçamento de Viagem</h2>
      {mensagem && <p className="mensagem sucesso">{mensagem}</p>}
      {erro && <p className="mensagem erro">{erro}</p>}

      <div className="form-orcamento">
        <section className="form-section">
          <h3>Informações da Viagem e Cliente</h3>
          <label htmlFor="cliente_id">Cliente *</label>
          <select name="cliente_id" id="cliente_id" value={dados.cliente_id} onChange={handleChange} required>
            <option value="">Selecione um Cliente</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
            ))}
          </select>

          <label htmlFor="destino">Destino *</label>
          <input type="text" name="destino" id="destino" value={dados.destino} onChange={handleChange} required />

          <label htmlFor="checkin">Check-in *</label>
          <input type="date" name="checkin" id="checkin" value={dados.checkin} onChange={handleChange} required />

          <label htmlFor="checkout">Check-out *</label>
          <input type="date" name="checkout" id="checkout" value={dados.checkout} onChange={handleChange} required />
        </section>

        <section className="form-section">
          <h3>Itens do Orçamento</h3>
          <div className="itens-list">
            {itensOrcamento.map(item => (
              <div key={item.id} className="orcamento-item-row">
                <input
                  type="text"
                  placeholder="Descrição do Item *"
                  value={item.descricao}
                  onChange={(e) => handleItemChange(item.id, 'descricao', e.target.value)}
                  required
                />
                <div className="input-group">
                  <span className="input-group-text">R$</span>
                  <input
                    type="text"
                    placeholder="Valor *"
                    value={item.valor}
                    onChange={(e) => handleItemChange(item.id, 'valor', e.target.value.replace(/[^0-9,.]/g, ''))}
                    onBlur={(e) => handleItemChange(item.id, 'valor', formatCurrencyForDisplay(e.target.value))}
                    required
                  />
                </div>
                {itensOrcamento.length > 1 && ( // Só mostra o botão de remover se houver mais de 1 item
                    <button type="button" onClick={() => handleRemoveItem(item.id)} className="btn-remove-item" title="Remover Item">
                        <FaTrash />
                    </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={handleAddItem} className="btn-add-item">
            <FaPlus /> Adicionar Item
          </button>

          <div className="orcamento-total">
            <FaCalculator /> Total Estimado: <span>R$ {totalOrcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </section>

        <section className="form-section">
          <h3>Observações Adicionais</h3>
          <textarea name="observacoes" id="observacoes" placeholder="Detalhes, condições, inclusões/exclusões..." value={dados.observacoes} onChange={handleChange}></textarea>
        </section>

        <button type="button" onClick={gerarPDF} className="btn-gerar-pdf">
          <FaFilePdf /> Gerar PDF e Salvar no Histórico
        </button>
      </div>

      {/* Pré-visualização mantida igual */}
      {selectedClientName && (dados.destino || dados.checkin || dados.checkout || itensOrcamento.some(item => item.descricao || item.valor)) && (
        <div className="orcamento-preview">
          <h3>Pré-visualização do Orçamento</h3>
          <div className="preview-section">
            <h4>Detalhes do Cliente e Viagem</h4>
            <p><strong>Cliente:</strong> {selectedClientName}</p>
            <p><strong>Destino:</strong> {dados.destino}</p>
            <p><strong>Check-in:</strong> {dados.checkin ? new Date(dados.checkin).toLocaleDateString('pt-BR') : ''}</p>
            <p><strong>Check-out:</strong> {dados.checkout ? new Date(dados.checkout).toLocaleDateString('pt-BR') : ''}</p>
          </div>

          <div className="preview-section">
            <h4>Itens Orçados</h4>
            {itensOrcamento.length === 0 ? (
              <p>Nenhum item adicionado.</p>
            ) : (
              <table className="orcamento-table">
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th className="text-right">Valor (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {itensOrcamento.map(item => (
                    <tr key={item.id}>
                      <td>{item.descricao || 'Item sem descrição'}</td>
                      <td className="text-right">R$ {parseFormattedCurrency(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td><strong>TOTAL</strong></td>
                    <td className="text-right"><strong>R$ {totalOrcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          {dados.observacoes && (
            <div className="preview-section">
              <h4>Observações</h4>
              <p className="observacoes-text">{dados.observacoes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}