import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, Package, DollarSign, Calendar, TrendingUp, FileText, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Cliente, Produto, Cotacao, AgendaItem } from '@/types';

interface DashboardTabProps {
  clientes: Cliente[];
  produtos: Produto[];
  cotacoes: Cotacao[];
  agenda: AgendaItem[];
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  clientes,
  produtos,
  cotacoes,
  agenda
}) => {
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalProdutos: 0,
    totalCotacoes: 0,
    totalAgenda: 0,
    faturamentoTotal: 0,
    cotacoesAprovadas: 0,
    cotacoesPendentes: 0,
    clientesAtivos: 0
  });

  useEffect(() => {
    const cotacoesAprovadas = cotacoes.filter(c => c.status === 'Aprovada').length;
    const cotacoesPendentes = cotacoes.filter(c => c.status === 'Pendente').length;
    const faturamentoTotal = cotacoes
      .filter(c => c.status === 'Aprovada')
      .reduce((total, c) => total + c.valorTotal, 0);
    const clientesAtivos = clientes.filter(c => c.status === 'Ativo').length;

    setStats({
      totalClientes: clientes.length,
      totalProdutos: produtos.length,
      totalCotacoes: cotacoes.length,
      totalAgenda: agenda.length,
      faturamentoTotal,
      cotacoesAprovadas,
      cotacoesPendentes,
      clientesAtivos
    });
  }, [clientes, produtos, cotacoes, agenda]);

  // Dados para gráficos
  const statusCotacoes = [
    { name: 'Aprovadas', value: stats.cotacoesAprovadas, color: '#10b981' },
    { name: 'Pendentes', value: stats.cotacoesPendentes, color: '#f59e0b' },
    { name: 'Rejeitadas', value: cotacoes.filter(c => c.status === 'Rejeitada').length, color: '#ef4444' }
  ];

  const faturamentoMensal = cotacoes
    .filter(c => c.status === 'Aprovada')
    .reduce((acc, cotacao) => {
      const mes = new Date(cotacao.dataVencimento).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      acc[mes] = (acc[mes] || 0) + cotacao.valorTotal;
      return acc;
    }, {} as Record<string, number>);

  const dadosFaturamento = Object.entries(faturamentoMensal).map(([mes, valor]) => ({
    mes,
    valor
  }));

  const produtosMaisVendidos = produtos.map(produto => {
    const vendas = cotacoes.filter(c => 
      c.status === 'Aprovada' && 
      c.itens.some(item => item.produto === produto.nome)
    ).length;
    return { nome: produto.nome, vendas };
  }).sort((a, b) => b.vendas - a.vendas).slice(0, 5);

  const exportarRelatorio = (tipo: string) => {
    let dados = '';
    const agora = new Date().toLocaleString('pt-BR');
    
    switch (tipo) {
      case 'clientes':
        dados = `RELATÓRIO DE CLIENTES - ${agora}\n\n`;
        dados += `Total de Clientes: ${stats.totalClientes}\n`;
        dados += `Clientes Ativos: ${stats.clientesAtivos}\n\n`;
        dados += 'DETALHES:\n';
        clientes.forEach(cliente => {
          dados += `${cliente.nome} - ${cliente.email} - ${cliente.status}\n`;
        });
        break;
      case 'cotacoes':
        dados = `RELATÓRIO DE COTAÇÕES - ${agora}\n\n`;
        dados += `Total de Cotações: ${stats.totalCotacoes}\n`;
        dados += `Aprovadas: ${stats.cotacoesAprovadas}\n`;
        dados += `Pendentes: ${stats.cotacoesPendentes}\n`;
        dados += `Faturamento Total: ${formatCurrency(stats.faturamentoTotal)}\n\n`;
        dados += 'DETALHES:\n';
        cotacoes.forEach(cotacao => {
          dados += `${cotacao.cliente} - ${formatCurrency(cotacao.valorTotal)} - ${cotacao.status}\n`;
        });
        break;
      case 'geral':
        dados = `RELATÓRIO GERAL - ${agora}\n\n`;
        dados += `Clientes: ${stats.totalClientes}\n`;
        dados += `Produtos: ${stats.totalProdutos}\n`;
        dados += `Cotações: ${stats.totalCotacoes}\n`;
        dados += `Agenda: ${stats.totalAgenda}\n`;
        dados += `Faturamento: ${formatCurrency(stats.faturamentoTotal)}\n`;
        break;
    }

    const blob = new Blob([dados], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${tipo}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClientes}</div>
            <p className="text-xs text-muted-foreground">
              {stats.clientesAtivos} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProdutos}</div>
            <p className="text-xs text-muted-foreground">
              Pacotes disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.faturamentoTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.cotacoesAprovadas} cotações aprovadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agenda</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAgenda}</div>
            <p className="text-xs text-muted-foreground">
              Compromissos agendados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com Gráficos e Relatórios */}
      <Tabs defaultValue="graficos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="graficos">📊 Gráficos</TabsTrigger>
          <TabsTrigger value="relatorios">📋 Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="graficos" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gráfico de Status das Cotações */}
            <Card>
              <CardHeader>
                <CardTitle>Status das Cotações</CardTitle>
                <CardDescription>Distribuição por status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusCotacoes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusCotacoes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Faturamento Mensal */}
            <Card>
              <CardHeader>
                <CardTitle>Faturamento Mensal</CardTitle>
                <CardDescription>Evolução das vendas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dadosFaturamento}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Produtos Mais Vendidos */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Produtos Mais Vendidos</CardTitle>
                <CardDescription>Top 5 produtos por número de vendas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={produtosMaisVendidos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="vendas" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Relatório de Clientes
                </CardTitle>
                <CardDescription>
                  Lista completa de todos os clientes cadastrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Total:</strong> {stats.totalClientes}</p>
                  <p><strong>Ativos:</strong> {stats.clientesAtivos}</p>
                  <Button 
                    onClick={() => exportarRelatorio('clientes')}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Relatório de Cotações
                </CardTitle>
                <CardDescription>
                  Análise completa das cotações e vendas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Total:</strong> {stats.totalCotacoes}</p>
                  <p><strong>Faturamento:</strong> {formatCurrency(stats.faturamentoTotal)}</p>
                  <Button 
                    onClick={() => exportarRelatorio('cotacoes')}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Relatório Geral
                </CardTitle>
                <CardDescription>
                  Resumo executivo de todas as informações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Última atualização:</strong> {formatDate(new Date().toISOString())}</p>
                  <Button 
                    onClick={() => exportarRelatorio('geral')}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo Rápido */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo Executivo</CardTitle>
              <CardDescription>Principais métricas do negócio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalClientes}</div>
                  <div className="text-sm text-muted-foreground">Clientes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.faturamentoTotal)}</div>
                  <div className="text-sm text-muted-foreground">Faturamento</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.cotacoesPendentes}</div>
                  <div className="text-sm text-muted-foreground">Pendentes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.totalAgenda}</div>
                  <div className="text-sm text-muted-foreground">Agenda</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};