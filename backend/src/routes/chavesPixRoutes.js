const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const chavesPixDataPath = path.join(__dirname, '..', 'data', 'chavesPix.json');
const usuariosDataPath = path.join(__dirname, '..', 'data', 'usuarios.json');

const lerDados = (caminho) => {
    const data = fs.readFileSync(caminho, 'utf-8');
    return JSON.parse(data);
};

const escreverDados = (caminho, dados) => {
    fs.writeFileSync(caminho, JSON.stringify(dados, null, 2));
};

// Rota para cadastrar uma nova chave PIX
router.post('/', (req, res) => {
    const { userId, tipo, chave } = req.body;

    if (!userId || !tipo || !chave) {
        return res.status(400).json({ message: 'Todos os campos (userId, tipo, chave) são obrigatórios.' });
    }

    const usuarios = lerDados(usuariosDataPath);
    const usuarioExiste = usuarios.some(u => u.id === parseInt(userId, 10));
    if (!usuarioExiste) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const chavesPix = lerDados(chavesPixDataPath);
    const chaveExistente = chavesPix.find(c => c.chave === chave);
    if (chaveExistente) {
        return res.status(409).json({ message: 'Chave PIX já cadastrada.' });
    }

    const novaChave = { id: uuidv4(), userId, tipo, chave };
    chavesPix.push(novaChave);
    escreverDados(chavesPixDataPath, chavesPix);

    res.status(201).json({ message: 'Chave PIX cadastrada com sucesso!', chave: novaChave });
});

module.exports = router;