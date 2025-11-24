import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, Save, FolderOpen } from 'lucide-react';
import { exportToCSV, importFromCSV, exportAllData, importAllData } from '@/utils/csvExport';
import { toast } from 'sonner';

interface ExportImportButtonsProps {
  data: Record<string, unknown>[];
  filename: string;
  onImport?: (data: Record<string, unknown>[]) => void;
  showFullBackup?: boolean;
}

export const ExportImportButtons: React.FC<ExportImportButtonsProps> = ({
  data,
  filename,
  onImport,
  showFullBackup = false
}) => {
  const csvInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = () => {
    try {
      exportToCSV(data, filename);
      toast.success(`${filename} exportado com sucesso!`);
    } catch (error) {
      toast.error('Erro ao exportar CSV');
    }
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedData = await importFromCSV(file);
      if (onImport) {
        onImport(importedData);
        toast.success(`${filename} importado com sucesso!`);
      }
    } catch (error) {
      toast.error('Erro ao importar CSV: ' + (error as Error).message);
    }

    // Limpar input
    if (csvInputRef.current) {
      csvInputRef.current.value = '';
    }
  };

  const handleExportAllData = () => {
    try {
      exportAllData();
      toast.success('Backup completo exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar backup completo');
    }
  };

  const handleImportAllData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importAllData(file);
      toast.success('Backup completo importado com sucesso!');
      // Recarregar página para atualizar dados
      window.location.reload();
    } catch (error) {
      toast.error('Erro ao importar backup: ' + (error as Error).message);
    }

    // Limpar input
    if (backupInputRef.current) {
      backupInputRef.current.value = '';
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {/* Exportar CSV */}
      <Button
        onClick={handleExportCSV}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Download size={16} />
        Exportar CSV
      </Button>

      {/* Importar CSV */}
      {onImport && (
        <>
          <Button
            onClick={() => csvInputRef.current?.click()}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Upload size={16} />
            Importar CSV
          </Button>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
          />
        </>
      )}

      {/* Backup completo - apenas mostrar em uma aba */}
      {showFullBackup && (
        <>
          <Button
            onClick={handleExportAllData}
            variant="default"
            size="sm"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Save size={16} />
            Backup Completo
          </Button>
          
          <Button
            onClick={() => backupInputRef.current?.click()}
            variant="default"
            size="sm"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <FolderOpen size={16} />
            Restaurar Backup
          </Button>
          <input
            ref={backupInputRef}
            type="file"
            accept=".json"
            onChange={handleImportAllData}
            className="hidden"
          />
        </>
      )}
    </div>
  );
};