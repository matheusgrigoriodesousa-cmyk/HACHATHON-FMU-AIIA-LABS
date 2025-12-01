import { useLocation, Link } from 'react-router-dom';
import { formatarValor } from './formatters';
import { IconeCheck } from './Icons';

export default function ComprovantePage() {
  const location = useLocation();
  const { transacao } = location.state || {}; // Pega a transação enviada pela página de Serviços

  if (!transacao) {
    return (
      <div className="container comprovante-container">
        <h1>Erro</h1>
        <p>Não foi possível carregar os dados do comprovante.</p>
        <Link to="/" className="servicos-form button">Voltar para o Início</Link>
      </div>
    );
  }

  const getTitulo = (categoria) => {
    switch (categoria) {
      case 'recarga':
        return 'Comprovante de Recarga';
      case 'pix_envio':
        return 'Comprovante de PIX';
      case 'pagamento':
        return 'Comprovante de Pagamento';
      default:
        return 'Comprovante de Transação';
    }
  };

  return (
    <div className="container comprovante-container">
      <div className="comprovante-header">
        <IconeCheck />
        <h1>{getTitulo(transacao.categoria)}</h1>
        <p>Operação realizada com sucesso!</p>
      </div>

      <div className="comprovante-body">
        <div className="comprovante-item">
          <span>Valor</span>
          <strong>{formatarValor(Math.abs(transacao.valor))}</strong>
        </div>
        <div className="comprovante-item">
          <span>Data</span>
          <strong>{new Date(transacao.data).toLocaleDateString('pt-BR')}</strong>
        </div>
        <div className="comprovante-item">
          <span>Descrição</span>
          <strong>{transacao.descricao}</strong>
        </div>
        <div className="comprovante-item">
          <span>ID da Transação</span>
          <strong>{`${transacao.userId}-${transacao.id}`}</strong>
        </div>
      </div>

      <Link to="/" className="servicos-form button" style={{ textDecoration: 'none', textAlign: 'center' }}>
        Voltar para o Início
      </Link>
    </div>
  );
}