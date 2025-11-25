import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from '@/components/Layout';
import LoginPage from '@/components/LoginPage';
import { DashboardTab } from '@/components/DashboardTab';
import { AgendaTab } from '@/components/AgendaTab';
import { ClientesTab } from '@/components/ClientesTab';
import { DependentesTab } from '@/components/DependentesTab';
import { FornecedoresTab } from '@/components/FornecedoresTab';
import { ProdutosTab } from '@/components/ProdutosTab';
import { CotacoesTab } from '@/components/CotacoesTab';
import { RelatoriosTab } from '@/components/RelatoriosTab';
import UsuariosTab from '@/components/UsuariosTab';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { logout } from '@/lib/auth';
import { toast } from 'sonner';

const queryClient = new QueryClient();

// Wrapper for Layout to handle logout with navigation
const LayoutWrapper = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logout realizado com sucesso!');
    navigate('/login');
  };

  return <Layout onLogout={handleLogout} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter basename="/sistema">
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<LayoutWrapper />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardTab onNavigate={(tab) => window.location.href = `/${tab}`} />} />
            <Route path="/agenda" element={<AgendaTab />} />
            <Route path="/clientes" element={<ClientesTab />} />
            <Route path="/dependentes" element={<DependentesTab />} />
            <Route path="/fornecedores" element={<FornecedoresTab />} />
            <Route path="/produtos" element={<ProdutosTab />} />
            <Route path="/cotacoes" element={<CotacoesTab />} />
            <Route path="/relatorios" element={<RelatoriosTab />} />
            <Route path="/usuarios" element={<UsuariosTab />} />
          </Route>
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;