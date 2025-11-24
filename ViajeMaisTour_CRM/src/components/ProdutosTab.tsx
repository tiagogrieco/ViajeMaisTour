import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Edit, Plus, Search, Package, DollarSign } from 'lucide-react';
import { Produto } from '@/types';
import { formatDate, formatCurrency } from '@/utils/formatters';

interface ProdutosTabProps {
  produtos: Produto[];
  setProdutos: React.Dispatch<React.SetStateAction<Produto[]>>;
}

export const ProdutosTab: React.FC<ProdutosTabProps> = ({ produtos, setProdutos }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Produto | null>(null);
  const [formData, setFormData] = useState<Omit<Produto, 'id' | 'dataCriacao'>>({
    nome: '',
    categoria: 'Pacote',
    destino: '',
    descricao: '',
    preco: 0,
    duracao: '',
    incluso: '',
    naoIncluso: '',
    observacoes: ''
  });

  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (produto.destino && produto.destino.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategoria = categoriaFilter === 'all' || produto.categoria === categoriaFilter;
    return matchesSearch && matchesCategoria;
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      categoria: 'Pacote',
      destino: '',
      descricao: '',
      preco: 0,
      duracao: '',
      incluso: '',
      naoIncluso: '',
      observacoes: ''
    });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      setProdutos(prev => prev.map(produto => 
        produto.id === editingItem.id 
          ? { ...produto, ...formData }
          : produto
      ));
    } else {
      const novoProduto: Produto = {
        id: Date.now().toString(),
        ...formData,
        dataCriacao: new Date().toISOString()
      };
      setProdutos(prev => [...prev, novoProduto]);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (produto: Produto) => {
    setEditingItem(produto);
    setFormData({
      nome: produto.nome,
      categoria: produto.categoria || 'Pacote',
      destino: produto.destino || '',
      descricao: produto.descricao,
      preco: produto.preco,
      duracao: produto.duracao || '',
      incluso: produto.incluso || '',
      naoIncluso: produto.naoIncluso || '',
      observacoes: produto.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      setProdutos(prev => prev.filter(produto => produto.id !== id));
    }
  };

  const getCategoriaBadge = (categoria?: Produto['categoria']) => {
    const colors = {
      'Pacote': 'bg-blue-100 text-blue-800',
      'Hospedagem': 'bg-green-100 text-green-800',
      'Transporte': 'bg-yellow-100 text-yellow-800',
      'Seguro': 'bg-red-100 text-red-800',
      'Passeio': 'bg-purple-100 text-purple-800'
    };
    const cat = categoria || 'Pacote';
    return <Badge className={colors[cat]}>{cat}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome, descrição ou destino..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              <SelectItem value="Pacote">Pacote</SelectItem>
              <SelectItem value="Hospedagem">Hospedagem</SelectItem>
              <SelectItem value="Transporte">Transporte</SelectItem>
              <SelectItem value="Seguro">Seguro</SelectItem>
              <SelectItem value="Passeio">Passeio</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="nome">Nome do Produto</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Digite o nome do produto"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value: Produto['categoria']) => setFormData(prev => ({ ...prev, categoria: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pacote">Pacote</SelectItem>
                      <SelectItem value="Hospedagem">Hospedagem</SelectItem>
                      <SelectItem value="Transporte">Transporte</SelectItem>
                      <SelectItem value="Seguro">Seguro</SelectItem>
                      <SelectItem value="Passeio">Passeio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="destino">Destino</Label>
                  <Input
                    id="destino"
                    value={formData.destino}
                    onChange={(e) => setFormData(prev => ({ ...prev, destino: e.target.value }))}
                    placeholder="Destino da viagem"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="preco">Preço</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.preco}
                    onChange={(e) => setFormData(prev => ({ ...prev, preco: parseFloat(e.target.value) || 0 }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duracao">Duração</Label>
                  <Input
                    id="duracao"
                    value={formData.duracao}
                    onChange={(e) => setFormData(prev => ({ ...prev, duracao: e.target.value }))}
                    placeholder="Ex: 7 dias / 6 noites"
                  />
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descrição detalhada do produto"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="incluso">O que está incluído</Label>
                  <Textarea
                    id="incluso"
                    value={formData.incluso}
                    onChange={(e) => setFormData(prev => ({ ...prev, incluso: e.target.value }))}
                    placeholder="Liste o que está incluído no pacote"
                    rows={3}
                  />
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="naoIncluso">O que não está incluído</Label>
                  <Textarea
                    id="naoIncluso"
                    value={formData.naoIncluso}
                    onChange={(e) => setFormData(prev => ({ ...prev, naoIncluso: e.target.value }))}
                    placeholder="Liste o que não está incluído no pacote"
                    rows={3}
                  />
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Informações adicionais sobre o produto..."
                    rows={2}
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

      {/* Lista de Produtos */}
      <div className="grid gap-4">
        {filteredProdutos.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || categoriaFilter !== 'all' 
                  ? 'Nenhum produto encontrado com os filtros aplicados.' 
                  : 'Nenhum produto cadastrado ainda.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProdutos.map((produto) => (
            <Card key={produto.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {produto.nome}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {getCategoriaBadge(produto.categoria)}
                      {produto.dataCriacao && (
                        <span className="text-sm text-muted-foreground">
                          Criado em {formatDate(produto.dataCriacao)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(produto)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(produto.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  {produto.destino && (
                    <div>
                      <strong>Destino:</strong> {produto.destino}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span><strong>Preço:</strong> {formatCurrency(produto.preco)}</span>
                  </div>
                  {produto.duracao && (
                    <div>
                      <strong>Duração:</strong> {produto.duracao}
                    </div>
                  )}
                  <div className="md:col-span-2 lg:col-span-3">
                    <strong>Descrição:</strong> {produto.descricao}
                  </div>
                  {produto.incluso && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <strong>Incluído:</strong> {produto.incluso}
                    </div>
                  )}
                  {produto.naoIncluso && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <strong>Não incluído:</strong> {produto.naoIncluso}
                    </div>
                  )}
                  {produto.observacoes && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <strong>Observações:</strong> {produto.observacoes}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{produtos.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {produtos.filter(p => p.categoria === 'Pacote').length}
              </div>
              <div className="text-sm text-muted-foreground">Pacotes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {produtos.filter(p => p.categoria === 'Hospedagem').length}
              </div>
              <div className="text-sm text-muted-foreground">Hospedagens</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(produtos.reduce((total, p) => total + p.preco, 0) / produtos.length || 0)}
              </div>
              <div className="text-sm text-muted-foreground">Preço Médio</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};