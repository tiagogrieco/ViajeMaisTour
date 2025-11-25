import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Edit, Plus, Search, FileText, User, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { Cotacao, Cliente, Produto } from '@/types';
import { FormattedInput } from './FormattedInput';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';

import { useCotacoes, useCotacaoMutations, useClientes, useProdutos } from '@/hooks/useQueries';

export const CotacoesTab: React.FC = () => {
  const { data: cotacoes = [], isLoading: isLoadingCotacoes } = useCotacoes();
  const { data: clientes = [] } = useClientes();
  const { data: produtos = [] } = useProdutos();
  const { create: createCotacao, update: updateCotacao, remove: removeCotacao } = useCotacaoMutations();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Cotacao | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Cotacao, 'id' | 'dataCriacao'>>({
    clienteId: '',
    produtoId: '',
    produtos: [],
    dataViagem: '',
    dataRetorno: '',
    numeroPassageiros: 1,
    valorTotal: 0,
    status: 'Pendente',
    observacoes: ''
  });

  const filteredCotacoes = cotacoes.filter(cotacao => {
    const cliente = clientes.find(c => c.id === cotacao.clienteId);
    const matchesSearch = (cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      cotacao.valorTotal.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || cotacao.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      clienteId: '',
      produtoId: '',
      produtos: [],
      dataViagem: '',
      dataRetorno: '',
      numeroPassageiros: 1,
      valorTotal: 0,
      status: 'Pendente',
      observacoes: ''
    });
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clienteId || !formData.dataViagem) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // setIsLoading(true);
    const toastId = toast.loading('Salvando cotação...');

    try {
      const dataToSave = {
        ...formData,
        produtos: formData.produtoId ? [formData.produtoId] : []
      };

      if (editingItem) {
        await updateCotacao.mutateAsync({ id: editingItem.id, data: dataToSave });
        toast.success('Cotação atualizada com sucesso!', { id: toastId });
      } else {
        await createCotacao.mutateAsync(dataToSave);
        toast.success('Cotação criada com sucesso!', { id: toastId });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`, { id: toastId });
    }
  };

  const handleEdit = (cotacao: Cotacao) => {
    setEditingItem(cotacao);
    setFormData({
      clienteId: cotacao.clienteId,
      produtoId: cotacao.produtoId || '',
      produtos: cotacao.produtos || [],
      dataViagem: cotacao.dataViagem,
      dataRetorno: cotacao.dataRetorno || '',
      numeroPassageiros: cotacao.numeroPassageiros || 1,
      valorTotal: cotacao.valorTotal,
      status: cotacao.status,
      observacoes: cotacao.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta cotação?')) {
      try {
        await removeCotacao.mutateAsync(id);
      } catch (error) {
        // Error handling in mutation
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'Pendente': 'bg-yellow-100 text-yellow-800',
      'Aprovada': 'bg-green-100 text-green-800',
      'Rejeitada': 'bg-red-100 text-red-800',
      'Em Análise': 'bg-blue-100 text-blue-800',
      'Finalizada': 'bg-gray-100 text-gray-800'
    };
    return <Badge className={colors[status as keyof typeof colors] || colors.Pendente}>{status}</Badge>;
  };

  const getClienteNome = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente?.nome || 'Cliente não encontrado';
  };

  const getProdutoNome = (produtoId: string) => {
    const produto = produtos.find(p => p.id === produtoId);
    return produto?.nome || 'Produto não encontrado';
  };

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por cliente ou valor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Aprovada">Aprovada</SelectItem>
              <SelectItem value="Rejeitada">Rejeitada</SelectItem>
              <SelectItem value="Em Análise">Em Análise</SelectItem>
              <SelectItem value="Finalizada">Finalizada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Cotação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar Cotação' : 'Nova Cotação'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clienteId">Cliente *</Label>
                  <Select value={formData.clienteId} onValueChange={(value) => setFormData(prev => ({ ...prev, clienteId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map(cliente => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="produtoId">Produto Principal</Label>
                  <Select value={formData.produtoId} onValueChange={(value) => setFormData(prev => ({ ...prev, produtoId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {produtos.map(produto => (
                        <SelectItem key={produto.id} value={produto.id}>
                          {produto.nome} - {formatCurrency(produto.preco)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <FormattedInput
                  label="Data da Viagem"
                  type="date"
                  value={formData.dataViagem}
                  onChange={(value) => setFormData(prev => ({ ...prev, dataViagem: value }))}
                  required
                />

                <FormattedInput
                  label="Data de Retorno"
                  type="date"
                  value={formData.dataRetorno || ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, dataRetorno: value }))}
                />

                <FormattedInput
                  label="Número de Passageiros"
                  type="number"
                  value={formData.numeroPassageiros?.toString() || '1'}
                  onChange={(value) => setFormData(prev => ({ ...prev, numeroPassageiros: parseInt(value) || 1 }))}
                  required
                />

                <FormattedInput
                  label="Valor Total"
                  type="number"
                  value={formData.valorTotal?.toString() || '0'}
                  onChange={(value) => setFormData(prev => ({ ...prev, valorTotal: parseFloat(value) || 0 }))}
                  required
                />

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: Cotacao['status']) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Aprovada">Aprovada</SelectItem>
                      <SelectItem value="Rejeitada">Rejeitada</SelectItem>
                      <SelectItem value="Em Análise">Em Análise</SelectItem>
                      <SelectItem value="Finalizada">Finalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações sobre a cotação..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingItem ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Cotações */}
      <div className="grid gap-4">
        {filteredCotacoes.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? 'Nenhuma cotação encontrada com os filtros aplicados.'
                  : 'Nenhuma cotação cadastrada ainda.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCotacoes.map((cotacao) => (
            <Card key={cotacao.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Cotação #{cotacao.id.slice(-6)}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span><strong>Cliente:</strong> {getClienteNome(cotacao.clienteId)}</span>
                      </div>
                      {getStatusBadge(cotacao.status)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(cotacao)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(cotacao.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {cotacao.produtoId && (
                      <div>
                        <strong>Produto:</strong> {getProdutoNome(cotacao.produtoId)}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span><strong>Valor Total:</strong> {formatCurrency(cotacao.valorTotal)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span><strong>Data da Viagem:</strong> {formatDate(cotacao.dataViagem)}</span>
                    </div>
                    {cotacao.dataRetorno && (
                      <div>
                        <strong>Data de Retorno:</strong> {formatDate(cotacao.dataRetorno)}
                      </div>
                    )}
                    {cotacao.numeroPassageiros && (
                      <div>
                        <strong>Passageiros:</strong> {cotacao.numeroPassageiros}
                      </div>
                    )}
                  </div>

                  {cotacao.observacoes && (
                    <div className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                      <strong>Observações:</strong> {cotacao.observacoes}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Criada em {formatDate(cotacao.dataCriacao)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Cotações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{cotacoes.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {cotacoes.filter(c => c.status === 'Pendente').length}
              </div>
              <div className="text-sm text-muted-foreground">Pendentes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {cotacoes.filter(c => c.status === 'Aprovada').length}
              </div>
              <div className="text-sm text-muted-foreground">Aprovadas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {cotacoes.filter(c => c.status === 'Rejeitada').length}
              </div>
              <div className="text-sm text-muted-foreground">Rejeitadas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {cotacoes.filter(c => c.status === 'Finalizada').length}
              </div>
              <div className="text-sm text-muted-foreground">Finalizadas</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};