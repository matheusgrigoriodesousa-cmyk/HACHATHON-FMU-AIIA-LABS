import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { IconeChat, IconeEnviar, IconeFechar, IconeBot } from './Icons.jsx';
import { formatarValor } from './formatters.js';
import { useAuth } from '../AuthContext.jsx';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Efeito para mostrar a mensagem inicial e sugestões quando o chat abre
  useEffect(() => {
    if (isOpen) {
      setMessages([
        { text: 'Olá! Eu sou a Ruby, sua assistente virtual do Telecon Hub. Como posso te ajudar?', sender: 'bot' },
        { type: 'suggestions', options: ['Qual meu saldo?', 'Analisar meus gastos', 'Como fazer um PIX?'] }
      ]);
    }
  }, [isOpen]);

  const handleSendMessage = async (text) => {
    const messageText = text || inputValue;
    if (messageText.trim() === '') return;

    const userMessage = { text: messageText, sender: 'user' };
    // Remove sugestões antigas e adiciona a nova mensagem do usuário
    setMessages(prev => [...prev.filter(m => m.type !== 'suggestions'), userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Simulação de "pensamento" da IA
    setTimeout(async () => {
      // A nova lógica que chama o backend
      try {
        const response = await axios.post('http://localhost:4000/chat', {
          message: messageText,
          userId: user.id
        });
        const { reply, action } = response.data;

        // Mostra a resposta em texto da IA
        setMessages(prev => [...prev, { text: reply, sender: 'bot' }]);

        // Executa a ação recebida da IA
        const navigationActions = {
          'NAVIGATE_TO_PIX': '/pix',
          'NAVIGATE_TO_PAGAMENTO': '/pagamento',
          'NAVIGATE_TO_RECARGA': '/recarga',
          'NAVIGATE_TO_SERVICES': '/servicos',
        };

        if (navigationActions[action]) {
          setTimeout(() => {
            setIsOpen(false);
            navigate(navigationActions[action]);
          }, 1500); // Delay para o usuário ler a mensagem
        }

      } catch (error) {
        setMessages(prev => [...prev, { text: "Desculpe, não consegui obter uma resposta. Tente novamente.", sender: 'bot' }]);
      } finally {
        setIsTyping(false);
      }
    }, 1500);
  };

  return (
    <>
      {/* Fundo escurecido que aparece com o chat */}
      <div className={`chatbot-backdrop ${isOpen ? 'show' : ''}`} onClick={() => setIsOpen(false)}></div>

      {/* O botão some quando o chat está aberto */}
      <button className={`chatbot-fab ${isOpen ? 'hidden' : ''}`} onClick={() => setIsOpen(true)}>
        <IconeChat />
      </button>
      
      {/* Adicionamos a classe 'show' para controlar a animação */}
      <div className={`chatbot-modal ${isOpen ? 'show' : ''}`}>
          <div className="chatbot-header">
            <div className="chatbot-handle" onClick={() => setIsOpen(false)}></div>
            <IconeBot />
            <span>Ruby</span>
            <button onClick={() => setIsOpen(false)}><IconeFechar /></button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              msg.type === 'suggestions' ? (
                <div key={index} className="suggestion-chips">
                  {msg.options.map((option, i) => (
                    <button key={i} onClick={() => handleSendMessage(option)}>
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <div key={index} className={`message ${msg.sender}`}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              )
            ))}
            {isTyping && (
              <div className="message bot typing-indicator">
                <span></span><span></span><span></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(null)}
              placeholder="Digite sua mensagem..."
            />
            <button onClick={() => handleSendMessage(null)} disabled={!inputValue.trim()}><IconeEnviar /></button>
          </div>
        </div>
    </>
  );
}