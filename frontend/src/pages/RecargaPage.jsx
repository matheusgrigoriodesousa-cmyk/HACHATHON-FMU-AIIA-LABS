import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const API_URL = "http://localhost:4000/servicos";

export default function RecargaPage() {
  const [numero, setNumero] = useState("");
  const [valorRecarga, setValorRecarga] = useState("");
  const [status, setStatus] = useState({ texto: "", tipo: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const mostrarMensagemTemporaria = (texto, tipo) => {
    setStatus({ texto, tipo });
    setTimeout(() => setStatus({ texto: "", tipo: "" }), 3000);
  };

  const enviarRecarga = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      // Converte o valor formatado (ex: "R$ 20,00") para um número (ex: 20.00)
      const valorNumerico = Number(valorRecarga.replace(/\D/g, '')) / 100;

      if (valorNumerico <= 0) {
        mostrarMensagemTemporaria("O valor da recarga deve ser maior que zero.", "erro");
        setIsLoading(false);
        return;
      }

      const res = await axios.post(`${API_URL}/recarga`, {
        numero,
        valor: valorNumerico,
        userId: user.id,
      });
      if (res.data.sucesso) {
        navigate('/comprovante', { state: { transacao: res.data.transacao } });
      }
    } catch (err) {
      const erroMsg = err.response?.data?.mensagem || "Ocorreu um erro na operação.";
      mostrarMensagemTemporaria(erroMsg, 'erro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValorChange = (e) => {
    let value = e.target.value;
    // Remove tudo que não for dígito
    value = value.replace(/\D/g, '');
    // Converte para número e divide por 100 para ter os centavos
    const numberValue = Number(value) / 100;
    // Formata como moeda brasileira
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numberValue);
    setValorRecarga(formattedValue);
  };

  return (
    <div className="container servicos-container">
      <h2>Recarga de Celular</h2>
      <form onSubmit={enviarRecarga} className="servicos-form">
        <input
          type="tel"
          placeholder="Número com DDD"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Valor da recarga"
          value={valorRecarga}
          onChange={handleValorChange}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Processando...' : 'Recarregar'}
        </button>
      </form>
      {status.texto && (
        <p className={status.tipo === 'erro' ? 'error-message' : 'success-message'}>{status.texto}</p>
      )}
    </div>
  );
}