import { useState, useEffect } from "react"; // Importa os hooks 'useState' e 'useEffect' do React para gerenciar estado e efeitos colaterais.
import axios from "axios"; // Importa a biblioteca 'axios' para fazer requisições HTTP para o backend.
import { useNavigate } from "react-router-dom"; // Importa o hook 'useNavigate' do React Router para navegar entre páginas.
import { QRCodeSVG } from "qrcode.react"; // Importa o componente 'QRCodeSVG' para renderizar QR Codes em formato SVG.
import { useAuth } from "../AuthContext"; // Importa o hook 'useAuth' do contexto de autenticação para obter dados do usuário logado.
import { Html5QrcodeScanner } from "html5-qrcode"; // Importa a biblioteca para leitura de QR Code.
import { FaArrowCircleUp, FaArrowCircleDown, FaKey } from 'react-icons/fa'; // Importa ícones da biblioteca 'react-icons/fa' para usar na interface.

const API_URL = "http://localhost:4000"; // Define a URL base da API do backend para centralizar as chamadas.

export default function PixPage() { // Define e exporta o componente funcional 'PixPage'.
  const [secaoAtiva, setSecaoAtiva] = useState('enviar'); // Estado para controlar qual seção (acordeão) está ativa: 'enviar', 'receber' ou 'chaves'. Inicia com 'enviar'.
  // Estados para o formulário de ENVIO.
  const [chave, setChave] = useState(""); // Estado para armazenar a chave PIX de destino no formulário de envio.
  const [valorPix, setValorPix] = useState(""); // Estado para armazenar o valor a ser enviado no PIX, formatado como moeda.

  // Estados para a funcionalidade de RECEBIMENTO.
  const [valorCobranca, setValorCobranca] = useState(""); // Estado para armazenar o valor a ser cobrado ao gerar um QR Code.
  const [qrCodePayload, setQrCodePayload] = useState(""); // Estado para armazenar o payload (texto) do QR Code gerado.
  const [chaveAleatoria, setChaveAleatoria] = useState(""); // Estado para armazenar uma chave PIX aleatória gerada para recebimento.

  // Estados gerais do componente.
  const [status, setStatus] = useState({ texto: "", tipo: "" }); // Estado para gerenciar mensagens de status (sucesso, erro, info) exibidas ao usuário.
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar o estado de carregamento (loading) de operações assíncronas.
  const navigate = useNavigate(); // Hook para obter a função de navegação do React Router.
  const { user } = useAuth(); // Hook para extrair os dados do usuário ('user') do contexto de autenticação.

  // Estados para a seção "Minhas Chaves".
  const [minhasChaves, setMinhasChaves] = useState([]); // Estado para armazenar a lista de chaves PIX cadastradas pelo usuário.

  // Estados para o formulário de cadastro de nova chave.
  const [tipoNovaChave, setTipoNovaChave] = useState(''); // Estado para o tipo de chave selecionada no formulário de cadastro ('cpf', 'email', etc.).
  const [valorNovaChave, setValorNovaChave] = useState(''); // Estado para o valor da nova chave que está sendo digitada pelo usuário.
  const [isScannerOpen, setIsScannerOpen] = useState(false); // Estado para controlar a visibilidade do leitor de QR Code.

  // Efeito que executa quando o componente é montado ou quando o 'user' muda.
  useEffect(() => { // Hook de efeito para executar código em resposta a mudanças.
    if (user) { // Verifica se o objeto 'user' existe (se o usuário está logado).
      // Função para buscar as chaves PIX do usuário no backend
      const fetchChaves = async () => {
        try {
          // Futuramente, o ideal é ter um endpoint GET /chaves-pix?userId=...
          // Por enquanto, vamos simular com a chave CPF padrão.
          // Esta lógica pode ser expandida quando o endpoint de listagem for criado.
          const chavesIniciais = [{ tipo: 'CPF', valor: user.cpf, padrao: true }];
          // const res = await axios.get(`${API_URL}/chaves-pix?userId=${user.id}`);
          // setMinhasChaves(res.data);
          setMinhasChaves(chavesIniciais);
        } catch (error) {
          console.error("Erro ao buscar chaves PIX:", error);
          mostrarMensagemTemporaria("Não foi possível carregar suas chaves.", "erro");
        }
      };
      fetchChaves();
    }
  }, [user]);

  // Efeito para controlar o scanner de QR Code.
  useEffect(() => {
    if (isScannerOpen) {
      // Cria uma nova instância do scanner.
      const scanner = new Html5QrcodeScanner(
        'qr-reader', // ID do elemento div onde o scanner será renderizado.
        { fps: 10, qrbox: 250 }, // Configurações: 10 frames por segundo e uma caixa de escaneamento de 250x250 pixels.
        false // 'verbose' set to false.
      );

      // Função chamada quando um QR Code é lido com sucesso.
      const onScanSuccess = (decodedText) => {
        // O 'decodedText' é o conteúdo do QR Code (PIX Copia e Cola).
        setChave(decodedText); // Preenche o campo de chave PIX com o conteúdo lido.
        setIsScannerOpen(false); // Fecha o scanner.
        setSecaoAtiva('enviar'); // Garante que a seção de envio esteja visível.
        mostrarMensagemTemporaria("QR Code lido com sucesso!", "sucesso");
        scanner.clear(); // Limpa e para o scanner.
      };

      // Função para lidar com erros (opcional).
      const onScanError = (error) => {
        // Você pode adicionar um log ou tratamento de erro aqui, se desejar.
        // console.warn(`QR Code scan error = ${error}`);
      };

      // Inicia o scanner.
      scanner.render(onScanSuccess, onScanError);

      // Função de limpeza: será chamada quando o componente for desmontado ou o scanner for fechado.
      return () => {
        scanner.clear();
      };
    }
  }, [isScannerOpen]); // Este efeito depende do estado 'isScannerOpen'.
  /**
   * Exibe uma mensagem de status (sucesso ou erro) por 3 segundos.
   */
  const mostrarMensagemTemporaria = (texto, tipo) => { // Define a função que recebe um texto e um tipo de mensagem.
    setStatus({ texto, tipo }); // Atualiza o estado 'status' para exibir a mensagem.
    setTimeout(() => setStatus({ texto: "", tipo: "" }), 3000); // Define um temporizador para limpar a mensagem após 3 segundos.
  }; // Fecha a função 'mostrarMensagemTemporaria'.

  /**
   * Lida com a submissão do formulário de envio de PIX.
   */
  const enviarPix = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true); // Ativa o estado de carregamento para desabilitar o botão e mostrar feedback.

    try { // Inicia um bloco 'try' para lidar com possíveis erros na requisição.
      // Converte o valor formatado (ex: "R$ 50,00") para um número (ex: 50.00).
      const valorNumerico = Number(valorPix.replace(/\D/g, '')) / 100; // Remove caracteres não numéricos e converte para valor monetário.

      if (valorNumerico <= 0) { // Verifica se o valor é válido (maior que zero).
        mostrarMensagemTemporaria("O valor do PIX deve ser maior que zero.", "erro"); // Exibe uma mensagem de erro se o valor for inválido.
        setIsLoading(false); // Desativa o estado de carregamento.
        return; // Interrompe a execução da função.
      } // Fecha o bloco 'if'.

      const res = await axios.post(`${API_URL}/servicos/pix`, { // Envia uma requisição POST para o endpoint de PIX.
        chave_destino: chave, // Corpo da requisição com a chave de destino.
        valor: valorNumerico, // Corpo da requisição com o valor numérico.
        userId: user.id, // Corpo da requisição com o ID do usuário logado.
      }); // Fecha o objeto da requisição.
      if (res.data.sucesso) { // Verifica se a resposta da API indica sucesso.
        navigate('/comprovante', { state: { transacao: res.data.transacao } }); // Navega para a página de comprovante, passando os dados da transação.
      } // Fecha o bloco 'if'.
    } catch (err) { // Captura qualquer erro que ocorra no bloco 'try'.
      const erroMsg = err.response?.data?.mensagem || "Ocorreu um erro na operação."; // Extrai a mensagem de erro da resposta da API ou usa uma mensagem padrão.
      mostrarMensagemTemporaria(erroMsg, 'erro'); // Exibe a mensagem de erro para o usuário.
    } finally { // O bloco 'finally' é executado independentemente de ter ocorrido um erro ou não.
      setIsLoading(false); // Garante que o estado de carregamento seja desativado ao final da operação.
    } // Fecha o bloco 'finally'.
  }; // Fecha a função 'enviarPix'.

  /**
   * Formata o valor do input como moeda brasileira (BRL) enquanto o usuário digita.
   */
  const handleValorChange = (e, setValor) => { // Define a função que recebe o evento do input e a função de atualização de estado.
    let value = e.target.value; // Pega o valor atual do campo de input.
    // Remove tudo que não for dígito.
    value = value.replace(/\D/g, ''); // Usa uma expressão regular para limpar o valor.
    // Converte para número e divide por 100 para ter os centavos.
    const numberValue = Number(value) / 100; // Transforma a string de dígitos em um número decimal.
    // Formata como moeda brasileira.
    const formattedValue = new Intl.NumberFormat('pt-BR', { // Usa a API de internacionalização para formatar o número.
      style: 'currency', // Define o estilo como moeda.
      currency: 'BRL' // Define a moeda como Real Brasileiro.
    }).format(numberValue); // Formata o valor numérico.
    setValor(formattedValue); // Atualiza o estado correspondente com o valor formatado.
  }; // Fecha a função 'handleValorChange'.

  /**
   * Formata o valor da chave (CPF ou Telefone) enquanto o usuário digita.
   */
  const handleChaveChange = (e, tipo) => { // Define a função que formata a chave, recebendo o evento e o tipo de chave.
    // Se for e-mail, apenas atualiza o estado sem formatar.
    if (tipo === 'email') {
      setValorNovaChave(e.target.value);
      return;
    }

    const input = e.target; // Armazena o elemento do input para manipulação.
    let value = input.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos do valor digitado.
    let formattedValue = value; // Inicializa o valor formatado com o valor limpo.

    if (tipo === 'cpf') { // Se o tipo da chave for 'cpf'.

      formattedValue = value // Aplica a máscara de CPF.
        .substring(0, 11) // Limita o valor a 11 dígitos.
        .replace(/(\d{3})(\d)/, '$1.$2') // Adiciona o primeiro ponto.
        .replace(/(\d{3})(\d)/, '$1.$2') // Adiciona o segundo ponto.
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Adiciona o traço.
    } else if (tipo === 'telefone') { // Se o tipo da chave for 'telefone'.
      formattedValue = value // Aplica a máscara de telefone.
        .substring(0, 11) // Limita o valor a 11 dígitos.
        .replace(/(\d{2})(\d)/, '($1) $2') // Adiciona os parênteses e o espaço do DDD.
        .replace(/(\d{5})(\d)/, '$1-$2') // Adiciona o traço após os 5 primeiros dígitos do número.
        .replace(/(\d{4})(\d)/, '$1$2'); // Ajuste para lidar com o nono dígito.
    } // Fecha o bloco 'else if'.

    // Lógica para manter a posição do cursor, melhorando a experiência de digitação.
    const originalLength = input.value.length; // Armazena o tamanho original do valor no input.
    const newLength = formattedValue.length; // Armazena o novo tamanho após a formatação.
    let cursorPosition = input.selectionStart; // Pega a posição atual do cursor.

    setValorNovaChave(formattedValue); // Atualiza o estado com o valor formatado.

    // Ajusta a posição do cursor após a re-renderização do componente.
    setTimeout(() => { // Usa setTimeout para garantir que o ajuste ocorra após a atualização do DOM.
      if (newLength > originalLength) { // Se o novo valor for maior (caracteres de formatação foram adicionados).
        cursorPosition += (newLength - originalLength); // Ajusta a posição do cursor para frente.
      } // Fecha o bloco 'if'.
      input.setSelectionRange(cursorPosition, cursorPosition); // Define a nova posição do cursor no input.
    }, 0); // O timeout de 0ms enfileira a execução para o próximo ciclo de eventos.
  }; // Fecha a função 'handleChaveChange'.

  // --- LÓGICA PARA A ABA "RECEBER" ---

  // Efeito que gera o QR Code dinamicamente sempre que o valor da cobrança muda.
  useEffect(() => { // Hook de efeito para gerar o QR Code.
    // Só executa se a seção 'receber' estiver ativa e o usuário logado.
    if (secaoAtiva !== 'receber' || !user) return; // Condição de guarda para evitar execuções desnecessárias.

    const gerarQrCodePayload = async () => { // Define uma função assíncrona para gerar o payload do QR Code.
      const valorNumerico = Number(valorCobranca.replace(/\D/g, '')) / 100; // Converte o valor da cobrança para um número.

      // O backend pode precisar ser ajustado para lidar com valor 0 ou nulo.
      // Por enquanto, vamos garantir que a chamada seja feita.
      try { // Inicia um bloco 'try' para a chamada à API.
        const res = await axios.post(`${API_URL}/pix/gerar-qr-code`, { // Faz a requisição para gerar o QR Code.
          valor: valorNumerico > 0 ? valorNumerico : 0, // Envia o valor numérico, ou 0 se não houver valor.
          userId: user.id // Envia o ID do usuário.
        }); // Fecha o objeto da requisição.
        if (res.data.sucesso) { // Se a requisição for bem-sucedida.
          setQrCodePayload(res.data.qrCodePayload); // Atualiza o estado com o payload do QR Code recebido.
        } // Fecha o bloco 'if'.
      } catch (err) { // Captura erros na requisição.
        // Silenciosamente falha ou mostra uma pequena mensagem de erro no console.
        console.error("Não foi possível gerar o QR Code dinâmico."); // Loga o erro no console do desenvolvedor.
      } // Fecha o bloco 'catch'.
    }; // Fecha a função 'gerarQrCodePayload'.

    gerarQrCodePayload(); // Chama a função para gerar o QR Code.
  }, [valorCobranca, user, secaoAtiva]); // O efeito é re-executado se 'valorCobranca', 'user' ou 'secaoAtiva' mudarem.

  /**
   * Gera uma chave aleatória para recebimento.
   */
  const gerarChaveAleatoria = async () => { // Define a função assíncrona para gerar uma chave aleatória.
    setIsLoading(true); // Ativa o estado de carregamento.
    try { // Inicia o bloco 'try'.
      const res = await axios.post(`${API_URL}/pix/gerar-chave-aleatoria`); // Faz a requisição para o endpoint que gera a chave.
      if (res.data.sucesso) { // Se a resposta indicar sucesso.
        setChaveAleatoria(res.data.chave); // Atualiza o estado com a chave aleatória recebida.
      } // Fecha o bloco 'if'.
    } catch (err) { // Captura erros na requisição.
      mostrarMensagemTemporaria("Não foi possível gerar a chave aleatória.", 'erro'); // Exibe uma mensagem de erro.
    } finally { // O bloco 'finally' sempre é executado.
      setIsLoading(false); // Desativa o estado de carregamento.
    } // Fecha o bloco 'finally'.
  }; // Fecha a função 'gerarChaveAleatoria'.

  // Função para copiar texto para a área de transferência
  const copiarParaClipboard = (texto, tipo) => { // Define a função que recebe o texto a ser copiado e um tipo para a mensagem.
    navigator.clipboard.writeText(texto); // Usa a API do navegador para copiar o texto para a área de transferência.
    mostrarMensagemTemporaria(`${tipo} copiada com sucesso!`, 'sucesso'); // Exibe uma mensagem de sucesso para o usuário.
  }; // Fecha a função 'copiarParaClipboard'.

  /**
   * Lida com o cadastro de uma nova chave PIX.
   */
  const cadastrarChave = async (e) => {
    e.preventDefault();
    if (!tipoNovaChave) {
      mostrarMensagemTemporaria("Selecione um tipo de chave.", "erro");
      return;
    }
    setIsLoading(true);

    try {
      let chaveParaCadastrar = valorNovaChave;

      // Se for chave aleatória, gera uma primeiro
      if (tipoNovaChave === 'aleatoria') {
        const res = await axios.post(`${API_URL}/pix/gerar-chave-aleatoria`);
        if (res.data.sucesso) {
          chaveParaCadastrar = res.data.chave;
        } else {
          throw new Error("Falha ao gerar chave aleatória.");
        }
      }

      const resCadastro = await axios.post(`${API_URL}/chaves-pix`, {
        userId: user.id,
        tipo: tipoNovaChave,
        chave: chaveParaCadastrar,
      });

      mostrarMensagemTemporaria(resCadastro.data.message, 'sucesso');
      setMinhasChaves([...minhasChaves, resCadastro.data.chave]); // Adiciona a nova chave à lista
      setValorNovaChave(''); // Limpa o formulário
      setTipoNovaChave('');
    } catch (err) {
      const erroMsg = err.response?.data?.message || "Ocorreu um erro ao cadastrar a chave.";
      mostrarMensagemTemporaria(erroMsg, 'erro');
    } finally {
      setIsLoading(false);
    }
  };
  return ( // Inicia o retorno do JSX que será renderizado pelo componente.
    <div className="container servicos-container"> {/* Contêiner principal da página de serviços. */}
      <h2>Transferência PIX</h2> {/* Título principal da página. */}

      <div className="pix-section"> {/* Seção para "Enviar PIX", funciona como um acordeão. */}
        <h3 onClick={() => setSecaoAtiva(secaoAtiva === 'enviar' ? null : 'enviar')} className="clickable-header"> {/* Título clicável para abrir/fechar a seção. */}
          <FaArrowCircleUp /> Enviar PIX {/* Ícone e texto do título. */}
        </h3> {/* Fecha o título h3. */}
        {secaoAtiva === 'enviar' && ( // Renderiza o conteúdo a seguir apenas se a seção 'enviar' estiver ativa.
          <form onSubmit={enviarPix} className="servicos-form"> {/* Formulário para envio de PIX. */}
            <div className="input-group"> {/* Agrupador para o campo de chave. */}
              <label htmlFor="chave-pix">Chave PIX de destino (E-mail, CPF/CNPJ, Celular)</label> {/* Rótulo do campo. */}
              <input // Campo de texto para a chave PIX.
                id="chave-pix" // ID para associar com o label.
                type="text" // Tipo do campo.
                placeholder="Digite a chave" // Texto de exemplo.
                value={chave} // Vincula o valor do campo ao estado 'chave'.
                onChange={(e) => setChave(e.target.value)} // Atualiza o estado 'chave' a cada digitação.
                required // Torna o campo obrigatório.
              />
            </div> {/* Fecha o input-group. */}
            <div className="input-group"> {/* Agrupador para o campo de valor. */}
              <label htmlFor="valor-pix">Valor a enviar</label> {/* Rótulo do campo. */}
              <input // Campo de texto para o valor do PIX.
                id="valor-pix" // ID para associar com o label.
                type="text" // Tipo do campo.
                placeholder="R$ 0,00" // Texto de exemplo.
                value={valorPix} // Vincula o valor do campo ao estado 'valorPix'.
                onChange={(e) => handleValorChange(e, setValorPix)} // Chama a função de formatação de moeda a cada digitação.
                required // Torna o campo obrigatório.
              />
            </div> {/* Fecha o input-group. */}
            <button type="submit" disabled={isLoading || !chave || !valorPix}> {/* Botão para submeter o formulário. */}
              {isLoading ? 'Enviando...' : 'Enviar PIX'} {/* Texto do botão muda se estiver carregando. */}
            </button> {/* Fecha o botão de envio. */}
            <button type="button" className="button secondary" style={{ marginTop: '10px' }} onClick={() => setIsScannerOpen(!isScannerOpen)}>
              {isScannerOpen ? 'Fechar Leitor' : 'Pagar com QR Code'}
            </button> {/* Fecha o botão de QR Code. */}
            {isScannerOpen && (
              <div id="qr-reader" style={{ width: '100%', marginTop: '20px' }}></div>
            )}
          </form> // Fecha o formulário.
        )} {/* Fecha a renderização condicional. */}
      </div> {/* Fecha a seção 'enviar'. */}

      <div className="pix-section"> {/* Seção para "Receber PIX". */}
        <h3 onClick={() => setSecaoAtiva(secaoAtiva === 'receber' ? null : 'receber')} className="clickable-header"> {/* Título clicável para abrir/fechar. */}
          <FaArrowCircleDown /> Receber PIX {/* Ícone e texto do título. */}
        </h3> {/* Fecha o título h3. */}
        {secaoAtiva === 'receber' && ( // Renderiza o conteúdo se a seção 'receber' estiver ativa.
          <div className="servicos-form"> {/* Contêiner para os formulários de recebimento. */}
            <div className="receber-pix-section"> {/* Sub-seção para cobrar com QR Code. */}
              <h4>Cobrar com QR Code</h4> {/* Título da sub-seção. */}
              <p>Defina um valor para gerar um QR Code de cobrança.</p> {/* Texto descritivo. */}
              <div className="input-group"> {/* Agrupador para o campo de valor. */}
                <label htmlFor="valor-cobranca">Valor a receber (opcional)</label> {/* Rótulo do campo. */}
                <input // Campo de texto para o valor da cobrança.
                  id="valor-cobranca" // ID do campo.
                  type="text" // Tipo do campo.
                  placeholder="R$ 0,00" // Texto de exemplo.
                  value={valorCobranca} // Vincula o valor ao estado 'valorCobranca'.
                  onChange={(e) => handleValorChange(e, setValorCobranca)} // Usa a função de formatação de moeda.
                />
              </div> {/* Fecha o input-group. */}
              {qrCodePayload && ( // Renderiza o QR Code apenas se 'qrCodePayload' tiver um valor.
                <div className="qr-code-container"> {/* Contêiner para o QR Code. */}
                  <p>Aponte a câmera para o QR Code para pagar:</p> {/* Instrução para o usuário. */}
                  <QRCodeSVG value={qrCodePayload} size={200} /> {/* Componente que renderiza o QR Code. */}
                  <button onClick={() => copiarParaClipboard(qrCodePayload, 'PIX Copia e Cola')} className="button secondary"> {/* Botão para copiar o código. */}
                    Copiar Código (Copia e Cola) {/* Texto do botão. */}
                  </button> {/* Fecha o botão. */}
                </div> // Fecha o contêiner do QR Code.
              )} {/* Fecha a renderização condicional. */}
            </div> {/* Fecha a sub-seção de QR Code. */}

            <div className="receber-pix-section"> {/* Sub-seção para receber com chave aleatória. */}
              <h4>Receber com Chave Aleatória</h4> {/* Título da sub-seção. */}
              <p>Gere uma chave aleatória para compartilhar e receber um PIX de qualquer valor.</p> {/* Texto descritivo. */}
              <button onClick={gerarChaveAleatoria} disabled={isLoading} className="button secondary"> {/* Botão para gerar a chave. */}
                {isLoading ? 'Gerando...' : 'Gerar Chave Aleatória'} {/* Texto do botão muda se estiver carregando. */}
              </button> {/* Fecha o botão. */}
              {chaveAleatoria && ( // Renderiza a chave apenas se 'chaveAleatoria' tiver um valor.
                <div className="qr-code-container"> {/* Contêiner para exibir a chave. */}
                  <p>Sua chave aleatória é:</p> {/* Texto informativo. */}
                  <strong className="chave-aleatoria">{chaveAleatoria}</strong> {/* Exibe a chave em negrito. */}
                  <button onClick={() => copiarParaClipboard(chaveAleatoria, 'Chave Aleatória')} className="button secondary" style={{marginTop: '10px'}}> {/* Botão para copiar a chave. */}
                    Copiar Chave {/* Texto do botão. */}
                  </button> {/* Fecha o botão. */}
                </div> // Fecha o contêiner da chave.
              )} {/* Fecha a renderização condicional. */}
            </div> {/* Fecha a sub-seção de chave aleatória. */}
          </div> // Fecha o contêiner dos formulários de recebimento.
        )} {/* Fecha a renderização condicional da seção 'receber'. */}
      </div> {/* Fecha a seção 'receber'. */}

      <div className="pix-section"> {/* Seção para "Minhas Chaves". */}
        <h3 onClick={() => setSecaoAtiva(secaoAtiva === 'chaves' ? null : 'chaves')} className="clickable-header"> {/* Título clicável para abrir/fechar. */}
          <FaKey /> Minhas Chaves {/* Ícone e texto do título. */}
        </h3> {/* Fecha o título h3. */}
        {secaoAtiva === 'chaves' && ( // Renderiza o conteúdo se a seção 'chaves' estiver ativa.
          <div className="servicos-form"> {/* Contêiner para o gerenciamento de chaves. */}
            <h4>Minhas Chaves Cadastradas</h4> {/* Título da lista de chaves. */}
            <ul className="lista-chaves"> {/* Lista não ordenada para as chaves. */}
              {minhasChaves.map((chave, index) => ( // Itera sobre o array 'minhasChaves' para renderizar cada chave.
                <li key={index}><strong>{chave.tipo}:</strong> {chave.valor}</li> // Item da lista exibindo o tipo e o valor da chave.
              ))} {/* Fecha o map. */}
            </ul> {/* Fecha a lista. */}

            <div className="cadastro-chave-section"> {/* Seção para cadastrar uma nova chave. */}
              <h4 style={{ borderTop: '1px solid var(--cor-borda)', paddingTop: '20px', marginTop: '20px' }}>Cadastrar Nova Chave</h4> {/* Título da seção de cadastro. */}
              <form onSubmit={cadastrarChave} className="servicos-form" style={{ padding: 0, border: 'none', backgroundColor: 'transparent' }}> {/* Formulário de cadastro. */}
                <select // Campo de seleção para o tipo de chave.
                  className="select-pix" // Classe CSS para estilização.
                  value={tipoNovaChave} // Vincula o valor ao estado 'tipoNovaChave'.
                  onChange={(e) => { // Manipulador de evento para quando o valor muda.
                    setTipoNovaChave(e.target.value); // Atualiza o tipo de chave selecionado.
                    setValorNovaChave(''); // Limpa o campo de valor da chave para evitar dados inconsistentes.
                  }} // Fecha o manipulador de evento.
                  style={{ backgroundColor: 'var(--cor-fundo)', color: 'var(--cor-texto)', border: '1px solid var(--cor-borda)', padding: '14px', borderRadius: 'var(--border-radius)', fontFamily: 'Poppins, sans-serif', fontSize: '1rem' }}
                  required // Torna a seleção obrigatória.
                >
                  <option value="">Selecione o tipo de chave</option> {/* Opção padrão/placeholder. */}
                  <option value="cpf">CPF</option> {/* Opção para chave CPF. */}
                  <option value="email">E-mail</option> {/* Opção para chave E-mail. */}
                  <option value="telefone">Telefone</option> {/* Opção para chave Telefone. */}
                  <option value="aleatoria">Chave Aleatória</option> {/* Opção para chave Aleatória. */}
                </select> {/* Fecha o campo de seleção. */}

                {(tipoNovaChave === 'cpf' || tipoNovaChave === 'email' || tipoNovaChave === 'telefone') && ( // Renderiza o campo de input se um tipo que exige digitação for selecionado.
                  <input // Campo de texto para digitar o valor da chave.
                    className="input-padrao" // Classe CSS para estilização.
                    type={tipoNovaChave === 'email' ? 'email' : 'text'} // Define o tipo do input dinamicamente ('email' ou 'text').
                    placeholder={`Digite seu ${tipoNovaChave}`} // Texto de exemplo dinâmico.
                    value={valorNovaChave}
                    onChange={(e) => handleChaveChange(e, tipoNovaChave)} // Chama a função de formatação de chave a cada digitação.
                    required // Torna o campo obrigatório.
                  />
                )} {/* Fecha a renderização condicional. */}

                <button type="submit" disabled={isLoading}> {/* Botão para submeter o cadastro. */}
                  {tipoNovaChave === 'aleatoria' ? 'Gerar e Cadastrar Chave Aleatória' : 'Cadastrar Chave'} {/* Texto do botão muda conforme o tipo de chave. */}
                </button> {/* Fecha o botão. */}
              </form>
            </div> {/* Fecha a seção de cadastro. */}
          </div> // Fecha o contêiner de gerenciamento de chaves.
        )} {/* Fecha a renderização condicional da seção 'chaves'. */}
      </div> {/* Fecha a seção 'chaves'. */}

      {status.texto && ( // Renderiza a mensagem de status apenas se 'status.texto' não estiver vazio.
        <p className={status.tipo === 'erro' ? 'error-message' : 'success-message'}>{status.texto}</p> // Parágrafo para exibir a mensagem, com classe CSS dinâmica.
      )} {/* Fecha a renderização condicional. */}
    </div> // Fecha o contêiner principal.
  ); // Fecha o retorno do JSX.
} // Fecha o componente PixPage.