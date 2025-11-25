import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Edit, Plus, Search, Calendar, MapPin, User, Clock, Loader2, Plane, AlertCircle, CheckCircle2, CalendarDays } from 'lucide-react';
import { AgendaItem } from '@/types';
import { FormattedInput } from './FormattedInput';
import { formatDate, formatTime } from '@/utils/formatters';
import { toast } from 'sonner';
import { CalendarView } from './CalendarView';
import { format } from 'date-fns';

import { useAgenda, useAgendaMutations } from '@/hooks/useQueries';

export const AgendaTab: React.FC = () => {
  const { data: agenda = [], isLoading: isLoadingAgenda } = useAgenda();
  const { create: createAgenda, update: updateAgenda, remove: removeAgenda } = useAgendaMutations();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'calendar' | 'upcoming'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());

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

  // Memoize today to avoid re-creating on every render
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  // Filtros e organização de dados
  const filteredAgenda = useMemo(() => {
    return agenda.filter(item => {
      const matchesSearch = item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.local && item.local.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [agenda, searchTerm, statusFilter]);

  const upcomingEvents = useMemo(() => {
    return filteredAgenda
      .filter(item => {
        const eventDate = new Date(item.data);
        return eventDate >= today && item.status !== 'Cancelado' && item.status !== 'Concluído';
      })
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .slice(0, 10);
  }, [filteredAgenda, today]);

  const todayEvents = useMemo(() => {
    return filteredAgenda.filter(item => {
      // Fix timezone offset for accurate comparison if needed, but string comparison is safer for YYYY-MM-DD
      return item.data === format(today, 'yyyy-MM-dd');
    });
  }, [filteredAgenda, today]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setIsLoading(true);

    try {
      if (editingItem) {
        await updateAgenda.mutateAsync({ id: editingItem.id, data: formData });
        toast.success('Agendamento atualizado com sucesso!');
      } else {
        await createAgenda.mutateAsync(formData);
        toast.success('Agendamento criado com sucesso!');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Erro ao salvar agendamento. Tente novamente.');
    }
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

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item da agenda?')) {
      try {
        await removeAgenda.mutateAsync(id);
      } catch (error) {
        // Error handling in mutation
      }
    }
  };

  const handleQuickAction = (type: 'checkin' | 'viagem') => {
    resetForm();
    const titlePrefix = type === 'checkin' ? 'Check-in: ' : 'Viagem: ';
    setFormData(prev => ({ ...prev, titulo: titlePrefix }));
    setIsDialogOpen(true);
  };

  const handleDayClick = (date: Date) => {
    resetForm();
    setFormData(prev => ({ ...prev, data: format(date, 'yyyy-MM-dd') }));
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      'Agendado': { color: 'bg-blue-100 text-blue-800', icon: Calendar },
      'Confirmado': { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      'Cancelado': { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      'Concluído': { color: 'bg-gray-100 text-gray-800', icon: CheckCircle2 },
      'Reagendado': { color: 'bg-yellow-100 text-yellow-800', icon: CalendarDays }
    };
    const config = configs[status as keyof typeof configs] || configs.Agendado;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getDaysUntil = (date: string) => {
    const eventDate = new Date(date);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays < 0) return `${Math.abs(diffDays)} dias atrás`;
    return `Em ${diffDays} dias`;
  };

  const renderEventCard = (item: AgendaItem, showDaysUntil: boolean = false) => (
    <Card key={item.id} className="hover:shadow-lg transition-all border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">{item.titulo}</CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1 font-medium">
                <Calendar className="h-4 w-4" />
                {formatDate(item.data)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTime(item.hora)}
              </div>
              {showDaysUntil && (
                <Badge variant="outline" className="font-normal">
                  {getDaysUntil(item.data)}
                </Badge>
              )}
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
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span><strong>Cliente:</strong> {item.cliente}</span>
          </div>

          {item.local && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span><strong>Local:</strong> {item.local}</span>
            </div>
          )}

          <div className="text-sm">
            <strong>Descrição:</strong> {item.descricao}
          </div>

          {item.observacoes && (
            <div className="text-sm text-muted-foreground bg-amber-50 p-2 rounded border border-amber-200">
              <strong>⚠️ Observações:</strong> {item.observacoes}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header com filtros e Ações Rápidas */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
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

          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => handleQuickAction('checkin')} className="flex-1 sm:flex-none">
              <CheckCircle2 className="h-4 w-4 mr-2 text-purple-600" />
              Check-in
            </Button>
            <Button variant="outline" onClick={() => handleQuickAction('viagem')} className="flex-1 sm:flex-none">
              <Plane className="h-4 w-4 mr-2 text-green-600" />
              Viagem
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="flex-1 sm:flex-none">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo
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
                        placeholder="Ex: Check-in Viagem Paris, Embarque Grupo..."
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
                      placeholder="Aeroporto, Hotel, Ponto de Encontro..."
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
                        placeholder="Detalhes da viagem, documentos necessários, horários..."
                        rows={3}
                        required
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="observacoes">Observações Importantes</Label>
                      <Textarea
                        id="observacoes"
                        value={formData.observacoes || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                        placeholder="Restrições, alertas, lembretes..."
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingItem ? 'Atualizar' : 'Agendar'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Alertas de Hoje */}
      {todayEvents.length > 0 && (
        <Card className="border-amber-500 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertCircle className="h-5 w-5" />
              Atenção: {todayEvents.length} evento(s) hoje!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between bg-white p-3 rounded border">
                  <div>
                    <div className="font-medium">{event.titulo}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(event.hora)} - {event.cliente}
                    </div>
                  </div>
                  {getStatusBadge(event.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs de Visualização */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'list' | 'calendar' | 'upcoming')} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Calendário Mensal</TabsTrigger>
          <TabsTrigger value="upcoming">Próximos Eventos</TabsTrigger>
          <TabsTrigger value="list">Lista Completa</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <CalendarView
            events={filteredAgenda}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onEventClick={handleEdit}
            onDayClick={handleDayClick}
          />
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4 mt-6">
          {upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Nenhum evento próximo agendado.</p>
              </CardContent>
            </Card>
          ) : (
            upcomingEvents.map((item) => renderEventCard(item, true))
          )}
        </TabsContent>

        <TabsContent value="list" className="space-y-4 mt-6">
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
            filteredAgenda
              .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
              .map((item) => renderEventCard(item, false))
          )}
        </TabsContent>
      </Tabs>

      {/* Estatísticas Detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral da Agenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{agenda.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Total</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {agenda.filter(item => item.status === 'Confirmado').length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Confirmados</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-3xl font-bold text-amber-600">
                {upcomingEvents.length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Próximos</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-600">
                {agenda.filter(item => item.status === 'Concluído').length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Concluídos</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600">
                {agenda.filter(item => item.status === 'Cancelado').length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Cancelados</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};