import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useGoogleSheetsWebhook } from '@/hooks/useGoogleSheetsWebhook';
import { CheckCircle, XCircle, Settings, HelpCircle, ExternalLink, Copy, Code } from 'lucide-react';

interface GoogleSheetsWebhookConfigProps {
  onConnectionChange: (connected: boolean) => void;
}

export const GoogleSheetsWebhookConfig: React.FC<GoogleSheetsWebhookConfigProps> = ({ onConnectionChange }) => {
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [showScript, setShowScript] = useState(false);
  
  const { isConnected, isLoading, error, connectToGoogleSheets, disconnect, getGoogleAppsScript } = useGoogleSheetsWebhook();

  const handleConnect = async () => {
    if (!spreadsheetId.trim() || !webhookUrl.trim()) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    const success = await connectToGoogleSheets(webhookUrl.trim(), spreadsheetId.trim());
    onConnectionChange(success);
  };

  const handleDisconnect = () => {
    disconnect();
    onConnectionChange(false);
  };

  const extractSpreadsheetId = (url: string) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : url;
  };

  const handleUrlChange = (value: string) => {
    const id = extractSpreadsheetId(value);
    setSpreadsheetId(id);
  };

  const copyScript = () => {
    const script = getGoogleAppsScript();
    navigator.clipboard.writeText(script);
    alert('Código copiado para a área de transferência!');
  };

  const copyWebhookUrl = () => {
    if (webhookUrl) {
      navigator.clipboard.writeText(webhookUrl);
      alert('URL do webhook copiada!');
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Integração Google Sheets via Webhook
            </CardTitle>
            <CardDescription>
              Conecte seu CRM com Google Sheets usando Google Apps Script (100% compatível com browser)
            </CardDescription>
          </div>
          <Badge variant={isConnected ? "default" : "secondary"} className="flex items-center gap-1">
            {isConnected ? (
              <>
                <CheckCircle className="w-3 h-3" />
                Conectado
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3" />
                Desconectado
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue={isConnected ? "status" : "setup"} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">1. Configuração</TabsTrigger>
            <TabsTrigger value="script">2. Apps Script</TabsTrigger>
            <TabsTrigger value="status">3. Status</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="spreadsheet-url">URL ou ID da Planilha Google Sheets</Label>
                <Input
                  id="spreadsheet-url"
                  placeholder="https://docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit"
                  value={spreadsheetId}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  Cole a URL completa da planilha ou apenas o ID
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL do Webhook (Google Apps Script)</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhook-url"
                    placeholder="https://script.google.com/macros/s/SEU_SCRIPT_ID/exec"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="font-mono text-sm"
                  />
                  {webhookUrl && (
                    <Button variant="outline" size="sm" onClick={copyWebhookUrl}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  URL gerada após criar o Google Apps Script (próxima aba)
                </p>
              </div>

              <Alert>
                <HelpCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Passo 1:</strong> Crie uma planilha no Google Sheets<br/>
                  <strong>Passo 2:</strong> Vá para a aba "Apps Script" para criar o webhook<br/>
                  <strong>Passo 3:</strong> Cole a URL do webhook aqui e conecte
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="script" className="space-y-4">
            <div className="space-y-4">
              <Alert>
                <Code className="h-4 w-4" />
                <AlertDescription>
                  <strong>Como criar o Google Apps Script:</strong><br/>
                  1. Abra sua planilha no Google Sheets<br/>
                  2. Vá em "Extensões" → "Apps Script"<br/>
                  3. Cole o código abaixo<br/>
                  4. Clique em "Implantar" → "Nova implantação"<br/>
                  5. Escolha "Aplicativo da Web" e "Qualquer pessoa" pode executar<br/>
                  6. Copie a URL gerada e cole na aba anterior
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Código do Google Apps Script</Label>
                  <Button variant="outline" size="sm" onClick={copyScript}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Código
                  </Button>
                </div>
                <Textarea
                  value={getGoogleAppsScript()}
                  readOnly
                  className="font-mono text-xs h-64"
                  placeholder="Código será gerado aqui..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">📋 Passos Detalhados:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-gray-600">
                    <li>Abra sua planilha Google Sheets</li>
                    <li>Menu "Extensões" → "Apps Script"</li>
                    <li>Apague o código padrão</li>
                    <li>Cole o código copiado</li>
                    <li>Salve o projeto (Ctrl+S)</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🚀 Implantação:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-gray-600">
                    <li>Clique em "Implantar" → "Nova implantação"</li>
                    <li>Tipo: "Aplicativo da Web"</li>
                    <li>Executar como: "Eu"</li>
                    <li>Acesso: "Qualquer pessoa"</li>
                    <li>Copie a URL gerada</li>
                  </ol>
                </div>
              </div>

              <Alert>
                <ExternalLink className="h-4 w-4" />
                <AlertDescription>
                  <strong>Precisa de ajuda?</strong> Acesse o{' '}
                  <a 
                    href="https://script.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Google Apps Script
                  </a>{' '}
                  para criar seu webhook.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            {isConnected ? (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    ✅ <strong>Conectado com sucesso!</strong><br/>
                    Seus dados agora são sincronizados automaticamente com o Google Sheets.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">📊 Configuração Atual:</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Planilha ID:</strong> <code className="bg-gray-100 px-1 rounded">{spreadsheetId}</code></p>
                      <p><strong>Webhook:</strong> <span className="text-green-600">Ativo</span></p>
                      <p><strong>Status:</strong> <span className="text-green-600">Conectado</span></p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">🔄 Sincronização:</h4>
                    <div className="text-sm space-y-1">
                      <p>✅ Clientes</p>
                      <p>✅ Cotações</p>
                      <p>✅ Agenda</p>
                      <p>✅ Fornecedores</p>
                    </div>
                  </div>
                </div>

                <Button variant="destructive" onClick={handleDisconnect}>
                  Desconectar
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Não conectado. Complete a configuração nas abas anteriores.
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handleConnect} 
                  disabled={isLoading || !spreadsheetId.trim() || !webhookUrl.trim()}
                  className="w-full"
                >
                  {isLoading ? 'Conectando...' : 'Conectar ao Google Sheets'}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};