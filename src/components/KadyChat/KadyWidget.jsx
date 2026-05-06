import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import KadyChat from '../KadyChat/KadyChat';
import './KadyWidget.css';

const KadyWidget = ({ slug }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="kady-widget-root">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100, x: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100, x: 50 }}
            className="kady-widget-window"
          >
            <button className="kady-widget-close" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
            <KadyChat slug={slug} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="kady-widget-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="kady-avatar-container">
          {isOpen ? (
            <X size={32} color="#4f46e5" />
          ) : (
            <video 
              src="/avatar.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover'
              }} 
            />
          )}
        </div>
        {!isOpen && <span className="kady-badge">KADY</span>}
      </motion.button>
    </div>
  );
};

export default KadyWidget;
