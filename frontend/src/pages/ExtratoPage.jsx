import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { formatarValor } from './formatters';

const API_URL = "http://localhost:4000";

export default function ExtratoPage() {
  const { user } = useAuth();
  const [gastosPorCategoria, setGastosPorCategoria] = useState({});
  const [transacoes, setTransacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // Busca os gastos agrupados por categoria
          const resCategorias = await axios.get(`${API_URL}/gastos/categorias?userId=${user.id}`);
          setGastosPorCategoria(resCategorias.data);

          // Busca o extrato completo de transações
          const resTransacoes = await axios.get(`${API_URL}/transacoes?userId=${user.id}`);
          // Ordena as transações da mais recente para a mais antiga
          setTransacoes(resTransacoes.data.sort((a, b) => new Date(b.data) - new Date(a.data)));

        } catch (err) {
          setError('Não foi possível carregar os dados do extrato.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  if (isLoading) {
    return <div className="container"><h2>Carregando extrato...</h2></div>;
  }

  if (error) {
    return <div className="container"><p className="error-message">{error}</p></div>;
  }

  return (
    <div className="container extrato-container">
      <h2>Análise de Gastos e Extrato</h2>

      <div className="analise-gastos-section">
        <h3>Gastos e Entradas por Categoria</h3>
        {Object.keys(gastosPorCategoria).length > 0 ? (
          <ul className="lista-categorias">
            {Object.entries(gastosPorCategoria).map(([categoria, valor]) => (
              <li key={categoria} className={valor > 0 ? 'entrada' : 'saida'}>
                <span>{categoria}</span>
                <strong>{formatarValor(valor)}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma movimentação encontrada para análise.</p>
        )}
      </div>

      <div className="extrato-detalhado-section">
        <h3>Últimas Transações</h3>
        <ul className="lista-transacoes">
          {transacoes.map(t => (
            <li key={t.id} className="transacao-item">
              <div className="transacao-info">
                <strong>{t.descricao}</strong>
                <span>{new Date(t.data).toLocaleDateString('pt-BR')}</span>
              </div>
              <strong className={t.valor > 0 ? 'valor-entrada' : 'valor-saida'}>
                {formatarValor(t.valor)}
              </strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
