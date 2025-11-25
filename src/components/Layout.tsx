import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Package,
  Building2,
  UserCircle,
  ClipboardList,
  LogOut,
  User,
  Download,
  UserCog
} from 'lucide-react';

interface LayoutProps {
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ onLogout }) => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'clientes', label: 'Clientes', icon: Users, path: '/clientes' },
    { id: 'dependentes', label: 'Dependentes', icon: UserCircle, path: '/dependentes' },
    { id: 'fornecedores', label: 'Fornecedores', icon: Building2, path: '/fornecedores' },
    { id: 'produtos', label: 'Produtos', icon: Package, path: '/produtos' },
    { id: 'cotacoes', label: 'Cotações', icon: FileText, path: '/cotacoes' },
    { id: 'agenda', label: 'Agenda', icon: Calendar, path: '/agenda' },
    { id: 'relatorios', label: 'Relatórios', icon: ClipboardList, path: '/relatorios' },
    { id: 'usuarios', label: 'Usuários', icon: UserCog, path: '/usuarios' }
  ];

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-lg flex flex-col fixed h-full z-50">
        {/* Logo */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="Viaje Mais Tour"
              className="h-10 w-auto object-contain"
            />
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Viaje Mais Tour
              </h1>
              <p className="text-[10px] text-muted-foreground">Sistema CRM</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.path;
              return (
                <Link key={tab.id} to={tab.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={`w-full justify-start gap-3 ${isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
              {currentUser?.nome?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser?.nome}</p>
              <p className="text-xs text-muted-foreground">
                {currentUser?.tipo === 'Admin' ? 'Administrador' : 'Usuário'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <main className="p-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-auto">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center md:items-start">
                <h3 className="font-semibold text-gray-900 mb-2">Viaje Mais Tour</h3>
                <p className="text-sm text-muted-foreground text-center md:text-left">Sistema de Gestão de Relacionamento com Cliente</p>
              </div>
              <div className="flex flex-col items-center">
                <h3 className="font-semibold text-gray-900 mb-2">CNPJ</h3>
                <a
                  href={`${import.meta.env.BASE_URL}cnpj.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                >
                  <img
                    src={`${import.meta.env.BASE_URL}cnpj.png`}
                    alt="Cartão CNPJ"
                    className="max-w-full h-auto max-h-32 object-contain rounded border cursor-pointer hover:shadow-lg transition-shadow"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">Clique para ampliar</span>
                  </div>
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(`${import.meta.env.BASE_URL}cnpj.png`, 'Cartao_CNPJ_ViajeMaisTour.png')}
                  className="mt-2 text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Baixar
                </Button>
              </div>
              <div className="flex flex-col items-center md:items-end">
                <h3 className="font-semibold text-gray-900 mb-2">CADASTUR</h3>
                <a
                  href={`${import.meta.env.BASE_URL}cadastur.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                >
                  <img
                    src={`${import.meta.env.BASE_URL}cadastur.png`}
                    alt="Certificado CADASTUR"
                    className="max-w-full h-auto max-h-32 object-contain rounded border cursor-pointer hover:shadow-lg transition-shadow"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">Clique para ampliar</span>
                  </div>
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(`${import.meta.env.BASE_URL}cadastur.png`, 'Certificado_CADASTUR_ViajeMaisTour.png')}
                  className="mt-2 text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Baixar
                </Button>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t text-center text-xs text-muted-foreground">
              <p>© 2024 Viaje Mais Tour. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};