import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface ExportImportButtonsProps {
  onExport: () => void;
  onImport: (file: File) => void;
}

export function ExportImportButtons({ onExport, onImport }: ExportImportButtonsProps) {
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Por favor, selecione um arquivo CSV');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        onImport(file);
        toast.success('Arquivo importado com sucesso!');
      } catch {
        toast.error('Erro ao importar arquivo');
      }
    };
    reader.onerror = () => {
      toast.error('Erro ao ler arquivo');
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    try {
      onExport();
      toast.success('Dados exportados com sucesso!');
    } catch {
      toast.error('Erro ao exportar dados');
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="w-4 h-4 mr-2" />
        Exportar CSV
      </Button>
      <label>
        <Button variant="outline" size="sm" asChild>
          <span>
            <Upload className="w-4 h-4 mr-2" />
            Importar CSV
          </span>
        </Button>
        <input
          type="file"
          accept=".csv"
          onChange={handleImport}
          className="hidden"
        />
      </label>
    </div>
  );
}