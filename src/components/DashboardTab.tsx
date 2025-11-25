import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Plane, FileText, CheckCircle2 } from 'lucide-react';
import { useClientes, useCotacoes, useAgenda } from '@/hooks/useQueries';
import { formatCurrency } from '@/utils/formatters';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { format, subMonths, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardTabProps {
  onNavigate: (tab: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ onNavigate }) => {
  const { data: clientesData } = useClientes(1, 1000);
  const clientes = clientesData?.data || [];

  const { data: cotacoes = [] } = useCotacoes();
  const { data: agenda = [] } = useAgenda();

  const stats = useMemo(() => {
    const activeClientes = clientes.filter(c => c.status === 'Ativo').length;

    // Calculate total sales (Finalized quotes)
    const finalizedQuotes = cotacoes.filter(c => c.status === 'Finalizada' || c.status === 'Aprovada');
    const totalSales = finalizedQuotes.reduce((acc, curr) => acc + (curr.valorTotal || 0), 0);

    // Calculate pending value
    const pendingQuotes = cotacoes.filter(c => c.status === 'Pendente' || c.status === 'Em Análise');
    const potentialValue = pendingQuotes.reduce((acc, curr) => acc + (curr.valorTotal || 0), 0);

    // Calculate conversion rate
    const totalQuotes = cotacoes.length;
    const conversionRate = totalQuotes > 0 ? (finalizedQuotes.length / totalQuotes) * 100 : 0;

    // Calculate total commission
    const totalComissao = finalizedQuotes.reduce((acc, curr) => acc + (curr.comissao || 0), 0);

    return {
      totalClientes: clientesData?.count || 0,
      activeClientes,
      totalSales,
      potentialValue,
      conversionRate,
      pendingQuotesCount: pendingQuotes.length,
      activeTrips: agenda.filter(a => a.status === 'Confirmado').length,
      totalComissao
    };
  }, [clientes, cotacoes, agenda, clientesData]);

  // Data for Bar Chart (Last 6 months sales)
  const salesData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthName = format(date, 'MMM', { locale: ptBR });

      const monthSales = cotacoes
        .filter(c => (c.status === 'Finalizada' || c.status === 'Aprovada') && isSameMonth(new Date(c.dataCriacao), date))
        .reduce((acc, curr) => acc + (curr.valorTotal || 0), 0);

      const monthCommission = cotacoes
        .filter(c => (c.status === 'Finalizada' || c.status === 'Aprovada') && isSameMonth(new Date(c.dataCriacao), date))
        .reduce((acc, curr) => acc + (curr.comissao || 0), 0);

      const monthQuotes = cotacoes
        .filter(c => isSameMonth(new Date(c.dataCriacao), date))
        .length;

      data.push({
        name: monthName,
        vendas: monthSales,
        comissao: monthCommission,
        cotacoes: monthQuotes
      });
    }
    return data;
  }, [cotacoes]);

  // Data for Pie Chart (Quotes Status)
  const statusData = useMemo(() => {
    const statusCounts = cotacoes.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [cotacoes]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Upcoming Check-ins
  const upcomingCheckins = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return agenda
      .filter(item => {
        const isCheckin = item.titulo.toLowerCase().includes('check-in') || item.titulo.toLowerCase().includes('checkin');
        const eventDate = new Date(item.data);
        return isCheckin && eventDate >= today && item.status !== 'Cancelado';
      })
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .slice(0, 5);
  }, [agenda]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
        <div className="text-sm text-muted-foreground">
          Visão geral do seu negócio
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500" onClick={() => onNavigate('clientes')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Clientes Totais</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalClientes}</div>
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {stats.activeClientes} ativos
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-green-500" onClick={() => onNavigate('cotacoes')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Vendas (Total)</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalSales)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.conversionRate.toFixed(1)}% de conversão
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-amber-500" onClick={() => onNavigate('cotacoes')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Em Negociação</CardTitle>
            <FileText className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats.potentialValue)}</div>
            <p className="text-xs text-amber-600 mt-1">
              {stats.pendingQuotesCount} cotações abertas
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-purple-500" onClick={() => onNavigate('agenda')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Viagens Ativas</CardTitle>
            <Plane className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.activeTrips}</div>
            <p className="text-xs text-purple-600 mt-1">
              Confirmadas na agenda
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Comissões (Receita)</CardTitle>
            <DollarSign className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalComissao)}</div>
            <p className="text-xs text-indigo-600 mt-1">
              Total recebido em comissões
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Evolução Financeira (6 Meses)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar dataKey="vendas" fill="#22c55e" radius={[4, 4, 0, 0]} name="Vendas (R$)" />
                  <Bar dataKey="comissao" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Comissão (R$)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Status das Cotações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Check-ins and Commission Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-purple-600" />
              Próximos Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingCheckins.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum check-in próximo.</p>
              ) : (
                upcomingCheckins.map(item => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start gap-4">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <Plane className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.titulo}</p>
                        <p className="text-xs text-muted-foreground">{item.cliente}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{format(new Date(item.data), 'dd/MM')}</p>
                      <p className="text-xs text-muted-foreground">{item.hora}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Commission Details Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-indigo-600" />
              Detalhamento de Comissões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cotacoes.filter(c => c.status === 'Finalizada' || c.status === 'Aprovada').length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma venda com comissão registrada.</p>
              ) : (
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-4 py-2">Data</th>
                        <th className="px-4 py-2">Cliente</th>
                        <th className="px-4 py-2">Venda</th>
                        <th className="px-4 py-2">Comissão</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cotacoes
                        .filter(c => c.status === 'Finalizada' || c.status === 'Aprovada')
                        .sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime())
                        .slice(0, 5)
                        .map(quote => {
                          const cliente = clientes.find(c => c.id === quote.clienteId);
                          return (
                            <tr key={quote.id} className="bg-white border-b hover:bg-gray-50">
                              <td className="px-4 py-2">{format(new Date(quote.dataCriacao), 'dd/MM/yyyy')}</td>
                              <td className="px-4 py-2 font-medium text-gray-900">{cliente?.nome || 'Cliente não encontrado'}</td>
                              <td className="px-4 py-2">{formatCurrency(quote.valorTotal)}</td>
                              <td className="px-4 py-2 text-indigo-600 font-bold">
                                {formatCurrency(quote.comissao || 0)}
                                <span className="text-xs text-gray-500 ml-1">({quote.percentualComissao}%)</span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};