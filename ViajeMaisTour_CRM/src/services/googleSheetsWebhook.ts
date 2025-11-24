interface WebhookConfig {
  webhookUrl: string;
  spreadsheetId: string;
}

class GoogleSheetsWebhookService {
  private config: WebhookConfig | null = null;

  setConfig(config: WebhookConfig) {
    this.config = config;
    localStorage.setItem('googlesheets_config', JSON.stringify(config));
  }

  getConfig(): WebhookConfig | null {
    if (this.config) return this.config;
    
    const saved = localStorage.getItem('googlesheets_config');
    if (saved) {
      this.config = JSON.parse(saved);
      return this.config;
    }
    
    return null;
  }

  async sendData(sheetName: string, data: Record<string, unknown>[]) {
    const config = this.getConfig();
    if (!config || !config.webhookUrl) {
      throw new Error('Webhook não configurado');
    }

    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'save',
          sheetName,
          data,
          spreadsheetId: config.spreadsheetId
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      throw error;
    }
  }

  async getData(sheetName: string) {
    const config = this.getConfig();
    if (!config || !config.webhookUrl) {
      throw new Error('Webhook não configurado');
    }

    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get',
          sheetName,
          spreadsheetId: config.spreadsheetId
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      throw error;
    }
  }

  async testConnection() {
    const config = this.getConfig();
    if (!config || !config.webhookUrl) {
      return false;
    }

    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test',
          spreadsheetId: config.spreadsheetId
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      return false;
    }
  }

  generateGoogleAppsScript() {
    return `
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const spreadsheetId = data.spreadsheetId;
    const action = data.action;
    
    if (action === 'test') {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Conexão OK'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    
    if (action === 'save') {
      const sheetName = data.sheetName;
      const rowData = data.data;
      
      let sheet = spreadsheet.getSheetByName(sheetName);
      
      // Criar aba se não existir
      if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName);
        
        // Adicionar cabeçalhos baseado no tipo de aba
        const headers = getHeaders(sheetName);
        if (headers.length > 0) {
          sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
          sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
        }
      }
      
      // Limpar dados existentes (exceto cabeçalho)
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
      }
      
      // Adicionar novos dados
      if (rowData.length > 0) {
        const formattedData = formatDataForSheet(sheetName, rowData);
        if (formattedData.length > 0) {
          sheet.getRange(2, 1, formattedData.length, formattedData[0].length).setValues(formattedData);
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: \`Dados salvos em \${sheetName}\`
      })).setMimeType(ContentService.MimeType.JSON);
      
    } else if (action === 'get') {
      const sheetName = data.sheetName;
      let sheet = spreadsheet.getSheetByName(sheetName);
      
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          data: []
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      const lastRow = sheet.getLastRow();
      if (lastRow <= 1) {
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          data: []
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      const range = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
      const values = range.getValues();
      const formattedData = parseDataFromSheet(sheetName, values);
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: formattedData
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getHeaders(sheetName) {
  switch (sheetName) {
    case 'Clientes':
      return ['ID', 'Nome', 'CPF', 'Email', 'Telefone', 'Endereco', 'CEP', 'Data Cadastro'];
    case 'Dependentes':
      return ['ID', 'Nome', 'CPF', 'Cliente ID', 'Parentesco', 'Data Nascimento'];
    case 'Fornecedores':
      return ['ID', 'Nome', 'CNPJ', 'Email', 'Telefone', 'Servicos', 'Endereco'];
    case 'Produtos':
      return ['ID', 'Nome', 'Descricao', 'Preco', 'Categoria', 'Disponivel'];
    case 'Cotacoes':
      return ['ID', 'Cliente', 'Produto', 'Valor', 'Status', 'Data', 'Observacoes'];
    case 'Agenda':
      return ['ID', 'Titulo', 'Data', 'Hora', 'Cliente', 'Tipo', 'Status', 'Observacoes'];
    default:
      return [];
  }
}

function formatDataForSheet(sheetName, data) {
  return data.map(item => {
    switch (sheetName) {
      case 'Clientes':
        return [
          item.id || '',
          item.nome || '',
          item.cpf || '',
          item.email || '',
          item.telefone || '',
          item.endereco || '',
          item.cep || '',
          item.dataCadastro || new Date().toLocaleDateString('pt-BR')
        ];
      case 'Cotacoes':
        return [
          item.id || '',
          item.cliente || '',
          item.produto || '',
          item.valor || '',
          item.status || '',
          item.data || '',
          item.observacoes || ''
        ];
      case 'Agenda':
        return [
          item.id || '',
          item.titulo || '',
          item.data || '',
          item.hora || '',
          item.cliente || '',
          item.tipo || '',
          item.status || '',
          item.observacoes || ''
        ];
      default:
        return Object.values(item);
    }
  });
}

function parseDataFromSheet(sheetName, values) {
  return values.map((row, index) => {
    switch (sheetName) {
      case 'Clientes':
        return {
          id: row[0] || \`cliente_\${index + 1}\`,
          nome: row[1] || '',
          cpf: row[2] || '',
          email: row[3] || '',
          telefone: row[4] || '',
          endereco: row[5] || '',
          cep: row[6] || '',
          dataCadastro: row[7] || ''
        };
      case 'Cotacoes':
        return {
          id: row[0] || \`cotacao_\${index + 1}\`,
          cliente: row[1] || '',
          produto: row[2] || '',
          valor: row[3] || '',
          status: row[4] || '',
          data: row[5] || '',
          observacoes: row[6] || ''
        };
      case 'Agenda':
        return {
          id: row[0] || \`agenda_\${index + 1}\`,
          titulo: row[1] || '',
          data: row[2] || '',
          hora: row[3] || '',
          cliente: row[4] || '',
          tipo: row[5] || '',
          status: row[6] || '',
          observacoes: row[7] || ''
        };
      default:
        return {};
    }
  });
}
`;
  }
}

export const googleSheetsWebhook = new GoogleSheetsWebhookService();