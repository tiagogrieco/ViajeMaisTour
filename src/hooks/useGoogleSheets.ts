import { useState, useEffect } from 'react';

interface GoogleSheetsConfig {
  spreadsheetId: string;
  apiKey: string;
  clientId: string;
}

export const useGoogleSheets = () => {
  const [config, setConfig] = useState<GoogleSheetsConfig>({
    spreadsheetId: '',
    apiKey: '',
    clientId: '',
  });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem('googleSheetsConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
      // Simular conexão se houver config salva
      if (JSON.parse(savedConfig).spreadsheetId) {
        setIsConnected(true);
      }
    }
  }, []);

  const saveConfig = (newConfig: GoogleSheetsConfig) => {
    localStorage.setItem('googleSheetsConfig', JSON.stringify(newConfig));
    setConfig(newConfig);
    setIsConnected(true);
  };

  const syncData = async (data: any) => {
    console.log('Sincronizando dados com Google Sheets:', data);
    // Aqui viria a implementação real da API do Google Sheets
    // Por enquanto, apenas simulamos um delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  };

  return {
    config,
    isConnected,
    saveConfig,
    syncData
  };
};