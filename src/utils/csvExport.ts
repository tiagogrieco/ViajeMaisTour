export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    throw new Error('Nenhum dado para exportar');
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function importFromCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          reject(new Error('Arquivo CSV vazio ou inválido'));
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          return obj;
        });

        resolve(data);
      } catch {
        reject(new Error('Erro ao processar arquivo CSV'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };

    reader.readAsText(file);
  });
}

// Export specific entity data
export function exportClientes(clientes: any[]) {
  exportToCSV(clientes, 'clientes.csv');
}

export function exportDependentes(dependentes: any[]) {
  exportToCSV(dependentes, 'dependentes.csv');
}

export function exportFornecedores(fornecedores: any[]) {
  exportToCSV(fornecedores, 'fornecedores.csv');
}

export function exportProdutos(produtos: any[]) {
  exportToCSV(produtos, 'produtos.csv');
}

export function exportCotacoes(cotacoes: any[]) {
  exportToCSV(cotacoes, 'cotacoes.csv');
}

export function exportAgenda(agenda: any[]) {
  exportToCSV(agenda, 'agenda.csv');
}

// Import with validation
export async function importClientes(file: File): Promise<any[]> {
  const data = await importFromCSV(file);
  // Add validation logic here if needed
  return data;
}

export async function importDependentes(file: File): Promise<any[]> {
  const data = await importFromCSV(file);
  return data;
}

export async function importFornecedores(file: File): Promise<any[]> {
  const data = await importFromCSV(file);
  return data;
}

export async function importProdutos(file: File): Promise<any[]> {
  const data = await importFromCSV(file);
  return data;
}

export async function importCotacoes(file: File): Promise<any[]> {
  const data = await importFromCSV(file);
  return data;
}

export async function importAgenda(file: File): Promise<any[]> {
  const data = await importFromCSV(file);
  return data;
}