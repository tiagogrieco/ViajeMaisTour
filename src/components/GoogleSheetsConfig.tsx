import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const GoogleSheetsConfig: React.FC = () => {
  const { config, isConnected, saveConfig } = useGoogleSheets();
  const [formData, setFormData] = useState(config);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveConfig(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do Google Sheets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          {isConnected ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Conectado</AlertTitle>
              <AlertDescription className="text-green-700">
                Sua planilha está vinculada corretamente.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Desconectado</AlertTitle>
              <AlertDescription>
                Configure as credenciais para sincronizar seus dados.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="spreadsheetId">ID da Planilha (Spreadsheet ID)</Label>
            <Input
              id="spreadsheetId"
              name="spreadsheetId"
              value={formData.spreadsheetId}
              onChange={handleChange}
              placeholder="Ex: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvEbrup"
            />
            <p className="text-xs text-muted-foreground">
              O ID pode ser encontrado na URL da sua planilha do Google.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleChange}
              type="password"
              placeholder="Sua Google Cloud API Key"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              type="password"
              placeholder="Seu OAuth 2.0 Client ID"
            />
          </div>

          <Button type="submit" className="w-full">
            Salvar Configurações
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};