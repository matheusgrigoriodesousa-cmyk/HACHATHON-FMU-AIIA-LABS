import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import { formatarValor } from "./formatters";

const API_URL = "http://localhost:4000";

export default function CartaoPage() {
  const [cartao, setCartao] = useState(null);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchCartaoData = async () => {
      try {
        const res = await axios.get(`${API_URL}/cartao?userId=${user.id}`);
        setCartao(res.data);
      } catch (err) {
        console.error("Erro ao buscar dados do cartão:", err);
        setErro("Não foi possível carregar os dados do cartão.");
      }
    };

    fetchCartaoData();
  }, [user]);

  const pedirAumentoLimite = async () => {
    const valorDesejado = prompt("Qual o novo limite de crédito que você deseja solicitar?");
    
    // Retorna se o usuário cancelar ou não digitar nada.
    if (!valorDesejado) return;

    // Converte a vírgula em ponto para tratar valores como "5000,00"
    const valorNumerico = Number(valorDesejado.replace(',', '.'));

    if (isNaN(valorNumerico)) {
      alert("Por favor, insira um valor numérico válido.");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/cartao/pedir-limite`, {
        userId: user.id,
        valorDesejado: valorNumerico
      });
      setMensagem(res.data.mensagem);
    } catch (err) {
      setErro("Não foi possível processar sua solicitação no momento.");
    }
  };

  const handlePagarFatura = async () => {
    if (cartao.gastosFatura <= 0) {
      setMensagem("Sua fatura já está paga!");
      return;
    }

    if (!window.confirm(`Deseja pagar o valor total da fatura de ${formatarValor(cartao.gastosFatura)}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/cartao/pagar-fatura`, {
        userId: user.id,
        valor: cartao.gastosFatura // Corrigido de 'valorFatura' para 'valor'
      });
      if (res.data.sucesso) {
        // Atualiza o estado local para refletir o pagamento imediatamente
        setCartao(prevCartao => ({
          ...prevCartao,
          gastosFatura: 0, // Zera a fatura
        }));
        navigate('/comprovante', { state: { transacao: res.data.transacao } });
      }
    } catch (err) {
      const erroMsg = err.response?.data?.mensagem || "Não foi possível processar o pagamento.";
      setErro(erroMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (erro) {
    return <div className="container"><p className="error-message">{erro}</p></div>;
  }

  if (!cartao) {
    return <div className="container"><p>Carregando dados do cartão...</p></div>;
  }

  const limiteDisponivel = cartao.limiteTotal - cartao.gastosFatura;

  return (
    <div className="container cartao-container">
      <h2>Cartão de Crédito</h2>

      <div className="cartao-virtual">
        <div className="cartao-chip"></div>
        <div className="cartao-info">
          <span className="cartao-numero">**** **** **** {cartao.numeroFinal}</span>
          <span className="cartao-nome">{cartao.nomeTitular}</span>
        </div>
      </div>

      <div className="fatura-info card">
        <div className="fatura-item">
          <span>Fatura Atual</span>
          <strong className="fatura-valor">{formatarValor(cartao.gastosFatura)}</strong>
        </div>
        <div className="fatura-item">
          <span>Limite Disponível</span>
          <strong>{formatarValor(limiteDisponivel)}</strong>
        </div>
      </div>

      {mensagem && <p className="success-message">{mensagem}</p>}

      <div className="acoes-cartao">
        <button onClick={handlePagarFatura} disabled={isLoading || cartao.gastosFatura <= 0} className="servicos-form button secondary">
          {isLoading ? 'Processando...' : 'Pagar Fatura'}
        </button>
        <Link to="/fatura" className="servicos-form button secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>Ver Extrato</Link>
        <button onClick={pedirAumentoLimite} className="servicos-form button secondary">Pedir mais limite</button>
      </div>
    </div>
  );
}
