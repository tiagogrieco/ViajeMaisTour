export const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
  if (!data || data.length === 0) {
    alert('Não há dados para exportar');
    return;
  }

  // Obter cabeçalhos das chaves do primeiro objeto
  const headers = Object.keys(data[0]);
  
  // Criar conteúdo CSV
  const csvContent = [
    // Cabeçalhos
    headers.join(','),
    // Dados
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escapar aspas e vírgulas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  // Criar e baixar arquivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const importFromCSV = (file: File): Promise<Record<string, string>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          reject(new Error('Arquivo CSV deve ter pelo menos cabeçalho e uma linha de dados'));
          return;
        }
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const obj: Record<string, string> = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          return obj;
        });
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsText(file);
  });
};

export const exportAllData = () => {
  const allData = {
    clientes: JSON.parse(localStorage.getItem('clientes') || '[]'),
    dependentes: JSON.parse(localStorage.getItem('dependentes') || '[]'),
    fornecedores: JSON.parse(localStorage.getItem('fornecedores') || '[]'),
    produtos: JSON.parse(localStorage.getItem('produtos') || '[]'),
    cotacoes: JSON.parse(localStorage.getItem('cotacoes') || '[]'),
    agenda: JSON.parse(localStorage.getItem('agenda') || '[]'),
  };
  
  const dataStr = JSON.stringify(allData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `backup_crm_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const importAllData = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        
        // Validar estrutura
        const expectedKeys = ['clientes', 'dependentes', 'fornecedores', 'produtos', 'cotacoes', 'agenda'];
        const hasValidStructure = expectedKeys.every(key => Array.isArray(data[key]));
        
        if (!hasValidStructure) {
          reject(new Error('Arquivo de backup inválido'));
          return;
        }
        
        // Importar dados
        Object.keys(data).forEach(key => {
          localStorage.setItem(key, JSON.stringify(data[key]));
        });
        
        resolve();
      } catch (error) {
        reject(new Error('Erro ao processar arquivo de backup'));
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsText(file);
  });
};