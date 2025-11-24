import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Edit, Plus, Search, User, Users } from 'lucide-react';
import { Dependente, Cliente } from '@/types';
import { FormattedInput } from './FormattedInput';
import { formatDate } from '@/utils/formatters';

interface DependentesTabProps {
  dependentes: Dependente[];
  setDependentes: React.Dispatch<React.SetStateAction<Dependente[]>>;
  clientes: Cliente[];
}

export const DependentesTab: React.FC<DependentesTabProps> = ({ dependentes, setDependentes, clientes }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clienteFilter, setClienteFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Dependente | null>(null);
  const [formData, setFormData] = useState<Omit<Dependente, 'id' | 'dataCriacao'>>({
    nome: '',
    cpf: '',
    dataNascimento: '',
    parentesco: '',
    clienteId: '',
    observacoes: ''
  });

  const filteredDependentes = dependentes.filter(dependente => {
    const cliente = clientes.find(c => c.id === dependente.clienteId);
    const matchesSearch = dependente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dependente.cpf.includes(searchTerm) ||
                         (cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCliente = clienteFilter === 'all' || dependente.clienteId === clienteFilter;
    return matchesSearch && matchesCliente;
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      cpf: '',
      dataNascimento: '',
      parentesco: '',
      clienteId: '',
      observacoes: ''
    });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      setDependentes(prev => prev.map(dependente => 
        dependente.id === editingItem.id 
          ? { ...dependente, ...formData }
          : dependente
      ));
    } else {
      const novoDependente: Dependente = {
        id: Date.now().toString(),
        ...formData,
        dataCriacao: new Date().toISOString()
      };
      setDependentes(prev => [...prev, novoDependente]);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (dependente: Dependente) => {
    setEditingItem(dependente);
    setFormData({
      nome: dependente.nome,
      cpf: dependente.cpf,
      dataNascimento: dependente.dataNascimento,
      parentesco: dependente.parentesco,
      clienteId: dependente.clienteId,
      observacoes: dependente.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este dependente?')) {
      setDependentes(prev => prev.filter(dependente => dependente.id !== id));
    }
  };

  const getClienteNome = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente?.nome || 'Cliente não encontrado';
  };

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome, CPF ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={clienteFilter} onValueChange={setClienteFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Clientes</SelectItem>
              {clientes.map(cliente => (
                <SelectItem key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Dependente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar Dependente' : 'Novo Dependente'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <FormattedInput
                    label="Nome Completo"
                    type="text"
                    value={formData.nome}
                    onChange={(value) => setFormData(prev => ({ ...prev, nome: value }))}
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>
                
                <FormattedInput
                  label="CPF"
                  type="cpf"
                  value={formData.cpf}
                  onChange={(value) => setFormData(prev => ({ ...prev, cpf: value }))}
                  placeholder="000.000.000-00"
                  required
                />
                
                <FormattedInput
                  label="Data de Nascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(value) => setFormData(prev => ({ ...prev, dataNascimento: value }))}
                  required
                />
                
                <div className="space-y-2">
                  <Label htmlFor="clienteId">Cliente</Label>
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
                  <Label htmlFor="parentesco">Parentesco</Label>
                  <Select value={formData.parentesco} onValueChange={(value) => setFormData(prev => ({ ...prev, parentesco: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o parentesco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cônjuge">Cônjuge</SelectItem>
                      <SelectItem value="Filho(a)">Filho(a)</SelectItem>
                      <SelectItem value="Pai">Pai</SelectItem>
                      <SelectItem value="Mãe">Mãe</SelectItem>
                      <SelectItem value="Irmão(ã)">Irmão(ã)</SelectItem>
                      <SelectItem value="Avô(ó)">Avô(ó)</SelectItem>
                      <SelectItem value="Neto(a)">Neto(a)</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações sobre o dependente..."
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingItem ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Dependentes */}
      <div className="grid gap-4">
        {filteredDependentes.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || clienteFilter !== 'all' 
                  ? 'Nenhum dependente encontrado com os filtros aplicados.' 
                  : 'Nenhum dependente cadastrado ainda.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDependentes.map((dependente) => (
            <Card key={dependente.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {dependente.nome}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span><strong>Cliente:</strong> {getClienteNome(dependente.clienteId)}</span>
                      </div>
                      <span><strong>Parentesco:</strong> {dependente.parentesco}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(dependente)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(dependente.id)}
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
                    <div>
                      <strong>CPF:</strong> {dependente.cpf}
                    </div>
                    <div>
                      <strong>Data de Nascimento:</strong> {formatDate(dependente.dataNascimento)}
                    </div>
                  </div>
                  
                  {dependente.observacoes && (
                    <div className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                      <strong>Observações:</strong> {dependente.observacoes}
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Cadastrado em {formatDate(dependente.dataCriacao)}
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
          <CardTitle>Estatísticas de Dependentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{dependentes.length}</div>
              <div className="text-sm text-muted-foreground">Total de Dependentes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {dependentes.filter(dep => dep.parentesco === 'Cônjuge').length}
              </div>
              <div className="text-sm text-muted-foreground">Cônjuges</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {dependentes.filter(dep => dep.parentesco === 'Filho(a)').length}
              </div>
              <div className="text-sm text-muted-foreground">Filhos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {dependentes.filter(dep => !['Cônjuge', 'Filho(a)'].includes(dep.parentesco)).length}
              </div>
              <div className="text-sm text-muted-foreground">Outros</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};