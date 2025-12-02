const express = require("express");
const cors = require("cors");
const fs = require("fs");

// Importa as rotas de chaves PIX
const chavesPixRoutes = require("./routes/chavesPixRoutes");

// Função para ler arquivos JSON de forma síncrona e atualizada
const readJsonFileSync = (filepath) => {
  const data = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(data);
};

// Caminhos para os arquivos de dados
const TRANS_PATH = __dirname + '/data/transacoes.json';
const CARTOES_PATH = __dirname + '/data/cartao.json';

const app = express();
app.use(cors());
app.use(express.json());

// ===============================
// 1) ROTA: Total de gastos
// ===============================
app.get("/gastos", (req, res) => {
  const userId = parseInt(req.query.userId, 10);
  if (!userId) {
    return res.status(400).json({ erro: "userId é obrigatório." });
  }
  const transacoes = readJsonFileSync(TRANS_PATH);
  const transacoesDoUsuario = transacoes.filter(t => t.userId === userId);
  const total = transacoesDoUsuario.reduce((soma, t) => soma + t.valor, 0);
  res.json({ total: total.toFixed(2) });
});

// 2) ROTA: Extrato completo
// ===============================
app.get("/transacoes", (req, res) => {
  const userId = parseInt(req.query.userId, 10);
  if (!userId) {
    return res.status(400).json({ erro: "userId é obrigatório." });
  }
  const transacoes = readJsonFileSync(TRANS_PATH);
  const transacoesDoUsuario = transacoes.filter(t => t.userId === userId);
  res.json(transacoesDoUsuario);
});

// ===============================
// ROTA: Dados do Cartão de Crédito
// ===============================
app.get("/cartao", (req, res) => {
  const userId = parseInt(req.query.userId, 10);
  if (!userId) {
    return res.status(400).json({ erro: "userId é obrigatório." });
  }
  const cartoes = readJsonFileSync(CARTOES_PATH);
  const cartaoDoUsuario = cartoes.find(c => c.userId === userId);

  if (!cartaoDoUsuario) {
    return res.status(404).json({ erro: "Cartão não encontrado para este usuário." });
  }

  // Calcula o limite disponível dinamicamente
  cartaoDoUsuario.limite_disponivel = cartaoDoUsuario.limiteTotal - cartaoDoUsuario.gastosFatura;

  res.json(cartaoDoUsuario);
});

// ===============================
// ROTA: Fatura do Cartão de Crédito
// ===============================
app.get("/cartao/fatura", (req, res) => {
  const userId = parseInt(req.query.userId, 10);
  if (!userId) {
    return res.status(400).json({ erro: "userId é obrigatório." });
  }
  const faturas = readJsonFileSync(__dirname + '/data/fatura.json');
  const faturaDoUsuario = faturas.filter(f => f.userId === userId);
  res.json(faturaDoUsuario);
});

// ===============================
// ROTA: Pedido de Aumento de Limite
// ===============================
app.post("/cartao/pedir-limite", (req, res) => {
  const { userId, valorDesejado } = req.body;
  if (!userId || !valorDesejado) {
    return res.status(400).json({ erro: "userId e valorDesejado são obrigatórios." });
  }

  // Simula o recebimento da solicitação
  console.log(`Usuário ${userId} solicitou aumento de limite para ${valorDesejado}`);
  res.status(200).json({ sucesso: true, mensagem: "Sua solicitação de aumento de limite foi recebida e está em análise." });
});

