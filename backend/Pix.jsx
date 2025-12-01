import { Link } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { IconePix, IconeSaida, IconeCopiaCola } from './Icons';
import { FaQrcode } from 'react-icons/fa';

/**
 * Pix.jsx: Componente da página de serviços PIX.
 *
 * Responsabilidades:
 * - Apresentar as opções de transações PIX disponíveis.
 * - Navegar para as respectivas telas de cada serviço.
 */
export default function Pix() {
  return (
    <div className="container">
      <AppHeader title="Área Pix" />

      <main>
        <section className="card">
          <h2>O que você gostaria de fazer?</h2>
          {/* Seção com botões de atalho para as funcionalidades PIX */}
          <div className="acoes-buttons" style={{ justifyContent: 'center', marginTop: '20px' }}>
            <Link to="/pix/enviar" className="acao-button">
              <IconeSaida />
              <span>Enviar</span>
            </Link>
            <Link to="/pix/receber-qr" className="acao-button">
              <FaQrcode size={28} />
              <span>Receber QR</span>
            </Link>
            <Link to="/pix/copia-e-cola" className="acao-button">
              <IconeCopiaCola />
              <span>Copia e Cola</span>
            </Link>
            {/* Futuramente, podemos adicionar mais botões aqui */}
            {/* 
            <Link to="/pix/chaves" className="acao-button">
              <FaKey size={28} />
              <span>Minhas Chaves</span>
            </Link>
            */}
          </div>
        </section>
      </main>
    </div>
  );
}