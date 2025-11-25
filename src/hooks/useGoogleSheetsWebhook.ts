import { useState, useEffect } from 'react';
import { googleSheetsWebhook } from '@/services/googleSheetsWebhook';

export const useGoogleSheetsWebhook = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se já existe configuração salva e testar conexão
    const checkConnection = async () => {
      const config = googleSheetsWebhook.getConfig();
      if (config && config.webhookUrl && config.spreadsheetId) {
        try {
          const isWorking = await googleSheetsWebhook.testConnection();
          setIsConnected(isWorking);
        } catch (err) {
          console.error('Erro ao verificar conexão:', err);
          setIsConnected(false);
        }
      }
    };

    checkConnection();
  }, []);

  const connectToGoogleSheets = async (webhookUrl: string, spreadsheetId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Configurar o webhook
      googleSheetsWebhook.setConfig({ webhookUrl, spreadsheetId });
      
      // Testar conexão
      const isWorking = await googleSheetsWebhook.testConnection();
      
      if (isWorking) {
        setIsConnected(true);
        return true;
      } else {
        setError('Não foi possível conectar ao webhook. Verifique a URL.');
        setIsConnected(false);
        return false;
      }
    } catch (err) {
      setError('Erro ao conectar: ' + (err as Error).message);
      setIsConnected(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const saveToSheet = async (sheetName: string, data: Record<string, unknown>[]) => {
    if (!isConnected) {
      throw new Error('Não conectado ao Google Sheets');
    }
    
    setIsLoading(true);
    try {
      await googleSheetsWebhook.sendData(sheetName, data);
      return true;
    } catch (err) {
      setError('Erro ao salvar: ' + (err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromSheet = async (sheetName: string) => {
    if (!isConnected) {
      throw new Error('Não conectado ao Google Sheets');
    }
    
    setIsLoading(true);
    try {
      const data = await googleSheetsWebhook.getData(sheetName);
      return data;
    } catch (err) {
      setError('Erro ao carregar: ' + (err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    localStorage.removeItem('googlesheets_config');
    setIsConnected(false);
    setError(null);
  };

  const getGoogleAppsScript = () => {
    return googleSheetsWebhook.generateGoogleAppsScript();
  };

  return {
    isConnected,
    isLoading,
    error,
    connectToGoogleSheets,
    saveToSheet,
    loadFromSheet,
    disconnect,
    getGoogleAppsScript,
  };
};