// ===============================
// ROTA: Pagamento da Fatura do Cartão
// ===============================
app.post("/cartao/pagar-fatura", (req, res) => {
  const userId = parseInt(req.body.userId, 10);
  const valor = parseFloat(req.body.valor);

  if (!userId || !valor || valor <= 0) {
    return res.status(400).json({ erro: "userId e um valor de pagamento válido são obrigatórios." });
  }

  // --- BUSCA DE DADOS ---
  let cartoes = readJsonFileSync(CARTOES_PATH);
  const cartaoIndex = cartoes.findIndex(c => c.userId === userId);
  if (cartaoIndex === -1) {
    return res.status(404).json({ erro: "Cartão não encontrado." });
  }

  // --- LÓGICA DE PAGAMENTO ---
  // 1. Calcula o valor máximo que pode ser pago (o menor entre o valor desejado e a dívida real)
  const valorAPagar = Math.min(valor, cartoes[cartaoIndex].gastosFatura);

  // Adiciona uma verificação para garantir que há algo a pagar.
  if (valorAPagar <= 0) {
    return res.status(400).json({ sucesso: false, mensagem: "Não há valor a ser pago ou a fatura já está quitada." });
  }

  // 2. Verifica se o saldo em conta é suficiente para cobrir o valor que SERÁ pago
  let transacoes = readJsonFileSync(TRANS_PATH);
  const transacoesDoUsuario = transacoes.filter(t => t.userId === userId);
  const saldoEmConta = transacoesDoUsuario.reduce((soma, t) => soma + t.valor, 0);
  if (saldoEmConta < valorAPagar) {
    return res.status(400).json({ sucesso: false, mensagem: "Saldo em conta insuficiente para pagar a fatura." });
  }

  // Subtrai o valor pago da fatura
  cartoes[cartaoIndex].gastosFatura -= valorAPagar;

  // Salva a alteração no arquivo
  fs.writeFileSync(CARTOES_PATH, JSON.stringify(cartoes, null, 2));

  // --- CRIAÇÃO DA TRANSAÇÃO DE PAGAMENTO ---
  // Lógica para gerar um ID único e seguro
  const proximoId = transacoes.length > 0 ? Math.max(...transacoes.map(t => t.id)) + 1 : 1;

  const novaTransacao = {
    id: proximoId,
    descricao: "Pagamento da fatura do cartão",
    categoria: "pagamento_fatura",
    valor: -Math.abs(Number(valorAPagar)), // Debita o valor efetivamente pago
    data: new Date().toISOString().split('T')[0],
    userId: userId
  };

  transacoes.push(novaTransacao);
  fs.writeFileSync(TRANS_PATH, JSON.stringify(transacoes, null, 2));

  res.json({
    sucesso: true,
    mensagem: `Pagamento de R$${valorAPagar.toFixed(2)} da sua fatura realizado com sucesso!`,
    transacao: novaTransacao
  });
});

/**
 * Função auxiliar para categorizar uma transação de forma mais inteligente.
 * @param {object} transacao - O objeto da transação.
 * @returns {string} - A categoria da transação.
 */
const categorizarTransacao = (transacao) => {
  const descricao = transacao.descricao.toLowerCase();
  if (descricao.includes('uber') || descricao.includes('99') || descricao.includes('transporte')) return 'Transporte';
  if (descricao.includes('ifood') || descricao.includes('restaurante') || descricao.includes('comida') || descricao.includes('mercado')) return 'Alimentação';
  if (descricao.includes('recarga')) return 'Recarga e Serviços';
  if (descricao.includes('pagamento de boleto')) return 'Pagamento de Contas';
  if (descricao.includes('pagamento da fatura')) return 'Fatura do Cartão';
  if (descricao.includes('pix enviado')) return 'Transferências PIX';
  if (transacao.valor > 0) return 'Entradas'; // Categoriza qualquer valor positivo como Entrada

  return 'Outros'; // Categoria padrão para gastos não identificados
};

// ===============================
// ROTA: Análise de Gastos por Categoria
// ===============================
app.get("/gastos/categorias", (req, res) => {
  const userId = parseInt(req.query.userId, 10);
  if (!userId) {
    return res.status(400).json({ erro: "userId é obrigatório." });
  }

  const transacoes = readJsonFileSync(TRANS_PATH);
  const transacoesDoUsuario = transacoes.filter(t => t.userId === userId);

  if (transacoesDoUsuario.length === 0) {
    return res.json({});
  }

  // Agrupa as transações usando a nova função de categorização
  const gastosAgrupados = transacoesDoUsuario.reduce((acc, transacao) => {
    // Ignora depósitos de boas-vindas da análise de gastos
    if (transacao.descricao.includes('Depósito de boas-vindas')) return acc;
    const categoria = categorizarTransacao(transacao);
    acc[categoria] = (acc[categoria] || 0) + transacao.valor;
    return acc;
  }, {});

  res.json(gastosAgrupados);
});


// ===============================
// ROTA DE LOGIN
// ===============================
app.post("/login", (req, res) => {
  const { cpf, senha } = req.body;

  const usuarios = readJsonFileSync(__dirname + '/data/usuarios.json');
  // Procura o usuário no nosso "banco de dados" JSON
  const usuarioEncontrado = usuarios.find(u => u.cpf === cpf && u.senha === senha);

  if (usuarioEncontrado) {
    // Autenticação bem-sucedida
    res.status(200).json({ 
      success: true, 
      message: "Login bem-sucedido!",
      user: { id: usuarioEncontrado.id, nome: usuarioEncontrado.nome }
    });
  } else {
    // Falha na autenticação
    res.status(401).json({ success: false, message: "CPF ou senha inválidos." });
  }
});

