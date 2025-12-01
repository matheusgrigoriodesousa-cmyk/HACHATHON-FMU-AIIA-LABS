/**
 * PagamentoPage.jsx: Componente para a funcionalidade de pagamento de boletos.
 * 
 * Responsabilidades:
 * - Renderizar um formulário para inserção de código de barras e valor.
 * - Formatar o campo de valor como moeda brasileira em tempo real.
 * - Enviar os dados do pagamento para a API.
 * - Redirecionar para a página de comprovante em caso de sucesso.
 */
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const API_URL = "http://localhost:4000/servicos";

export default function PagamentoPage() {
  // Estados para os campos do formulário, status da operação e carregamento
  const [codigo, setCodigo] = useState("");
  const [valorPag, setValorPag] = useState("");
  const [status, setStatus] = useState({ texto: "", tipo: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  /**
   * Exibe uma mensagem de status (sucesso ou erro) por 3 segundos.
   */
  const mostrarMensagemTemporaria = (texto, tipo) => {
    setStatus({ texto, tipo });
    setTimeout(() => setStatus({ texto: "", tipo: "" }), 3000);
  };

  /**
   * Lida com a submissão do formulário de pagamento.
   */
  const enviarPagamento = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      // Limpa a formatação do valor (remove "R$", pontos e vírgula) para enviar um número puro para a API.
      // Ex: "R$ 1.500,50" -> "150050" -> 1500.50
      const valorNumerico = Number(valorPag.replace(/\D/g, '')) / 100;

      // Validação para garantir que o valor seja positivo.
      if (valorNumerico <= 0) {
        mostrarMensagemTemporaria("O valor do pagamento deve ser maior que zero.", "erro");
        setIsLoading(false);
        return;
      }

      const res = await axios.post(`${API_URL}/pagamento`, {
        codigo_barras: codigo,
        valor: valorNumerico,
        userId: user.id,
      });
      if (res.data.sucesso) {
        // Se o pagamento for bem-sucedido, navega para a página de comprovante,
        // passando os dados da transação via `location.state`.
        navigate('/comprovante', { state: { transacao: res.data.transacao } });
      }
    } catch (err) {
      const erroMsg = err.response?.data?.mensagem || "Ocorreu um erro na operação.";
      mostrarMensagemTemporaria(erroMsg, 'erro');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Formata o valor do input como moeda brasileira (BRL) enquanto o usuário digita.
   */
  const handleValorChange = (e) => {
    let value = e.target.value;
    // 1. Remove tudo que não for dígito.
    value = value.replace(/\D/g, '');
    // 2. Converte para número e divide por 100 para tratar os centavos.
    const numberValue = Number(value) / 100;
    // 3. Usa a API Intl.NumberFormat para formatar o número como moeda.
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numberValue);
    setValorPag(formattedValue);
  };

  return (
    <div className="container servicos-container">
      <h2>Pagamento de Contas</h2>
      <form onSubmit={enviarPagamento} className="servicos-form">
        <input
          type="text"
          placeholder="Digite o código de barras"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          required
        />
        <input
          // O tipo é "text" para permitir a máscara de formatação (R$, vírgula, etc.).
          type="text"
          placeholder="Valor do pagamento"
          value={valorPag}
          onChange={handleValorChange}
          required
        />
        <button type="submit" disabled={isLoading}>
          {/* Altera o texto do botão durante o carregamento */}
          {isLoading ? 'Processando...' : 'Pagar Boleto'}
        </button>
      </form>
      {/* Exibe a mensagem de status, se houver */}
      {status.texto && (
        <p className={status.tipo === 'erro' ? 'error-message' : 'success-message'}>{status.texto}</p>
      )}
    </div>
  );
}