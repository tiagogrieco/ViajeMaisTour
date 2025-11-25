import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Edit, Plus, Search, Mail, Phone, MapPin, User, Loader2, AlertCircle } from 'lucide-react';
import { Cliente } from '@/types';
import { FormattedInput } from './FormattedInput';
import { formatDate } from '@/utils/formatters';
import { supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';

import { useClientes, useClienteMutations } from '@/hooks/useQueries';

export const ClientesTab: React.FC = () => {
  const { data: clientes = [], isLoading: isLoadingClientes } = useClientes();
  const { create: createCliente, update: updateCliente, remove: removeCliente } = useClienteMutations();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Cliente, 'id' | 'dataCriacao'>>({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    dataNascimento: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    status: 'Ativo',
    observacoes: ''
  });

  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefone.includes(searchTerm) ||
      cliente.cpf.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || cliente.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const validateForm = () => {
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email é obrigatório');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Email inválido');
      return false;
    }
    if (!formData.telefone.trim()) {
      toast.error('Telefone é obrigatório');
      return false;
    }
    if (!formData.cpf.trim()) {
      toast.error('CPF é obrigatório');
      return false;
    }
    if (formData.cpf.replace(/\D/g, '').length !== 11) {
      toast.error('CPF deve ter 11 dígitos');
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      dataNascimento: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      status: 'Ativo',
      observacoes: ''
    });
    setEditingCliente(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // setIsLoading(true); // Handled by mutation status if needed, or local state

    try {
      if (editingCliente) {
        await updateCliente.mutateAsync({ id: editingCliente.id, data: formData });
      } else {
        await createCliente.mutateAsync(formData);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handling is done in mutation callbacks
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      cpf: cliente.cpf,
      dataNascimento: cliente.dataNascimento || '',
      endereco: cliente.endereco || '',
      cidade: cliente.cidade || '',
      estado: cliente.estado || '',
      cep: cliente.cep || '',
      status: cliente.status,
      observacoes: cliente.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await removeCliente.mutateAsync(id);
      } catch (error) {
        // Error handling in mutation
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Clientes</h2>
          <p className="text-gray-500 mt-1">Gerencie todos os seus clientes em um só lugar</p>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome, email, telefone ou CPF..."
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
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>Dica:</strong> Preencha todos os campos obrigatórios (*) para garantir um cadastro completo.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <FormattedInput
                    label="Nome Completo *"
                    type="text"
                    value={formData.nome}
                    onChange={(value) => setFormData(prev => ({ ...prev, nome: value }))}
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>

                <FormattedInput
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                  placeholder="email@exemplo.com"
                  required
                />

                <FormattedInput
                  label="Telefone *"
                  type="phone"
                  value={formData.telefone}
                  onChange={(value) => setFormData(prev => ({ ...prev, telefone: value }))}
                  placeholder="(00) 00000-0000"
                  required
                />

                <FormattedInput
                  label="CPF *"
                  type="cpf"
                  value={formData.cpf}
                  onChange={(value) => setFormData(prev => ({ ...prev, cpf: value }))}
                  placeholder="000.000.000-00"
                  required
                />

                <FormattedInput
                  label="Data de Nascimento"
                  type="date"
                  value={formData.dataNascimento || ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, dataNascimento: value }))}
                />

                <div className="md:col-span-2">
                  <FormattedInput
                    label="Endereço"
                    type="text"
                    value={formData.endereco || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, endereco: value }))}
                    placeholder="Rua, número, complemento"
                  />
                </div>

                <FormattedInput
                  label="Cidade"
                  type="text"
                  value={formData.cidade || ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, cidade: value }))}
                  placeholder="Nome da cidade"
                />

                <FormattedInput
                  label="Estado"
                  type="text"
                  value={formData.estado || ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, estado: value }))}
                  placeholder="UF"
                />

                <FormattedInput
                  label="CEP"
                  type="cep"
                  value={formData.cep || ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, cep: value }))}
                  placeholder="00000-000"
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={formData.status} onValueChange={(value: 'Ativo' | 'Inativo') => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium">Observações</label>
                  <Textarea
                    value={formData.observacoes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Informações adicionais sobre o cliente..."
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
                  {editingCliente ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{clientes.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clientes Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {clientes.filter(c => c.status === 'Ativo').length}
                </p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resultados da Busca</p>
                <p className="text-2xl font-bold text-purple-600">{filteredClientes.length}</p>
              </div>
              <Search className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Clientes */}
      <div className="grid gap-4">
        {isLoadingClientes ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredClientes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-muted-foreground text-center">
                {searchTerm || statusFilter !== 'all'
                  ? 'Nenhum cliente encontrado com os filtros aplicados.'
                  : 'Nenhum cliente cadastrado ainda. Clique em "Novo Cliente" para começar.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredClientes.map((cliente) => (
            <Card key={cliente.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl">{cliente.nome}</CardTitle>
                      <Badge variant={cliente.status === 'Ativo' ? 'default' : 'secondary'}>
                        {cliente.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {cliente.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {cliente.telefone}
                      </div>
                      {cliente.cidade && cliente.estado && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {cliente.cidade}, {cliente.estado}
                        </div>
                      )}
                      <div className="text-xs">
                        Cadastrado em {formatDate(cliente.dataCriacao)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(cliente)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(cliente.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {cliente.observacoes && (
                <CardContent className="pt-0">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <strong className="text-sm">Observações:</strong>
                    <p className="text-sm text-muted-foreground mt-1">{cliente.observacoes}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};