// ===============================
// ROTA DE CADASTRO
// ===============================
app.post("/cadastro", (req, res) => {
  const { nome, cpf, senha } = req.body;

  let usuarios = readJsonFileSync(__dirname + '/data/usuarios.json');
  // Verifica se o CPF já existe
  if (usuarios.some(u => u.cpf === cpf)) {
    return res.status(400).json({ success: false, message: "Este CPF já está cadastrado." });
  }

  // Cria o novo usuário
  const novoUsuario = {
    id: usuarios.length + 1,
    nome,
    cpf,
    senha // Em um app real, a senha seria criptografada
  };

  // Adiciona o novo usuário e salva no arquivo
  usuarios.push(novoUsuario);
  fs.writeFileSync(__dirname + '/data/usuarios.json', JSON.stringify(usuarios, null, 2));

  // Cria a transação de depósito inicial de R$500 para o novo usuário
  let transacoes = readJsonFileSync(TRANS_PATH);
  // Lógica para gerar um ID único e seguro
  const proximoIdDeposito = transacoes.length > 0 ? Math.max(...transacoes.map(t => t.id)) + 1 : 1;

  const depositoInicial = {
    id: proximoIdDeposito,
    descricao: "Depósito de boas-vindas",
    categoria: "deposito",
    valor: 500,
    data: new Date().toISOString().split('T')[0], // Data de hoje
    userId: novoUsuario.id
  };

  // Adiciona a nova transação e salva no arquivo de transações
  transacoes.push(depositoInicial);
  fs.writeFileSync(TRANS_PATH, JSON.stringify(transacoes, null, 2));

  // Cria um cartão de crédito padrão para o novo usuário
  let cartoes = readJsonFileSync(CARTOES_PATH);
  const novoCartao = {
    userId: novoUsuario.id,
    nomeTitular: novoUsuario.nome,
    numeroFinal: Math.floor(1000 + Math.random() * 9000).toString(), // Gera um final de 4 dígitos aleatório
    limiteTotal: 1000, // Limite inicial padrão
    gastosFatura: 0
  };

  // Adiciona o novo cartão e salva no arquivo
  cartoes.push(novoCartao);
  fs.writeFileSync(CARTOES_PATH, JSON.stringify(cartoes, null, 2));


  res.status(201).json({ success: true, message: "Usuário cadastrado com sucesso!" });
});

// ===============================
// ROTA DO CHATBOT COM IA
// ===============================
app.post("/chat", async (req, res) => {
  const { message, userId } = req.body;
  const systemPrompt = `
    Você é a Ruby, uma assistente virtual do banco Telecon Hub.
    Sua tarefa é identificar a intenção do usuário e responder em um formato JSON.
    As ações possíveis são: "NAVIGATE_TO_PIX", "NAVIGATE_TO_PAGAMENTO", "NAVIGATE_TO_RECARGA", "NAVIGATE_TO_SERVICES", "NAVIGATE_TO_CARTAO", "SHOW_BALANCE", "ANALYZE_SPENDING", "GENERAL_CONVERSATION".

    - Se o usuário mencionar "pix", use a ação "NAVIGATE_TO_PIX".
    - Se o usuário mencionar "pagar conta" ou "boleto", use a ação "NAVIGATE_TO_PAGAMENTO".
    - Se o usuário mencionar "recarga" ou "celular", use a ação "NAVIGATE_TO_RECARGA".
    - Se o usuário mencionar "cartão" ou "cartões", use a ação "NAVIGATE_TO_CARTAO".
    - Se o usuário mencionar "serviços" ou "transação" de forma genérica, use a ação "NAVIGATE_TO_SERVICES".
    - Se o usuário perguntar sobre o saldo, use a ação "SHOW_BALANCE".
    - Se o usuário perguntar sobre seus gastos ou despesas, use a ação "ANALYZE_SPENDING".
    - Para qualquer outra conversa, use a ação "GENERAL_CONVERSATION".

    Responda SEMPRE no seguinte formato JSON: {"reply": "Sua resposta em texto aqui.", "action": "SUA_AÇÃO_AQUI"}`;

  try {
    // RESPOSTA SIMULADA (enquanto você não tem a chave de API)
    if (message.toLowerCase().includes('pix')) {
      res.json({
        reply: "Claro! Abrindo a área PIX para você.",
        action: "NAVIGATE_TO_PIX"
      });
    } else if (message.toLowerCase().includes('pagar') || message.toLowerCase().includes('boleto')) {
      res.json({
        reply: "Entendido. Te levando para a área de pagamento de contas.",
        action: "NAVIGATE_TO_PAGAMENTO"
      });
    } else if (message.toLowerCase().includes('gastos') || message.toLowerCase().includes('despesas')) {
      res.json({
        reply: "Certo! Vou te mostrar uma análise dos seus gastos.",
        action: "ANALYZE_SPENDING"
      });
    } else if (message.toLowerCase().includes('recarga') || message.toLowerCase().includes('celular')) {
      res.json({
        reply: "Ok, vamos fazer uma recarga. Abrindo a página para você.",
        action: "NAVIGATE_TO_RECARGA"
      });
    } else if (message.toLowerCase().includes('cartão') || message.toLowerCase().includes('cartões')) {
      res.json({
        reply: "Claro! Vou te levar para a sua área de cartões.",
        action: "NAVIGATE_TO_CARTAO"
      });
    } else {
      res.json({
        reply: `(Gemini) Esta é uma resposta simulada para a sua pergunta: "${message}"`,
        action: "GENERAL_CONVERSATION"
      });
    }

  } catch (error) {
    console.error("Erro ao contatar a API da IA:", error);
    res.status(500).json({ reply: "Desculpe, estou com um problema para me conectar à minha inteligência. Tente novamente mais tarde." });
  }
});

