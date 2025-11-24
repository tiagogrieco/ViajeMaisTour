import React, { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, FileText, Award, Calendar, Users, UserPlus, Package, Building2, Sheet } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Header com Logo e Informações da Empresa */}
        <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <img 
                src="/uploads/Logo Viaje Mais Tur Atual.png" 
                alt="Viaje Mais Tour" 
                className="h-16 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-3xl font-bold text-blue-900">Viaje Mais Tour</h1>
                <p className="text-blue-700">Sistema de Gestão CRM</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Award className="w-3 h-3 mr-1" />
                    CADASTUR: 59.688.475/0001-65
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Building className="w-3 h-3 mr-1" />
                    CNPJ: 59.726.312/0001-20
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Botões de Certificações */}
            <div className="flex space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Award className="w-4 h-4 mr-2" />
                    CADASTUR
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Certificado CADASTUR</DialogTitle>
                  </DialogHeader>
                  <div className="flex justify-center">
                    <img 
                      src="/uploads/CERTIFICADO_CADASTUR Imagem.png" 
                      alt="Certificado CADASTUR" 
                      className="max-w-full h-auto rounded-lg shadow-lg"
                    />
                  </div>
                  <div className="text-sm text-gray-600 mt-4">
                    <p><strong>Prestador:</strong> ALINE MARTINS GONÇALVES</p>
                    <p><strong>Número:</strong> 59.688.475/0001-65</p>
                    <p><strong>Atividade:</strong> Agência de Turismo</p>
                    <p><strong>Validade:</strong> 05/03/2025 a 05/03/2027</p>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    CNPJ
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Cartão CNPJ</DialogTitle>
                  </DialogHeader>
                  <div className="flex justify-center">
                    <img 
                      src="/uploads/Cartao CNPJ Imagem.png" 
                      alt="Cartão CNPJ" 
                      className="max-w-full h-auto rounded-lg shadow-lg"
                    />
                  </div>
                  <div className="text-sm text-gray-600 mt-4">
                    <p><strong>Razão Social:</strong> ALINE MARTINS GONÇALVES</p>
                    <p><strong>CNPJ:</strong> 59.726.312/0001-20</p>
                    <p><strong>Atividade Principal:</strong> Agências de viagens</p>
                    <p><strong>Endereço:</strong> AV LAZARA ALVES FERREIRA, 80 - UBERLÂNDIA/MG</p>
                    <p><strong>Situação:</strong> ATIVA desde 02/03/2025</p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        
        <Card className="p-6 shadow-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sistema CRM - Viaje Mais Tour</h2>
            <p className="text-gray-600">Gerencie clientes, cotações, produtos e agenda de forma integrada</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7 mb-6">
              <TabsTrigger value="agenda" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Agenda
              </TabsTrigger>
              <TabsTrigger value="clientes" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Clientes
              </TabsTrigger>
              <TabsTrigger value="dependentes" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Dependentes
              </TabsTrigger>
              <TabsTrigger value="fornecedores" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Fornecedores
              </TabsTrigger>
              <TabsTrigger value="produtos" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Produtos
              </TabsTrigger>
              <TabsTrigger value="cotacoes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Cotações
              </TabsTrigger>
              <TabsTrigger value="google-sheets" className="flex items-center gap-2">
                <Sheet className="h-4 w-4" />
                Google Sheets
              </TabsTrigger>
            </TabsList>

            <div className="min-h-[600px]">
              {children}
            </div>
          </Tabs>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>© 2025 Viaje Mais Tour - Todos os direitos reservados</p>
          <p>CADASTUR: 59.688.475/0001-65 | CNPJ: 59.726.312/0001-20</p>
          <p>Uberlândia/MG - Brasil</p>
        </div>
      </div>
    </div>
  );
};