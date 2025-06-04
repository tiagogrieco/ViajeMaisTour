import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import TelaInicial from './screens/TelaInicial';
import ResumoGerencial from './screens/ResumoGerencial';
import GestaoClientes from './screens/GestaoClientes';
import NovoCliente from './screens/NovoCliente';
import PlanejamentoViagens from './screens/PlanejamentoViagens';
import GestaoTarefas from './screens/GestaoTarefas';
import EditarCliente from './screens/EditarCliente';
import ClienteDetalhes from './screens/ClienteDetalhes';
import OrcamentoViagem from './screens/OrcamentoViagem';
import NovaViagemDeOrcamento from './screens/NovaViagemDeOrcamento';
import HistoricoGeralOrcamentos from './screens/HistoricoGeralOrcamentos';
import EditarViagem from './screens/EditarViagem'; // <<== IMPORTAR O NOVO COMPONENTE

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Home Dashboard */}
          <Route index element={<TelaInicial />} />

          {/* Resumo Gerencial */}
          <Route path="resumo" element={<ResumoGerencial />} />

          {/* Clientes */}
          <Route path="clientes" element={<GestaoClientes />} />
          <Route path="clientes/novo" element={<NovoCliente />} />
          <Route path="clientes/:id" element={<ClienteDetalhes />} />
          <Route path="clientes/editar/:id" element={<EditarCliente />} />

          {/* Viagens / Agenda */}
          <Route path="viagens" element={<PlanejamentoViagens />} />
          <Route path="viagens/nova-de-orcamento" element={<NovaViagemDeOrcamento />} />
          <Route path="viagens/editar/:id" element={<EditarViagem />} /> {/* <<== NOVA ROTA */}


          {/* Tarefas */}
          <Route path="tarefas" element={<GestaoTarefas />} />

          {/* Orçamentos */}
          <Route path="orcamento" element={<OrcamentoViagem />} />
          <Route path="orcamentos/historico" element={<HistoricoGeralOrcamentos />} />
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;