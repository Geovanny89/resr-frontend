import React from 'react';
import { useParams } from 'react-router-dom';
import KadyChat from '../../components/KadyChat/KadyChat';
import './KadyStandalone.css';

const KadyStandalone = () => {
  const { slug } = useParams();

  return (
    <div className="kady-standalone-page">
      <div className="kady-standalone-wrapper">
        <KadyChat slug={slug} standalone={true} />
      </div>
      <div className="kady-footer-brand">
        Powered by <strong>K-Dice</strong>
      </div>
    </div>
  );
};

export default KadyStandalone;
