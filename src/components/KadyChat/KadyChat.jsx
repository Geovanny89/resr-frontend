import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, Calendar, Search, X, User } from 'lucide-react';
import './KadyChat.css';
import { formatDate, formatTime, getTodayISO } from '../../shared/utils/formatters';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const KadyChat = ({ slug, standalone = false }) => {
  const [business, setBusiness] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState('welcome'); // welcome, booking_service, booking_date, searching_appointments
  const [tempData, setTempData] = useState({});
  const messagesEndRef = useRef(null);
  const notificationAudio = useRef(null);

  // Sonido de notificación (Pop/Ding suave)
  useEffect(() => {
    notificationAudio.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
    notificationAudio.current.volume = 0.5;
  }, []);

  const playNotification = () => {
    if (notificationAudio.current) {
      notificationAudio.current.currentTime = 0;
      notificationAudio.current.play().catch(err => console.log("Autoplay blocked or audio error:", err));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  useEffect(() => {
    loadBusinessInfo();
    
    // "Cebar" el audio en la primera interacción del usuario para habilitar el autoplay
    const enableAudio = () => {
      if (notificationAudio.current) {
        notificationAudio.current.play()
          .then(() => {
            notificationAudio.current.pause();
            notificationAudio.current.currentTime = 0;
          })
          .catch(() => {});
        window.removeEventListener('click', enableAudio);
        window.removeEventListener('touchstart', enableAudio);
      }
    };
    window.addEventListener('click', enableAudio);
    window.addEventListener('touchstart', enableAudio);
    return () => {
      window.removeEventListener('click', enableAudio);
      window.removeEventListener('touchstart', enableAudio);
    };
  }, [slug]);

  const loadBusinessInfo = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/kady/business/${slug}`);
      setBusiness(res.data);
      setIsTyping(true);
      setTimeout(() => {
        setMessages([
          {
            id: 1,
            type: 'kady',
            text: `¡Hola! Soy Kady. Asistente virtual para **${res.data.name}**. ¿En qué puedo ayudarte hoy?`,
            options: [
              { label: '📅 Agendar una cita', value: 'start_booking' },
              { label: '🔍 Consultar mis citas', value: 'start_search' }
            ]
          }
        ]);
        playNotification();
        setIsTyping(false);
      }, 1500);
      setLoading(false);
    } catch (error) {
      console.error('Error cargando Kady:', error);
      setMessages([{ id: 1, type: 'kady', text: 'Lo siento, no pude cargar la información del negocio.' }]);
      setLoading(false);
    }
  };

  const addMessage = (text, type = 'user', options = null) => {
    if (type === 'kady') playNotification();
    setMessages(prev => [...prev, { id: Date.now(), text, type, options }]);
  };

  const handleOptionClick = (option) => {
    addMessage(option.label, 'user');
    setIsTyping(true);

    setTimeout(() => {
      processLogic(option.value, null, option.data);
    }, 1000);
  };

  const processLogic = async (value, userInput = null, selectedData = null) => {
    // Helper to add Kady message with delay simulation
    const kadyReply = (text, options = null, delay = 1000) => {
      setIsTyping(true);
      setTimeout(() => {
        addMessage(text, 'kady', options);
        setIsTyping(false);
      }, delay);
    };

    if (value === 'start_booking' || value === 'show_all_services') {
      setStep('booking_service');
      const sortedServices = [...(business.Services || [])].sort((a, b) => a.name.localeCompare(b.name));
      
      const showAll = value === 'show_all_services';
      const limit = showAll ? sortedServices.length : 6;
      
      const serviceOptions = sortedServices.slice(0, limit).map(s => {
        const priceFormatted = s.price ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(s.price) : '';
        return {
          label: s.name,
          price: priceFormatted,
          value: `select_service_${s.id}`,
          data: s
        };
      });

      if (!showAll && sortedServices.length > 6) {
        serviceOptions.push({ label: '➕ Ver más servicios', value: 'show_all_services' });
      }

      const text = showAll ? 'Aquí tienes la lista completa de servicios:' : '¡Excelente elección! ¿Qué servicio te gustaría agendar?';
      kadyReply(text, serviceOptions);
    }

    else if (value.startsWith('select_service_')) {
      const service = selectedData;
      setTempData({ ...tempData, service });
      setStep('booking_date');

      // Obtener fechas en formato YYYY-MM-DD respetando la zona horaria local (Colombia)
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const today = formatDate(new Date());
      const tomorrow = formatDate(new Date(Date.now() + 86400000));
      const after = formatDate(new Date(Date.now() + 172800000));

      const priceFormatted = service.price ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(service.price) : '';
      const serviceLabel = `${service.name}${priceFormatted ? ` (${priceFormatted})` : ''}`;
      
      kadyReply(`Perfecto, **${serviceLabel}**. ¿Para qué fecha te gustaría?`, [
        { label: 'Hoy', value: `select_date_${today}` },
        { label: 'Mañana', value: `select_date_${tomorrow}` },
        { label: '📅 Otra fecha...', value: 'select_date_custom' }
      ]);
    }

    else if (value === 'select_date_custom') {
      setStep('booking_date_manual');
      kadyReply('Por favor, selecciona la fecha que prefieras en el calendario o escríbela (AAAA-MM-DD):');
    }

    else if ((value.startsWith('select_date_') || step === 'booking_date_manual') && (value !== 'select_date_custom')) {
      const date = value.startsWith('select_date_') ? value.replace('select_date_', '') : userInput;
      setTempData({ ...tempData, date });
      setStep('booking_professional');

      setIsTyping(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/kady/employees/${slug}`);
        const sortedEmployees = [...res.data].sort((a, b) => a.name.localeCompare(b.name));
        
        const employeeOptions = sortedEmployees.map(e => ({
          label: e.name,
          value: `select_employee_${e.id}`,
          data: e
        }));

        setIsTyping(false);
        if (employeeOptions.length === 0) {
          kadyReply('Lo siento, no hay profesionales disponibles para este negocio.');
        } else {
          kadyReply('¿Con qué profesional te gustaría agendar?', employeeOptions);
        }
      } catch (err) {
        setIsTyping(false);
        kadyReply('Hubo un error al cargar los profesionales.');
      }
    }

    else if (value.startsWith('select_employee_')) {
      const employee = selectedData;
      setTempData(prev => ({ ...prev, employee }));
      setStep('booking_slots');

      setIsTyping(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/kady/slots`, {
          params: {
            slug,
            employeeId: employee.id,
            date: tempData.date,
            serviceId: tempData.service.id
          }
        });

        setIsTyping(false);
        if (res.data.length === 0) {
          kadyReply('Lo siento, no hay horarios disponibles para este profesional en la fecha seleccionada.', [
            { label: 'Cambiar fecha', value: `select_service_${tempData.service.id}`, data: tempData.service },
            { label: 'Cambiar profesional', value: `select_date_${tempData.date}` }
          ]);
        } else {
          const slotOptions = res.data.map(s => ({
            label: s.time,
            value: `select_slot_${s.time}`,
            data: s
          }));
          kadyReply('Estos son los horarios disponibles. Selecciona uno:', slotOptions);
        }
      } catch (err) {
        setIsTyping(false);
        kadyReply('Hubo un error al consultar la disponibilidad.');
      }
    }

    else if (value.startsWith('select_slot_')) {
      const slot = selectedData;
      setTempData(prev => ({ ...prev, slot }));
      setStep('booking_name');
      kadyReply('¡Excelente elección! Para registrar tu cita, por favor dime tu **nombre completo**.');
    }

    else if (step === 'booking_name' && userInput) {
      setTempData(prev => ({ ...prev, clientName: userInput }));
      setStep('booking_phone');
      kadyReply(`Gracias, **${userInput}**. Ahora, por favor dime tu **número de teléfono** para contactarte si es necesario.`);
    }

    else if (step === 'booking_phone' && userInput) {
      const clientPhone = userInput;
      const clientName = tempData.clientName;
      setStep('final');

      setIsTyping(true);

      try {
        await axios.post(`${API_BASE_URL}/kady/appointments/${slug}`, {
          serviceId: tempData.service.id,
          employeeId: tempData.employee.id,
          date: tempData.date,
          startTime: tempData.slot.time,
          clientName: clientName,
          clientPhone: clientPhone,
          status: 'pending'
        });

        const waMessage = `Hola! 👋 Quiero confirmar una cita agendada con Kady:%0A%0A` +
          `📌 *Servicio:* ${tempData.service.name}%0A` +
          `👤 *Profesional:* ${tempData.employee.name}%0A` +
          `📅 *Fecha:* ${tempData.date}%0A` +
          `⏰ *Hora:* ${tempData.slot.time}%0A` +
          `📝 *Cliente:* ${clientName}%0A` +
          `📱 *Teléfono:* ${clientPhone}%0A%0A` +
          `¡Quedo atento a su confirmación!`;

        const waLink = `https://wa.me/${business.phone.replace(/\D/g, '')}?text=${waMessage}`;
        setTempData(prev => ({ ...prev, waLink }));

        const priceFormatted = tempData.service.price ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(tempData.service.price) : '';
        const summary = `¡Todo listo, **${clientName}**! He registrado tu cita para **${tempData.service.name}** ${priceFormatted ? `(*${priceFormatted}*)` : ''} el día **${tempData.date}** a las **${tempData.slot.time}**.\n\nPara finalizar, haz clic en el botón de abajo para enviarnos los detalles por WhatsApp:`;

        setIsTyping(false);
        addMessage(summary, 'kady');
      } catch (err) {
        setIsTyping(false);
        addMessage('He tenido un pequeño problema técnico al registrar la cita en el sistema, pero no te preocupes. Puedes enviarnos los detalles por WhatsApp igualmente para coordinar.', 'kady');

        const waMessage = `Hola! 👋 Quiero agendar una cita:%0A%0A` +
          `📌 *Servicio:* ${tempData.service.name}%0A` +
          `👤 *Profesional:* ${tempData.employee.name}%0A` +
          `📅 *Fecha:* ${tempData.date}%0A` +
          `⏰ *Hora:* ${tempData.slot.time}%0A` +
          `📝 *Nombre:* ${clientName}%0A` +
          `📱 *Teléfono:* ${clientPhone}`;

        const waLink = `https://wa.me/${business.phone.replace(/\D/g, '')}?text=${waMessage}`;
        setTempData(prev => ({ ...prev, waLink }));
      }
    }

    else if (value === 'start_search') {
      setStep('searching_appointments');
      addMessage('Claro, ayúdame con tu **nombre completo** para buscar tus citas en nuestra base de datos.', 'kady');
    }

    else if (step === 'searching_appointments' && userInput) {
      setIsTyping(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/kady/appointments`, {
          params: { slug, fullName: userInput }
        });

        setIsTyping(false);
        if (res.data.length === 0) {
          kadyReply(`No encontré citas próximas para "${userInput}". ¿Quieres agendar una nueva?`, [
            { label: '📅 Agendar ahora', value: 'start_booking' },
            { label: 'Intentar con otro nombre', value: 'start_search' }
          ]);
        } else {
          let responseText = `He encontrado ${res.data.length} cita(s):\n\n`;
          res.data.forEach((app, i) => {
            responseText += `${i + 1}. **${app.Service.name}**\n📅 ${formatDate(app.startTime)} a las ${formatTime(app.startTime)}\n\n`;
          });
          kadyReply(responseText, [
            { label: 'Volver al inicio', value: 'welcome_back' }
          ]);
        }
      } catch (err) {
        setIsTyping(false);
        kadyReply('Hubo un error al buscar tus citas. Por favor intenta más tarde.');
      }
    }

    else if (value === 'welcome_back') {
      setStep('welcome');
      addMessage('¿Hay algo más en lo que pueda ayudarte?', 'kady', [
        { label: '📅 Agendar una cita', value: 'start_booking' },
        { label: '🔍 Consultar mis citas', value: 'start_search' }
      ]);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const text = inputValue;
    addMessage(text, 'user');
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      processLogic(step, text);
    }, 1000);
  };

  if (loading) return <div className="kady-loading">Cargando Kady...</div>;

  return (
    <div className={`kady-container ${standalone ? 'standalone' : 'widget-mode'}`}
      style={{ '--kady-primary': business?.primaryColor, '--kady-secondary': business?.secondaryColor }}>
      <div className="kady-header-fixed">
        <div className="kady-avatar-wrapper">
          <div className="kady-avatar">
            <img src="/kdice.png" alt="K-Dice" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="kady-status-dot"></div>
        </div>
        <div className="kady-header-info">
          <h3 className="kady-name">Kady</h3>
          <span className="kady-subtitle">Asistente Inteligente • K-Dice Reservas</span>
        </div>
      </div>

      <div className="kady-messages">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`msg-bubble msg-${msg.type}`}
            >
              <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />

              {msg.options && (
                <div className="kady-options">
                  {msg.options.map((opt, i) => (
                    <button key={i} className="kady-btn" onClick={() => handleOptionClick(opt)}>
                      <span>{opt.label}</span>
                      {opt.price && <span className="btn-price">{opt.price}</span>}
                    </button>
                  ))}
                </div>
              )}

              {msg.type === 'kady' && step === 'final' && tempData.waLink && (
                <a href={tempData.waLink}
                  target="_blank" rel="noreferrer" className="kady-btn kady-btn-whatsapp">
                  <MessageCircle size={20} />
                  Enviar a WhatsApp
                </a>
              )}
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="typing-dots"
            >
              <span></span>
              <span></span>
              <span></span>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="kady-input-area">
        <input
          type={step === 'booking_date_manual' ? 'date' : 'text'}
          className="kady-input"
          placeholder={step === 'booking_date_manual' ? '' : 'Escribe tu mensaje...'}
          min={getTodayISO()}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="kady-send-btn" onClick={handleSend}>
          <Send size={22} />
        </button>
      </div>
    </div>
  );
};

export default KadyChat;
