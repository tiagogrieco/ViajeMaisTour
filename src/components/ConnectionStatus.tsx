import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Database } from 'lucide-react';

export const ConnectionStatus = () => {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setStatus('loading');
      
      // Lista de tabelas para verificar
      const tablesToCheck = [
        'clientes',
        'dependentes',
        'fornecedores',
        'produtos',
        'cotacoes',
        'agenda'
      ];

      // Tenta acessar cada tabela individualmente para verificar permissões e existência
      const checks = await Promise.all(
        tablesToCheck.map(async (table) => {
          const { error } = await supabase.from(table).select('id').limit(1);
          return { table, exists: !error };
        })
      );

      const foundTables = checks
        .filter(check => check.exists)
        .map(check => check.table);

      setTables(foundTables);
      
      if (foundTables.length > 0) {
        setStatus('connected');
        setMessage('Conectado ao Supabase com sucesso!');
      } else {
        throw new Error('Conectado, mas nenhuma tabela foi detectada. Verifique as permissões (RLS).');
      }

    } catch (err: any) {
      console.error('Connection error:', err);
      setStatus('error');
      setMessage(`Erro de conexão: ${err.message || 'Desconhecido'}`);
    }
  };

  return (
    <Card className="mb-6 border-l-4 border-l-blue-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Database className="h-5 w-5" />
          Status da Conexão com Banco de Dados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          {status === 'loading' && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Verificando todas as tabelas...
            </div>
          )}
          
          {status === 'connected' && (
            <div className="space-y-2 w-full">
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <CheckCircle className="h-5 w-5" />
                {message}
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="text-muted-foreground w-full sm:w-auto">Tabelas verificadas:</span>
                {tables.map(t => (
                  <Badge key={t} variant="outline" className="bg-green-50 border-green-200 text-green-700">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-600 font-medium">
                <XCircle className="h-5 w-5" />
                {message}
              </div>
              <p className="text-sm text-muted-foreground">
                Verifique sua conexão com a internet ou as credenciais do Supabase.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};