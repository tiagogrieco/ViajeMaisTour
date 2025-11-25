import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserPlus,
  Building2,
  Package,
  FileText,
  BarChart3,
  Shield,
  LogOut,
  User,
  Download
} from 'lucide-react';

interface LayoutProps {
  onLogout: () => void;
}

export function Layout({ onLogout }: LayoutProps) {
  const currentUser = getCurrentUser();
  const userIsAdmin = isAdmin();
  const location = useLocation();

  const tabs = [
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agenda', path: '/agenda', label: 'Agenda', icon: Calendar },
    { id: 'clientes', path: '/clientes', label: 'Clientes', icon: Users },
    { id: 'dependentes', path: '/dependentes', label: 'Dependentes', icon: UserPlus },
    { id: 'fornecedores', path: '/fornecedores', label: 'Fornecedores', icon: Building2 },
    { id: 'produtos', path: '/produtos', label: 'Produtos', icon: Package },
    { id: 'cotacoes', path: '/cotacoes', label: 'Cotações', icon: FileText },
    { id: 'relatorios', path: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  ];

  // Adicionar aba de usuários apenas para Admin
  if (userIsAdmin) {
    tabs.push({ id: 'usuarios', path: '/usuarios', label: 'Usuários', icon: Shield });
  }

  const handleDownload = (imagePath: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = imagePath;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <img
                src="/logo.png"
                alt="Viaje Mais Tour"
                className="h-12 w-auto object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Viaje Mais Tour
                </h1>
                <p className="text-xs text-muted-foreground">Sistema de Gestão CRM</p>
              </div>
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{currentUser?.nome}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentUser?.tipo === 'Admin' ? 'Administrador' : 'Usuário'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.path;
              return (
                <Link key={tab.id} to={tab.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className={`flex items-center gap-2 whitespace-nowrap ${isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
  );
}