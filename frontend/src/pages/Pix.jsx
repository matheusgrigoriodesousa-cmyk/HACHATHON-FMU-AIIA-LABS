import { Link } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { IconeSaida, IconeEntrada, IconeCopiaCola, IconeChave } from './Icons';
import { FaQrcode } from 'react-icons/fa';

/**
 * Pix.jsx: Componente da página de serviços PIX.
 *
 * Responsabilidades:
 * - Apresentar atalhos para as principais ações PIX (Enviar, Receber).
 * - Listar outras opções PIX em formato de caixas de serviço.
 * - Navegar para as respectivas telas de cada serviço.
 */
export default function Pix() {
  return (
    <div className="container">
      <AppHeader title="Área Pix" />
      <main>
        {/* Seção com botões de atalho principais, similar ao Dashboard */}
        <section className="acoes-card">
          <div className="acoes-buttons" style={{ justifyContent: 'flex-start', gap: '15px' }}>
            <Link to="/pix/enviar" className="acao-button">
              <IconeSaida />
              <span>Enviar</span>
            </Link>
            <Link to="/pix/receber" className="acao-button">
              <IconeEntrada />
              <span>Receber</span>
            </Link>
          </div>
        </section>

        {/* Lista de outros serviços PIX em formato de caixas */}
        <div className="lista-servicos-pix" style={{ marginTop: '30px' }}>
          <Link to="/pix/pagar-qrcode" className="servico-item-pix">
            <div className="servico-icone">
              <FaQrcode size={28} />
            </div>
            <div className="servico-info">
              <h3>Pagar com QR Code</h3>
              <p>Aponte a câmera para ler o código.</p>
            </div>
          </Link>

          <Link to="/pix/copia-e-cola" className="servico-item-pix">
            <div className="servico-icone">
              <IconeCopiaCola />
            </div>
            <div className="servico-info">
              <h3>PIX Copia e Cola</h3>
              <p>Pague usando um código copiado.</p>
            </div>
          </Link>

          <Link to="/pix/chaves" className="servico-item-pix">
            <div className="servico-icone">
              <IconeChave />
            </div>
            <div className="servico-info">
              <h3>Minhas Chaves</h3>
              <p>Gerencie suas chaves cadastradas.</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}