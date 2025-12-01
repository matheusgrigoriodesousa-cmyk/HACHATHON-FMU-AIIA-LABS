# Hub Financeiro Móvel – Projeto Hackathon FMU + aiiaLabs

![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

Projeto desenvolvido para o hackathon, consistindo em um hub financeiro móvel que integra controle de gastos, extrato inteligente e transações PIX, com uma arquitetura moderna de frontend e backend desacoplados.

---

## 📄 Visão Geral

Este repositório contém a versão estruturada do projeto **Hub Financeiro Móvel**. A aplicação foi projetada para oferecer uma plataforma simples e intuitiva para gerenciamento financeiro, com foco em operações PIX.

A arquitetura é dividida em duas partes principais:
-   **`frontend/`**: A interface web com a qual o usuário interage, construída com **React** e **Vite** para uma experiência rápida e moderna.
-   **`backend/`**: O servidor responsável pela lógica de negócios, construído com **Node.js** e **Express**. Ele processa as transações, gerencia os dados e expõe uma API para o frontend consumir.

## ✨ Funcionalidades Principais

A plataforma oferece um conjunto de funcionalidades focadas em transações PIX, organizadas de forma intuitiva:

-   **Envio de PIX**: Permite enviar dinheiro utilizando uma chave PIX (CPF, E-mail, Telefone).
-   **Pagamento com QR Code**: Funcionalidade para iniciar um pagamento escaneando um QR Code.
-   **Recebimento com QR Code**: Gera um QR Code estático ou com valor definido para receber pagamentos.
-   **Recebimento com Chave Aleatória**: Gera uma chave aleatória para compartilhamento rápido.
-   **Gerenciamento de Chaves PIX**:
    -   Visualização das chaves cadastradas.
    -   Cadastro de novas chaves (CPF, E-mail, Telefone ou Aleatória).
    -   Formulário inteligente com máscara de formatação para CPF e Telefone.

## 🧰 Tecnologias Utilizadas

| Categoria | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Frontend** | React, Vite | Para uma interface de usuário reativa e um ambiente de desenvolvimento otimizado. |
| **Backend** | Node.js, Express | Para a construção de uma API RESTful robusta e escalável. |
| **Comunicação** | Axios, CORS | Para realizar requisições HTTP seguras entre o frontend e o backend. |
| **Estilização** | CSS puro, React Icons | Para um design limpo e ícones intuitivos. |
| **Persistência** | Arquivos JSON | Utilizado como um "banco de dados mock" para simular a persistência de dados. |
| **Desenvolvimento**| Nodemon | Para reiniciar automaticamente o servidor backend durante o desenvolvimento. |



Projeto do hackathon: um hub financeiro móvel que integra controle de gastos, extrato inteligente, transações (entradas e saídas), e interface web leve — com frontend e backend separados.

## 📄 Visão geral

Este repositório contém a versão estruturada do projeto “Hub Financeiro Móvel”:

- **frontend/** — interface web: HTML, CSS, JS, responsivo para desktop e celular.  
- **backend/** — servidor Node.js + banco de dados (ou mock JSON), lógica das transações e APIs.  

O objetivo é oferecer uma plataforma simples para cadastrar transações (gastos / entradas), visualizar saldo, histórico, categorias automáticas e previsões financeiras.

## 🚀 Funcionalidades

- Dashboard com saldo atual e lista de transações.  

## 🧰 Tecnologias usadas

- Frontend: HTML, CSS, JavaScript (vanilla).  
- Backend: Node.js + Express (ou JSON “fake” para dados).  
- Persistência: JSON ou banco de dados (dependendo da configuração).  
- Controle de versão e colaboração: Git + GitHub.

## 🔧 Como rodar o projeto localmente

### 1. Clone o repositório  
git clone https://github.com/matanganelli/hackathon-teleconhub.git
cd hackathon-teleconhub

1. Instalar Dependências
Primeiro, navegue até a pasta do backend e instale os módulos necessários:

cd backend
npm install

2. Iniciar o Servidor
Após a instalação, inicie o servidor em modo de desenvolvimento (dev):

npm run dev

Se tudo ocorrer bem, o terminal deverá exibir a confirmação e o servidor estará pronto para se comunicar com o frontend:

🚀 Servidor backend rodando em http://localhost:4000