// ===============================
// 3) ROTA: Serviço simulado (Recarga)
// ===============================
app.post("/servicos/recarga", (req, res) => {
  const { numero, valor } = req.body;
  const userId = parseInt(req.body.userId, 10);

  if (!numero || !valor) {
    return res.status(400).json({
      erro: "É necessário enviar 'numero' e 'valor'."
    });
  }

  // --- VERIFICAÇÃO DE SALDO ---
  const cartoes = readJsonFileSync(CARTOES_PATH);
  const transacoes = readJsonFileSync(TRANS_PATH);
  const cartaoDoUsuario = cartoes.find(c => c.userId === userId);
  const transacoesDoUsuario = transacoes.filter(t => t.userId === userId);
  const limiteDisponivel = cartaoDoUsuario ? (cartaoDoUsuario.limiteTotal - cartaoDoUsuario.gastosFatura) : 0;
  const saldoEmConta = transacoesDoUsuario.reduce((soma, t) => soma + t.valor, 0);
  const saldoTotalDisponivel = saldoEmConta + limiteDisponivel;

  if (saldoTotalDisponivel < valor) {
    return res.status(400).json({ sucesso: false, mensagem: "Saldo insuficiente para realizar esta operação." });
  }

  // Cria a nova transação
  // Lógica para gerar um ID único e seguro
  const proximoId = transacoes.length > 0 ? Math.max(...transacoes.map(t => t.id)) + 1 : 1;

  const novaTransacao = {
    id: proximoId,
    descricao: `Recarga de celular para ${numero}`,
    categoria: "recarga",
    valor: -Math.abs(Number(valor)), // Garante que o valor seja negativo
    data: new Date().toISOString().split('T')[0], // Data de hoje
    userId: userId
  };

  // Adiciona a nova transação e salva no arquivo
  transacoes.push(novaTransacao);
  fs.writeFileSync(TRANS_PATH, JSON.stringify(transacoes, null, 2));

  return res.json({
    sucesso: true,
    mensagem: `Recarga de R$${valor} para o número ${numero} realizada com sucesso!`,
    transacao: novaTransacao
  });
});

// ===============================
// 4) ROTA: Serviço simulado (PIX)
// ===============================
app.post("/servicos/pix", (req, res) => {
  const { chave_destino, valor } = req.body;
  const userId = parseInt(req.body.userId, 10);

  if (!chave_destino || !valor) {
    return res.status(400).json({
      erro: "É necessário enviar 'chave_destino' e 'valor'."
    });
  }

  // --- VERIFICAÇÃO DE SALDO ---
  const cartoes = readJsonFileSync(CARTOES_PATH);
  const transacoes = readJsonFileSync(TRANS_PATH);
  const cartaoDoUsuario = cartoes.find(c => c.userId === userId);
  const transacoesDoUsuario = transacoes.filter(t => t.userId === userId);
  const limiteDisponivel = cartaoDoUsuario ? (cartaoDoUsuario.limiteTotal - cartaoDoUsuario.gastosFatura) : 0;
  const saldoEmConta = transacoesDoUsuario.reduce((soma, t) => soma + t.valor, 0);
  const saldoTotalDisponivel = saldoEmConta + limiteDisponivel;

  if (saldoTotalDisponivel < valor) {
    return res.status(400).json({ sucesso: false, mensagem: "Saldo insuficiente para realizar esta operação." });
  }

  // Cria a nova transação
  // Lógica para gerar um ID único e seguro
  const proximoId = transacoes.length > 0 ? Math.max(...transacoes.map(t => t.id)) + 1 : 1;

  const novaTransacao = {
    id: proximoId,
    descricao: `PIX enviado para ${chave_destino}`,
    categoria: "pix_envio",
    valor: -Math.abs(Number(valor)),
    data: new Date().toISOString().split('T')[0],
    userId: userId
  };

  // Adiciona a nova transação e salva no arquivo
  transacoes.push(novaTransacao);
  fs.writeFileSync(TRANS_PATH, JSON.stringify(transacoes, null, 2));

  return res.json({
    sucesso: true,
    mensagem: `PIX de R$${valor} enviado para ${chave_destino} com sucesso!`,
    transacao: novaTransacao
  });
});

