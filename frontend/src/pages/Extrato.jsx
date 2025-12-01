import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { formatarValor, formatarData } from './formatters';
import { IconeEntrada, IconeSaida } from './Icons';

export default function Extrato() {
  const [transacoes, setTransacoes] = useState([]);
  const [erro, setErro] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    axios.get(`http://localhost:4000/transacoes?userId=${user.id}`)
      .then(res => {
        const transacoesOrdenadas = res.data.sort((a, b) => new Date(b.data) - new Date(a.data));
        setTransacoes(transacoesOrdenadas);
      })
      .catch(err => {
        console.error(err);
        setErro("Não foi possível carregar o extrato.");
      });
  }, [user]);

  return (
    <div className="container">
      <h2>Extrato</h2>
      <section className="card transacoes-card">
        <ul className="transacoes-lista">
          {erro && <p>{erro}</p>}
          {transacoes.length > 0 ? (
            transacoes.map((t) => (
              <li key={t.id} className="transacao-item">
                <div className="transacao-icon">
                  {t.valor > 0 ? <IconeEntrada /> : <IconeSaida />}
                </div>
                <div className="transacao-info">
                  <span className="transacao-descricao">{t.descricao}</span>
                  <span className="transacao-data">{formatarData(t.data)}</span>
                </div>
                <span className={`transacao-valor ${t.valor > 0 ? 'entrada' : 'saida'}`}>
                  {t.valor > 0 ? '+' : ''}{formatarValor(t.valor)}
                </span>
              </li>
            ))
          ) : (!erro && <p>Nenhuma transação encontrada.</p>)}
        </ul>
      </section>
    </div>
  );
}
