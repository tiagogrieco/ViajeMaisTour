import React from 'react';
import { GoogleSheetsConfig } from './GoogleSheetsConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';

export const GoogleSheetsTab: React.FC = () => {
  const { isConnected, syncData, config } = useGoogleSheets();

  const handleSync = async () => {
    await syncData({ timestamp: new Date().toISOString() });
    alert('Sincronização iniciada (simulação)!');
  };

  const openSheet = () => {
    if (config.spreadsheetId) {
      window.open(`https://docs.google.com/spreadsheets/d/${config.spreadsheetId}`, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <GoogleSheetsConfig />

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sincronização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sincronize seus dados locais (Clientes, Cotações, Agenda) com sua planilha do Google Sheets para backup e acesso remoto.
              </p>
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleSync} 
                  disabled={!isConnected}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sincronizar Agora
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={openSheet}
                  disabled={!isConnected}
                  className="w-full"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir Planilha
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instruções</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>1. Crie um projeto no Google Cloud Console.</p>
              <p>2. Ative a Google Sheets API.</p>
              <p>3. Crie credenciais (API Key e OAuth Client ID).</p>
              <p>4. Compartilhe sua planilha com o email da conta de serviço (se aplicável) ou certifique-se que suas credenciais têm permissão de acesso.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};