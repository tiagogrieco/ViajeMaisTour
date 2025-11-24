import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Edit, Plus, Search, Calendar, MapPin, User, Clock } from 'lucide-react';
import { AgendaItem } from '@/types';
import { FormattedInput } from './FormattedInput';
import { formatDate, formatTime } from '@/utils/formatters';

interface AgendaTabProps {
  agenda: AgendaItem[];
  setAgenda: React.Dispatch<React.SetStateAction<AgendaItem[]>>;
}

export const AgendaTab: React.FC<AgendaTabProps> = ({ agenda, setAgenda }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null);
  const [formData, setFormData] = useState<Omit<AgendaItem, 'id' | 'dataCriacao'>>({
    titulo: '',
    descricao: '',
    data: '',
    hora: '',
    local: '',
    cliente: '',
    status: 'Agendado',
    observacoes: ''
  });

  const filteredAgenda = agenda.filter(item => {
    const matchesSearch = item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.local && item.local.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      data: '',
      hora: '',
      local: '',
      cliente: '',
      status: 'Agendado',
      observacoes: ''
    });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      setAgenda(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...formData }
          : item
      ));
    } else {
      const novoItem: AgendaItem = {
        id: Date.now().toString(),
        ...formData,
        dataCriacao: new Date().toISOString()
      };
      setAgenda(prev => [...prev, novoItem]);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (item: AgendaItem) => {
    setEditingItem(item);
    setFormData({
      titulo: item.titulo,
      descricao: item.descricao,
      data: item.data,
      hora: item.hora,
      local: item.local || '',
      cliente: item.cliente,
      status: item.status,
      observacoes: item.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item da agenda?')) {
      setAgenda(prev => prev.filter(item => item.id !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'Agendado': 'bg-blue-100 text-blue-800',
      'Confirmado': 'bg-green-100 text-green-800',
      'Cancelado': 'bg-red-100 text-red-800',
      'Concluído': 'bg-gray-100 text-gray-800',
      'Reagendado': 'bg-yellow-100 text-yellow-800'
    };
    return <Badge className={colors[status as keyof typeof colors] || colors.Agendado}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por título, cliente ou local..."
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
              <SelectItem value="Agendado">Agendado</SelectItem>
              <SelectItem value="Confirmado">Confirmado</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
              <SelectItem value="Concluído">Concluído</SelectItem>
              <SelectItem value="Reagendado">Reagendado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar Agendamento' : 'Novo Agendamento'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <FormattedInput
                    label="Título"
                    type="text"
                    value={formData.titulo}
                    onChange={(value) => setFormData(prev => ({ ...prev, titulo: value }))}
                    placeholder="Digite o título do agendamento"
                    required
                  />
                </div>
                
                <FormattedInput
                  label="Data"
                  type="date"
                  value={formData.data}
                  onChange={(value) => setFormData(prev => ({ ...prev, data: value }))}
                  required
                />
                
                <FormattedInput
                  label="Hora"
                  type="time"
                  value={formData.hora}
                  onChange={(value) => setFormData(prev => ({ ...prev, hora: value }))}
                  required
                />
                
                <FormattedInput
                  label="Cliente"
                  type="text"
                  value={formData.cliente}
                  onChange={(value) => setFormData(prev => ({ ...prev, cliente: value }))}
                  placeholder="Nome do cliente"
                  required
                />
                
                <FormattedInput
                  label="Local"
                  type="text"
                  value={formData.local || ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, local: value }))}
                  placeholder="Local do encontro"
                />
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: 'Agendado' | 'Confirmado' | 'Cancelado' | 'Concluído' | 'Reagendado') => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Agendado">Agendado</SelectItem>
                      <SelectItem value="Confirmado">Confirmado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                      <SelectItem value="Concluído">Concluído</SelectItem>
                      <SelectItem value="Reagendado">Reagendado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descrição do agendamento..."
                    rows={3}
                    required
                  />
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações adicionais..."
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingItem ? 'Atualizar' : 'Agendar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Agendamentos */}
      <div className="grid gap-4">
        {filteredAgenda.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Nenhum agendamento encontrado com os filtros aplicados.' 
                  : 'Nenhum agendamento cadastrado ainda.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAgenda.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {item.titulo}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(item.data)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(item.hora)}
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(item.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span><strong>Cliente:</strong> {item.cliente}</span>
                  </div>
                  
                  {item.local && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span><strong>Local:</strong> {item.local}</span>
                    </div>
                  )}
                  
                  <div>
                    <strong>Descrição:</strong> {item.descricao}
                  </div>
                  
                  {item.observacoes && (
                    <div className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                      <strong>Observações:</strong> {item.observacoes}
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Criado em {formatDate(item.dataCriacao)}
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
          <CardTitle>Estatísticas da Agenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{agenda.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {agenda.filter(item => item.status === 'Agendado').length}
              </div>
              <div className="text-sm text-muted-foreground">Agendados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {agenda.filter(item => item.status === 'Confirmado').length}
              </div>
              <div className="text-sm text-muted-foreground">Confirmados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {agenda.filter(item => item.status === 'Concluído').length}
              </div>
              <div className="text-sm text-muted-foreground">Concluídos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {agenda.filter(item => item.status === 'Cancelado').length}
              </div>
              <div className="text-sm text-muted-foreground">Cancelados</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};