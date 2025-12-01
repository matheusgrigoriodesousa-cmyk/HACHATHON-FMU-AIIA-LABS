/**
 * App.jsx: Componente raiz da aplicação.
 * 
 * Responsabilidades:
 * - Configurar o provedor de autenticação (AuthProvider) para toda a aplicação.
 * - Definir a estrutura de rotas usando React Router.
 * - Separar rotas públicas (Login, Cadastro) de rotas protegidas (o resto da aplicação).
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '../../Style.css';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './pages/ProtectedRoute';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import Servicos from './pages/Servicos';
import Extrato from './pages/Extrato';
import LoginPage from './pages/LoginPage';
import CadastroPage from './pages/CadastroPage';
import ComprovantePage from './pages/ComprovantePage';
import PixPage from './pages/PixPage';
import RecargaPage from './pages/RecargaPage';
import PagamentoPage from './pages/PagamentoPage';
import CartaoPage from './pages/CartaoPage';
import ComprovantesPage from './pages/ComprovantesPage';
import { FaturaPage } from '/src/pages/FaturaPage.jsx';

function App() {
  return (
    // O AuthProvider envolve toda a aplicação, disponibilizando o contexto de autenticação.
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas: Acessíveis sem login */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />

          {/* Rotas Protegidas: Exigem que o usuário esteja autenticado */}
          <Route element={<ProtectedRoute />}>
            {/* O componente Layout define a estrutura visual com a barra lateral e o conteúdo principal */}
            <Route path="/" element={<Layout />}>
              {/* A rota 'index' é a página inicial (Dashboard) quando o caminho é "/" */}
              <Route index element={<Dashboard />} />
              {/* Demais rotas filhas que serão renderizadas dentro do Layout */}
              <Route path="servicos" element={<Servicos />} />
              <Route path="extrato" element={<Extrato />} />
              <Route path="pix" element={<PixPage />} />
              <Route path="recarga" element={<RecargaPage />} />
              <Route path="pagamento" element={<PagamentoPage />} />
              {/* Rota para exibir um comprovante específico após uma transação */}
              <Route path="comprovante" element={<ComprovantePage />} />
              <Route path="cartao" element={<CartaoPage />} />
              {/* Rota para listar todos os comprovantes/transações do usuário */}
              <Route path="comprovantes" element={<ComprovantesPage />} />
              <Route path="fatura" element={<FaturaPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
