import { useState, useEffect, useRef } from 'react';
import { HelpCircle, X, Send, User, Bot, ChevronRight, RotateCcw } from 'lucide-react';
import api from '../api/client';
import './HelpChat.css';

const HelpChat = () => {
  const isMounted = useRef(true);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    { role: 'bot', text: '¡Hola! Soy tu asistente de ayuda de K-Dice. ¿En qué puedo apoyarte hoy? Puedes preguntarme sobre citas, profesionales, servicios o cierres de caja.' }
  ]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  // Cleanup to avoid state updates on unmounted component
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSend = async (text) => {
    const query = text || message;
    if (!query.trim()) return;

    if (!isMounted.current) return;

    const userMsg = { role: 'user', text: query };
    setChat(prev => [...prev, userMsg]);
    setMessage('');
    setLoading(true);

    try {
      const res = await api.get('/help/chat', { params: { message: query } });
      if (!isMounted.current) return;
      const botMsg = { 
        role: 'bot', 
        text: res.data.answer,
        article: res.data.article,
        related: res.data.related,
        isFinished: res.data.isFinished
      };
      
      setChat(prev => [...prev, botMsg]);
      setSuggestions(res.data.suggestions || []);
      if (res.data.isFinished) setSuggestions([]); // No hay más sugerencias si terminó
    } catch (error) {
      if (!isMounted.current) return;
      setChat(prev => [...prev, { role: 'bot', text: 'Lo siento, hubo un error al procesar tu consulta. Intenta de nuevo más tarde.' }]);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  if (!isOpen) {
    return (
      <button className="help-chat-trigger" onClick={() => setIsOpen(true)}>
        <HelpCircle size={24} />
        <span className="trigger-text">Ayuda</span>
      </button>
    );
  }

  return (
    <div className="help-chat-container">
      <div className="help-chat-header">
        <div className="header-info">
          <Bot size={20} />
          <span>Asistente de Ayuda</span>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            onClick={() => {
              setChat([
                { role: 'bot', text: '¡Hola! Soy tu asistente de ayuda de K-Dice. ¿En qué puedo apoyarte hoy? Puedes preguntarme sobre citas, profesionales, servicios o cierres de caja.' }
              ]);
              setSuggestions([]);
            }} 
            title="Reiniciar conversación" 
            className="close-btn"
          >
            <RotateCcw size={16} />
          </button>
          <button 
            onClick={() => {
              setChat([
                { role: 'bot', text: '¡Hola! Soy tu asistente de ayuda de K-Dice. ¿En qué puedo apoyarte hoy? Puedes preguntarme sobre citas, profesionales, servicios o cierres de caja.' }
              ]);
              setSuggestions([]);
              setIsOpen(false);
            }} 
            className="close-btn"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="help-chat-messages">
        {chat.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.role}`}>
            <div className="message-icon">
              {msg.role === 'bot' ? <Bot size={14} /> : <User size={14} />}
            </div>
            <div className="message-bubble">
              <div className="message-text">
                {msg.text.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
              {msg.article?.imageUrl && (
                <div className="message-image">
                  <img src={msg.article.imageUrl} alt={msg.article.title} onClick={() => window.open(msg.article.imageUrl, '_blank')} />
                </div>
              )}
              {msg.isFinished && (
                <button 
                  onClick={() => {
                    setChat([{ role: 'bot', text: '¡Hola! Soy tu asistente de ayuda de K-Dice. ¿En qué puedo apoyarte hoy? Puedes preguntarme sobre citas, profesionales, servicios o cierres de caja.' }]);
                    setSuggestions([]);
                    setIsOpen(false);
                  }} 
                  className="finish-chat-btn"
                >
                  Finalizar Ayuda
                </button>
              )}
              {msg.related && msg.related.length > 0 && (
                <div className="message-related">
                  <p className="related-label">Temas relacionados:</p>
                  {msg.related.map((rel, i) => (
                    <button key={i} onClick={() => handleSend(rel)} className="related-btn">
                      {rel} <ChevronRight size={12} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message-wrapper bot">
            <div className="message-icon"><Bot size={14} /></div>
            <div className="message-bubble loading">
              <div className="dot-flashing"></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="help-chat-footer">
        {suggestions.length > 0 && !loading && (
          <div className="suggestions-bar">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => handleSend(s)} className="suggestion-chip">
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="input-area">
          <input
            type="text"
            placeholder="Escribe tu duda aquí..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={() => handleSend()} disabled={!message.trim() || loading} className="send-btn">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpChat;