// ===============================
// ROTA: Gerar QR Code PIX para Recebimento
// ===============================
app.post("/pix/gerar-qr-code", (req, res) => {
  const { valor, userId } = req.body;
  const valorNumerico = parseFloat(valor);

  if (!userId || isNaN(valorNumerico) || valorNumerico <= 0) {
    return res.status(400).json({ erro: "userId e um valor válido são obrigatórios." });
  }

  // Simula a geração de um código "PIX Copia e Cola" (BRCode)
  const payload = `00020126580014br.gov.bcb.pix0136${'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'}520400005303986540${valorNumerico.toFixed(2)}5802BR5913NOME_DO_USUARIO6009SAO_PAULO62070503***6304ABCD`;

  res.json({
    sucesso: true,
    qrCodePayload: payload,
    mensagem: "QR Code gerado com sucesso."
  });
});

// ===============================
// ROTA: Gerar Chave Aleatória PIX
// ===============================
app.post("/pix/gerar-chave-aleatoria", (req, res) => {
  const chaveAleatoria = require('crypto').randomUUID();
  res.json({ sucesso: true, chave: chaveAleatoria });
});

// ===============================
// 5) ROTA: Serviço simulado (Pagamento de Boleto)
// ===============================
app.post("/servicos/pagamento", (req, res) => {
  const { codigo_barras, valor } = req.body;
  const userId = parseInt(req.body.userId, 10);

  if (!codigo_barras || !valor) {
    return res.status(400).json({
      erro: "É necessário enviar 'codigo_barras' e 'valor'."
    });
  }

  // --- VERIFICAÇÃO DE SALDO ---
  const cartoes = readJsonFileSync(CARTOES_PATH);
  const transacoes = readJsonFileSync(TRANS_PATH);
  const cartaoDoUsuario = cartoes.find(c => c.userId === userId);
  const transacoesDoUsuario = transacoes.filter(t => t.userId === userId);
  const limiteDisponivel = cartaoDoUsuario ? (cartaoDoUsuario.limiteTotal - cartaoDoUsuario.gastosFatura) : 0;
  const saldoEmConta = transacoesDoUsuario.reduce((soma, t) => soma + t.valor, 0);
  const saldoTotalDisponivel = saldoEmConta + limiteDisponivel;

  if (saldoTotalDisponivel < valor) {
    return res.status(400).json({ sucesso: false, mensagem: "Saldo insuficiente para realizar esta operação." });
  }

  // Cria a nova transação
  // Lógica para gerar um ID único e seguro
  const proximoId = transacoes.length > 0 ? Math.max(...transacoes.map(t => t.id)) + 1 : 1;

  const novaTransacao = {
    id: proximoId,
    descricao: "Pagamento de boleto",
    categoria: "pagamento",
    valor: -Math.abs(Number(valor)),
    data: new Date().toISOString().split('T')[0],
    userId: userId
  };

  // Adiciona a nova transação e salva no arquivo
  transacoes.push(novaTransacao);
  fs.writeFileSync(TRANS_PATH, JSON.stringify(transacoes, null, 2));

  return res.json({
    sucesso: true,
    mensagem: `Pagamento de R$${valor} realizado com sucesso para o boleto ${codigo_barras}.`,
    transacao: novaTransacao
  });
});

// ===============================
// ROTA: Cadastro de Chaves PIX
// ===============================
app.use("/chaves-pix", chavesPixRoutes);


// ===============================
// Servidor rodando
// ===============================
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando em http://localhost:${PORT}`);
});
