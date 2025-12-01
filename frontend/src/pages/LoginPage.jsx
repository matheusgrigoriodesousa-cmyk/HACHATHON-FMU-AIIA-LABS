/**
 * LoginPage.jsx: Componente da página de login.
 * 
 * Responsabilidades:
 * - Renderizar o formulário de login (CPF e senha).
 * - Gerenciar o estado dos campos do formulário.
 * - Lidar com a submissão do formulário, enviando os dados para a API de login.
 * - Redirecionar o usuário para o Dashboard em caso de sucesso.
 * - Exibir mensagens de erro em caso de falha.
 */
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { IconeLinkedin } from './Icons';

export default function LoginPage() {
  // Estados para os campos do formulário e mensagens de erro
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  /**
   * Função executada ao submeter o formulário de login.
   */
  const handleLogin = async (e) => {
    e.preventDefault(); // Previne o recarregamento padrão da página
    setError('');

    try {
      // Envia as credenciais para o backend
      const response = await axios.post('http://localhost:4000/login', {
        cpf,
        senha,
      });

      if (response.data.success) {
        // Se o login for bem-sucedido, chama a função 'login' do AuthContext
        // para armazenar os dados do usuário globalmente.
        login(response.data.user); // Passa os dados do usuário para o contexto
        navigate('/'); // Redireciona o usuário para a página inicial
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError('Erro de conexão. O servidor está offline?');
      }
    }
  };

  return (
    <div className="login-page-container">
      {/* Wrapper para o formulário */}
      <div className="login-form-wrapper">
        <form onSubmit={handleLogin} className="servicos-form" style={{ maxWidth: '400px', width: '100%' }}>
          <h2 style={{ textAlign: 'center', color: 'var(--cor-primaria)', marginBottom: '5px' }}>Telecon Hub</h2>
          <p style={{ textAlign: 'center', marginTop: '0', color: 'var(--cor-texto-claro)' }}>Acesse sua conta</p>
          <input
            type="text"
            placeholder="Digite seu CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          {error && <p className="error-message" style={{ margin: '10px 0 0 0' }}>{error}</p>}
          <button type="submit" style={{ marginTop: '15px' }}>
            Entrar
          </button>
          <p style={{ textAlign: 'center', marginTop: '20px' }}>
            Não tem uma conta? <Link to="/cadastro" style={{ color: 'var(--cor-primaria)' }}>Cadastre-se</Link>
          </p>
        </form>
      </div>

      {/* Rodapé com links para os perfis do LinkedIn */}
      <footer className="login-footer">
        <p>Desenvolvido por:</p>
        <div className="footer-links">
          <a href="https://www.linkedin.com/in/matheus-grigorio-77a51b355" target="_blank" rel="noopener noreferrer">
            <IconeLinkedin /> <span>Matheus Grigorio</span>
          </a>
          <a href="https://www.linkedin.com/in/mtanganelli" target="_blank" rel="noopener noreferrer">
            <IconeLinkedin /> <span>Maria Tanganelli</span>
          </a>
          <a href="https://www.linkedin.com/in/isabelah-campos" target="_blank" rel="noopener noreferrer">
            <IconeLinkedin /> <span>Isabelah Campos</span>
          </a>
        </div>
      </footer>
    </div>
  );
}