import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function CadastroPage() {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:4000/cadastro', {
        nome,
        cpf,
        senha,
      });

      if (response.data.success) {
        alert('Cadastro realizado com sucesso! Faça o login para continuar.');
        navigate('/login');
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
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <form onSubmit={handleCadastro} className="servicos-form" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--cor-primaria)' }}>Crie sua conta</h2>
        <input
          type="text"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Crie uma senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        {error && <p className="error-message" style={{ margin: '10px 0 0 0' }}>{error}</p>}
        <button type="submit" style={{ marginTop: '15px' }}>
          Cadastrar
        </button>
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          Já tem uma conta? <Link to="/login" style={{ color: 'var(--cor-primaria)' }}>Faça o login</Link>
        </p>
      </form>
    </div>
  );
}