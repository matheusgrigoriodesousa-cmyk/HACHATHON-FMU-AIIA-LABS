# # 🏦 Telecon Hub - Aplicação de Banco DigitalProjeto Hackathon FMU + aiiaLabs

![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

Projeto desenvolvido para o hackathon, consistindo em um hub financeiro móvel que integra controle de gastos, extrato inteligente e transações PIX, com uma arquitetura moderna de frontend e backend desacoplados.

---
## 📄 Descrição do Projeto

O **Telecon Hub** é uma aplicação full-stack de banco digital desenvolvida para o **HACKATHON-FMU-AIIA-LABS**. O projeto simula uma experiência bancária completa, apresentando um frontend moderno construído com React e um backend robusto com Node.js e Express.

A aplicação conta com a **Ruby**, uma assistente virtual com IA (simulada), projetada para auxiliar os usuários a navegar pelas funcionalidades e executar ações através de comandos de texto, tornando a experiência mais ágil e interativa.

## ✨ Funcionalidades Principais

-   **Autenticação de Usuário:** Sistema seguro de Login e Cadastro. Novos usuários recebem um saldo inicial e um cartão de crédito padrão.
-   **Dashboard Financeiro:** Visão geral do saldo em conta e atalhos para as principais funcionalidades.
-   **Módulo PIX Completo:**
    -   Envio de PIX para qualquer tipo de chave.
    -   Geração de QR Code para recebimento (com ou sem valor definido).
    -   Leitor de QR Code para pagamentos utilizando a câmera do dispositivo.
    -   Cadastro e gerenciamento de chaves PIX (CPF, E-mail, Telefone e Aleatória).
-   **Serviços e Pagamentos:**
    -   Pagamento de boletos.
    -   Recarga de celular.
-   **Gestão de Cartão de Crédito:**
    -   Visualização de limite total e disponível.
    -   Acesso à fatura detalhada.
    -   Funcionalidade para pagar a fatura com o saldo da conta.
-   **Análise de Gastos e Extrato:**
    -   Extrato detalhado com todas as transações (entradas e saídas).
    -   Categorização inteligente de despesas (ex: Alimentação, Transporte, Contas) para uma análise financeira clara.
-   **🤖 Assistente Virtual (Ruby):**
    -   Chatbot integrado que interpreta a intenção do usuário.
    -   Executa ações como navegar para a área PIX, cartões, análise de gastos e outros serviços.

## 🛠️ Tecnologias Utilizadas

### Frontend
-   **React:** Biblioteca para construção da interface de usuário.
-   **Vite:** Ferramenta de build e servidor de desenvolvimento rápido.
-   **React Router:** Para gerenciamento de rotas na SPA (Single Page Application).
-   **Axios:** Cliente HTTP para comunicação com o backend.
-   **html5-qrcode:** Biblioteca para implementação do leitor de QR Code.
-   **react-icons:** Para ícones consistentes e modernos na interface.

### Backend
-   **Node.js:** Ambiente de execução para o JavaScript no servidor.
-   **Express.js:** Framework para criação da API REST.
-   **CORS:** Middleware para permitir requisições de origens diferentes.
-   **File System (fs):** Utilizado para simular um banco de dados com arquivos `.json`.

## 🚀 Como Executar o Projeto

Siga os passos abaixo para rodar a aplicação localmente.

### Pré-requisitos
-   Node.js (versão 16 ou superior)
-   npm (geralmente instalado com o Node.js)

### 1. Backend

Primeiro, inicie o servidor do backend.

```bash
# 1. Navegue até a pasta do backend
cd backend

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# O servidor estará rodando em http://localhost:4000

