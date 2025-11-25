import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plane, Package, FileText, Calendar, TrendingUp, AlertCircle, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { Cliente, Produto, Cotacao, AgendaItem } from '@/types';
import { formatDate, formatTime } from '@/utils/formatters';

import { useClientes, useProdutos, useCotacoes, useAgenda } from '@/hooks/useQueries';

interface DashboardTabProps {
  onNavigate: (tab: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ onNavigate }) => {
  const { data: clientesData } = useClientes(1, 1000);
  const clientes = clientesData?.data || [];
  const { data: produtos = [] } = useProdutos();
  const { data: cotacoes = [] } = useCotacoes();
  const { data: agenda = [] } = useAgenda();
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const stats = useMemo(() => {
    const todayEvents = agenda.filter(item => {
      const eventDate = new Date(item.data);
      return eventDate.toDateString() === today.toDateString();
    });

    const upcomingEvents = agenda.filter(item => {
      const eventDate = new Date(item.data);
      return eventDate >= today && item.status !== 'Cancelado' && item.status !== 'Concluído';
    }).length;

    const activeCotacoes = cotacoes.filter(c => c.status === 'Pendente' || c.status === 'Em Análise').length;
    const confirmedCotacoes = cotacoes.filter(c => c.status === 'Aprovada').length;

    return {
      totalClientes: clientes.length,
      activeClientes: clientes.filter(c => c.status === 'Ativo').length,
      totalProdutos: produtos.length,
      totalCotacoes: cotacoes.length,
      activeCotacoes,
      confirmedCotacoes,
      todayEvents: todayEvents.length,
      upcomingEvents,
      todayEventsList: todayEvents.slice(0, 3)
    };
  }, [clientes, produtos, cotacoes, agenda, today]);

  const recentClientes = useMemo(() => {
    return [...clientes]
      .sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime())
      .slice(0, 5);
  }, [clientes]);

  const pendingCotacoes = useMemo(() => {
    return cotacoes
      .filter(c => c.status === 'Pendente' || c.status === 'Em Análise')
      .slice(0, 5);
  }, [cotacoes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral do seu sistema CRM</p>
      </div>

      {/* Alertas Importantes */}
      {stats.todayEvents > 0 && (
        <Card className="border-amber-500 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertCircle className="h-5 w-5" />
              Atenção: {stats.todayEvents} evento(s) hoje!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.todayEventsList.map(event => (
                <div key={event.id} className="flex items-center justify-between bg-white p-3 rounded border">
                  <div>
                    <div className="font-medium">{event.titulo}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(event.hora)} - {event.cliente}
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {event.status}
                  </Badge>
                </div>
              ))}
              {stats.todayEvents > 3 && (
                <Button
                  variant="link"
                  onClick={() => onNavigate('agenda')}
                  className="w-full text-amber-700 hover:text-amber-800"
                >
                  Ver todos os {stats.todayEvents} eventos de hoje →
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('clientes')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Clientes</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{clientesData?.count || 0}</div>
            <p className="text-xs text-green-600 mt-1">
              {stats.activeClientes} ativos
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('agenda')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Próximos Eventos</CardTitle>
            <Calendar className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.upcomingEvents}</div>
            <p className="text-xs text-amber-600 mt-1">
              {stats.todayEvents} hoje
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('cotacoes')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Cotações</CardTitle>
            <FileText className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalCotacoes}</div>
            <p className="text-xs text-orange-600 mt-1">
              {stats.activeCotacoes} pendentes
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('produtos')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Produtos</CardTitle>
            <Package className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalProdutos}</div>
            <p className="text-xs text-gray-500 mt-1">
              Catálogo disponível
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
          <CardDescription>Acesso rápido às funcionalidades mais usadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => onNavigate('clientes')}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Novo Cliente</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => onNavigate('agenda')}
            >
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Agendar Evento</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => onNavigate('cotacoes')}
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm">Nova Cotação</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => onNavigate('relatorios')}
            >
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Relatórios</span>
            </Button>

            {/* Botão de Teste (Apenas para desenvolvimento/demo) */}
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 border-dashed border-amber-400 bg-amber-50 hover:bg-amber-100"
              onClick={() => {
                if (confirm('Isso irá criar dados fictícios no banco de dados. Deseja continuar?')) {
                  import('@/utils/seedData').then(m => m.seedTestData());
                }
              }}
            >
              <Package className="h-6 w-6 text-amber-600" />
              <span className="text-sm text-amber-700">Gerar Testes</span>
            </Button>

            {/* Botão de Limpeza (PERIGO) */}
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 border-dashed border-red-400 bg-red-50 hover:bg-red-100"
              onClick={() => {
                const password = prompt('Digite a senha de administrador para APAGAR TUDO:');
                if (password === 'admin123') {
                  if (confirm('TEM CERTEZA? Isso apagará TODOS os clientes, vendas e produtos. Não há volta.')) {
                    import('@/utils/clearData').then(m => m.clearDatabase());
                  }
                } else if (password !== null) {
                  alert('Senha incorreta.');
                }
              }}
            >
              <Trash2 className="h-6 w-6 text-red-600" />
              <span className="text-sm text-red-700">Resetar Banco</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clientes Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clientes Recentes
            </CardTitle>
            <CardDescription>Últimos 5 clientes cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            {recentClientes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum cliente cadastrado ainda
              </p>
            ) : (
              <div className="space-y-3">
                {recentClientes.map(cliente => (
                  <div key={cliente.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium">{cliente.nome}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {formatDate(cliente.dataCriacao)}
                      </div>
                    </div>
                    <Badge variant={cliente.status === 'Ativo' ? 'default' : 'secondary'}>
                      {cliente.status}
                    </Badge>
                  </div>
                ))}
                <Button
                  variant="link"
                  onClick={() => onNavigate('clientes')}
                  className="w-full"
                >
                  Ver todos os clientes →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cotações Pendentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Cotações Pendentes
            </CardTitle>
            <CardDescription>Cotações que precisam de atenção</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingCotacoes.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Todas as cotações estão em dia!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingCotacoes.map(cotacao => (
                  <div key={cotacao.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex-1">
                      <div className="font-medium">Cliente ID: {cotacao.clienteId.substring(0, 8)}...</div>
                      <div className="text-sm text-muted-foreground">
                        R$ {cotacao.valorTotal?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">
                      {cotacao.status}
                    </Badge>
                  </div>
                ))}
                <Button
                  variant="link"
                  onClick={() => onNavigate('cotacoes')}
                  className="w-full text-orange-700 hover:text-orange-800"
                >
                  Ver todas as cotações →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dicas e Suporte */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Plane className="h-5 w-5" />
            Dicas para Melhor Uso do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Mantenha os dados dos clientes sempre atualizados para facilitar o contato</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Use a aba de Agenda para acompanhar check-ins e embarques com antecedência</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Gere relatórios regularmente para análise de desempenho</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Cadastre fornecedores e produtos para agilizar a criação de cotações</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};