import { Link } from "react-router-dom";
import { IconePix, IconeBoleto, IconeCelular } from './Icons';

export default function Servicos() {
  return (
    <div className="container servicos-container">
      <h2>Serviços</h2>
      <p>Selecione a operação que deseja realizar.</p>
      <div className="acoes-buttons" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/pix" className="acao-button">
          <IconePix />
          <span>Área Pix</span>
        </Link>
        <Link to="/pagamento" className="acao-button">
          <IconeBoleto />
          <span>Pagar Conta</span>
        </Link>
        <Link to="/recarga" className="acao-button">
          <IconeCelular />
          <span>Recarga</span>
        </Link>
      </div>
    </div>
  );
}
