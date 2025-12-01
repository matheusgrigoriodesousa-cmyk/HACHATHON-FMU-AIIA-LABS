/**
 * Layout.jsx: Componente que define a estrutura visual principal da aplicação.
 * 
 * Responsabilidades:
 * - Renderizar a barra de navegação lateral (Sidebar).
 * - Renderizar o conteúdo da rota ativa através do componente <Outlet>.
 * - Incluir componentes globais como o Chatbot.
 */
import { Outlet, NavLink } from 'react-router-dom';
import Chatbot from './Chatbot.jsx';
import { IconeHome, IconeServicos, IconeExtrato, IconeCartao, IconeBoleto } from './Icons.jsx';

export default function Layout() {
  // Objeto de estilo para destacar o link ativo no menu.
  const activeLinkStyle = {
    color: 'var(--cor-primaria)',
    backgroundColor: 'var(--cor-fundo-hover)',
  };

  return (
    <div className="layout">
      {/* Barra de Navegação Lateral */}
      <nav className="sidebar-nav">
        <div className="nav-brand">Telecon Hub</div>
        <div className="nav-links-container">
          {/* NavLink é um componente do React Router que sabe se o link está ativo ou não */}
          <NavLink to="/" className="nav-link" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
            <IconeHome /><span>Início</span>
          </NavLink>
          <NavLink to="/servicos" className="nav-link" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
            <IconeServicos /><span>Serviço</span>
          </NavLink>
          <NavLink to="/cartao" className="nav-link" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
            <IconeCartao /><span>Cartão</span>
          </NavLink>
          <NavLink to="/extrato" className="nav-link" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
            <IconeExtrato />
            <span>Extrato</span>
          </NavLink>
          <NavLink to="/comprovantes" className="nav-link" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
            <IconeBoleto />
            <span>Comprovante</span>
          </NavLink>
        </div>
      </nav>

      {/* Conteúdo Principal da Página */}
      {/* O <Outlet> é um marcador de posição do React Router. */}
      {/* Ele renderiza o componente da rota filha correspondente (ex: Dashboard, Extrato, etc.). */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* O Chatbot é renderizado aqui para estar disponível em todas as páginas do layout. */}
      <Chatbot />
    </div>
  );
}