import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Edit, Plus, Search, Building, Phone, Mail, MapPin } from 'lucide-react';
import { Fornecedor } from '@/types';
import { FormattedInput } from './FormattedInput';
import { formatDate } from '@/utils/formatters';

interface FornecedoresTabProps {
  fornecedores: Fornecedor[];
  setFornecedores: React.Dispatch<React.SetStateAction<Fornecedor[]>>;
}

export const FornecedoresTab: React.FC<FornecedoresTabProps> = ({ fornecedores, setFornecedores }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Fornecedor | null>(null);
  const [formData, setFormData] = useState<Omit<Fornecedor, 'id' | 'dataCriacao'>>({
    nome: '',
    tipo: 'Operadora',
    contato: '',
    telefone: '',
    email: '',
    cnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    observacoes: ''
  });

  const filteredFornecedores = fornecedores.filter(fornecedor => {
    const matchesSearch = fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fornecedor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (fornecedor.cnpj && fornecedor.cnpj.includes(searchTerm));
    const matchesTipo = tipoFilter === 'all' || fornecedor.tipo === tipoFilter;
    return matchesSearch && matchesTipo;
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: 'Operadora',
      contato: '',
      telefone: '',
      email: '',
      cnpj: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      observacoes: ''
    });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      setFornecedores(prev => prev.map(fornecedor => 
        fornecedor.id === editingItem.id 
          ? { ...fornecedor, ...formData }
          : fornecedor
      ));
    } else {
      const novoFornecedor: Fornecedor = {
        id: Date.now().toString(),
        ...formData,
        dataCriacao: new Date().toISOString()
      };
      setFornecedores(prev => [...prev, novoFornecedor]);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (fornecedor: Fornecedor) => {
    setEditingItem(fornecedor);
    setFormData({
      nome: fornecedor.nome,
      tipo: fornecedor.tipo,
      contato: fornecedor.contato,
      telefone: fornecedor.telefone,
      email: fornecedor.email,
      cnpj: fornecedor.cnpj || '',
      endereco: fornecedor.endereco || '',
      cidade: fornecedor.cidade || '',
      estado: fornecedor.estado || '',
      cep: fornecedor.cep || '',
      observacoes: fornecedor.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
      setFornecedores(prev => prev.filter(fornecedor => fornecedor.id !== id));
    }
  };

  const getTipoBadge = (tipo: string) => {
    const colors = {
      'Operadora': 'bg-blue-100 text-blue-800',
      'Cia Aérea': 'bg-sky-100 text-sky-800',
      'Hotel': 'bg-green-100 text-green-800',
      'Seguro': 'bg-purple-100 text-purple-800',
      'Transporte': 'bg-orange-100 text-orange-800',
      'Restaurante': 'bg-red-100 text-red-800',
      'Companhia Aérea': 'bg-indigo-100 text-indigo-800',
      'Agência': 'bg-pink-100 text-pink-800',
      'Outro': 'bg-gray-100 text-gray-800'
    };
    return <Badge className={colors[tipo as keyof typeof colors] || colors.Outro}>{tipo}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome, email ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="Operadora">Operadora</SelectItem>
              <SelectItem value="Cia Aérea">Cia Aérea</SelectItem>
              <SelectItem value="Hotel">Hotel</SelectItem>
              <SelectItem value="Seguro">Seguro</SelectItem>
              <SelectItem value="Transporte">Transporte</SelectItem>
              <SelectItem value="Restaurante">Restaurante</SelectItem>
              <SelectItem value="Companhia Aérea">Companhia Aérea</SelectItem>
              <SelectItem value="Agência">Agência</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar Fornecedor' : 'Novo Fornecedor'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <FormattedInput
                    label="Nome da Empresa"
                    type="text"
                    value={formData.nome}
                    onChange={(value) => setFormData(prev => ({ ...prev, nome: value }))}
                    placeholder="Digite o nome da empresa"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Fornecedor</Label>
                  <Select value={formData.tipo} onValueChange={(value: Fornecedor['tipo']) => setFormData(prev => ({ ...prev, tipo: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Operadora">Operadora</SelectItem>
                      <SelectItem value="Cia Aérea">Cia Aérea</SelectItem>
                      <SelectItem value="Hotel">Hotel</SelectItem>
                      <SelectItem value="Seguro">Seguro</SelectItem>
                      <SelectItem value="Transporte">Transporte</SelectItem>
                      <SelectItem value="Restaurante">Restaurante</SelectItem>
                      <SelectItem value="Companhia Aérea">Companhia Aérea</SelectItem>
                      <SelectItem value="Agência">Agência</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <FormattedInput
                  label="Pessoa de Contato"
                  type="text"
                  value={formData.contato}
                  onChange={(value) => setFormData(prev => ({ ...prev, contato: value }))}
                  placeholder="Nome do contato"
                  required
                />
                
                <FormattedInput
                  label="CNPJ"
                  type="cnpj"
                  value={formData.cnpj || ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, cnpj: value }))}
                  placeholder="00.000.000/0000-00"
                />
                
                <FormattedInput
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                  placeholder="contato@empresa.com"
                  required
                />
                
                <FormattedInput
                  label="Telefone"
                  type="phone"
                  value={formData.telefone}
                  onChange={(value) => setFormData(prev => ({ ...prev, telefone: value }))}
                  placeholder="(11) 99999-9999"
                  required
                />
                
                <div className="md:col-span-2">
                  <FormattedInput
                    label="Endereço"
                    type="text"
                    value={formData.endereco || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, endereco: value }))}
                    placeholder="Rua, número, bairro"
                  />
                </div>
                
                <FormattedInput
                  label="CEP"
                  type="cep"
                  value={formData.cep || ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, cep: value }))}
                  placeholder="00000-000"
                />
                
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
                
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações sobre o fornecedor..."
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

      {/* Lista de Fornecedores */}\n      <div className="grid gap-4">
        {filteredFornecedores.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || tipoFilter !== 'all' 
                  ? 'Nenhum fornecedor encontrado com os filtros aplicados.' 
                  : 'Nenhum fornecedor cadastrado ainda.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredFornecedores.map((fornecedor) => (
            <Card key={fornecedor.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      {fornecedor.nome}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {getTipoBadge(fornecedor.tipo)}
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {fornecedor.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {fornecedor.telefone}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(fornecedor)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(fornecedor.id)}
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
                      <strong>Contato:</strong> {fornecedor.contato}
                    </div>
                    {fornecedor.cnpj && (
                      <div>
                        <strong>CNPJ:</strong> {fornecedor.cnpj}
                      </div>
                    )}
                    {fornecedor.cidade && fornecedor.estado && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span><strong>Localização:</strong> {fornecedor.cidade}/{fornecedor.estado}</span>
                      </div>
                    )}
                  </div>
                  
                  {fornecedor.endereco && (
                    <div className="text-sm">
                      <strong>Endereço:</strong> {fornecedor.endereco}
                      {fornecedor.cep && `, CEP: ${fornecedor.cep}`}
                    </div>
                  )}
                  
                  {fornecedor.observacoes && (
                    <div className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                      <strong>Observações:</strong> {fornecedor.observacoes}
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Cadastrado em {formatDate(fornecedor.dataCriacao)}
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
          <CardTitle>Estatísticas de Fornecedores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{fornecedores.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {fornecedores.filter(f => f.tipo === 'Operadora').length}
              </div>
              <div className="text-sm text-muted-foreground">Operadoras</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-sky-600">
                {fornecedores.filter(f => f.tipo === 'Cia Aérea' || f.tipo === 'Companhia Aérea').length}
              </div>
              <div className="text-sm text-muted-foreground">Cias Aéreas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {fornecedores.filter(f => f.tipo === 'Hotel').length}
              </div>
              <div className="text-sm text-muted-foreground">Hotéis</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};