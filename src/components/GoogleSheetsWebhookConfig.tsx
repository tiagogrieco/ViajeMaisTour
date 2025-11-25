import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Settings } from 'lucide-react';

export function GoogleSheetsWebhookConfig() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [sheetId, setSheetId] = useState('');

  const handleSave = () => {
    if (!webhookUrl || !sheetId) {
      toast.error('Preencha todos os campos');
      return;
    }

    localStorage.setItem('google_sheets_webhook', webhookUrl);
    localStorage.setItem('google_sheets_id', sheetId);
    toast.success('Configurações salvas com sucesso!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configuração Google Sheets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sheetId">ID da Planilha</Label>
          <Input
            id="sheetId"
            value={sheetId}
            onChange={(e) => setSheetId(e.target.value)}
            placeholder="ID da planilha Google Sheets"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="webhookUrl">URL do Webhook</Label>
          <Input
            id="webhookUrl"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <Button onClick={handleSave} className="w-full">
          Salvar Configurações
        </Button>
      </CardContent>
    </Card>
  );
}