/**
 * Dashboard.jsx: Componente da página inicial (Home).
 * 
 * Responsabilidades:
 * - Saudar o usuário logado.
 * - Exibir o saldo atual da conta.
 * - Apresentar botões de acesso rápido para os principais serviços.
 * - Listar as 5 transações mais recentes.
 */
import { useState, useEffect } from 'react';
import axios from "axios";
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { formatarValor, formatarData } from './formatters';
import { IconePix, IconeBoleto, IconeCelular, IconeEntrada, IconeSaida, IconeCartao } from './Icons';

// URL base do seu backend
const API_URL = 'http://localhost:4000';

/**
 * Componente principal do Dashboard.
 */
export default function Dashboard() {
  // Estados para armazenar os dados buscados da API
  const [saldo, setSaldo] = useState(0);
  const [transacoes, setTransacoes] = useState([]);
  const [erro, setErro] = useState('');
  const location = useLocation(); // Hook para re-executar o useEffect ao navegar
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return; // Guarda de segurança: não faz nada se o usuário não estiver logado

      try {
        // Otimização: Busca o saldo e as transações em paralelo para carregar a página mais rápido.
        const [saldoRes, transacoesRes] = await Promise.all([
          axios.get(`${API_URL}/gastos?userId=${user.id}`),
          axios.get(`${API_URL}/transacoes?userId=${user.id}`)
        ]);

        setSaldo(parseFloat(saldoRes.data.total));

        // Ordena as transações da mais recente para a mais antiga e pega apenas as 5 primeiras.
        const transacoesOrdenadas = transacoesRes.data
          .sort((a, b) => new Date(b.data) - new Date(a.data))
          .slice(0, 5); // Pega apenas as 5 mais recentes
        setTransacoes(transacoesOrdenadas);

      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setErro('Não foi possível carregar os dados. Verifique se o backend está rodando.');
      }
    };

    fetchData();
    // A dependência 'location' garante que os dados sejam recarregados se o usuário navegar para o dashboard
    // vindo de uma página que alterou os dados (ex: após um pagamento).
  }, [location, user]); 

  return (
    <div className="container">
      <header className="dashboard-header">
        {/* Exibe o nome do usuário obtido do contexto de autenticação */}
        <h1>Olá, {user?.nome}</h1>
        <button onClick={logout} className="logout-button">
          Sair
        </button>
      </header>

      <main>
        {erro && <p className="error-message">{erro}</p>}

        {/* Card que exibe o saldo principal */}
        <section className="card saldo-card">
          <h2>Saldo em Conta</h2>
          <p className="saldo-valor">{formatarValor(saldo)}</p>
        </section>

        {/* Seção com botões de atalho para as principais funcionalidades */}
        <section className="acoes-card">
          <div className="acoes-buttons">
            <Link to="/pix" className="acao-button">
              <IconePix />
              <span>Pix</span>
            </Link>
            <Link to="/pagamento" className="acao-button">
              <IconeBoleto />
              <span>Pagar</span>
            </Link>
            <Link to="/recarga" className="acao-button">
              <IconeCelular />
              <span>Recarga</span>
            </Link>
            <Link to="/cartao" className="acao-button">
              <IconeCartao />
              <span>Cartão</span>
            </Link>
          </div>
        </section>

        {/* Seção que lista as últimas transações */}
        <section className="card transacoes-card">
          <h2>Atividade Recente</h2>
          <ul className="transacoes-lista">
            {transacoes.length > 0 ? (
              transacoes.map((t) => (
                <li key={t.id} className="transacao-item">
                  <div className="transacao-icon">
                    {/* Exibe um ícone diferente para entrada e saída de dinheiro */}
                    {t.valor > 0 ? <IconeEntrada /> : <IconeSaida />}
                  </div>
                  <div className="transacao-info">
                    <span className="transacao-descricao">{t.descricao}</span>
                    <span className="transacao-data">{formatarData(t.data)}</span>
                  </div>
                  {/* Adiciona um sinal de '+' para valores de entrada */}
                  <span className={`transacao-valor ${t.valor > 0 ? 'entrada' : 'saida'}`}>
                    {t.valor > 0 ? '+' : ''}{formatarValor(t.valor)}
                  </span>
                </li>
              ))
            ) : (
              !erro && <p>Nenhuma transação recente.</p>
            )}
          </ul>
        </section>
      </main>
    </div>
  );
}
