import React from 'react';
import { useAppContext } from '../../context/AppContext';
import './IncidentsLog.css';

export default function IncidentsLog({ messages, compact }) {
  const { t } = useAppContext();
  const display = compact ? (messages || []).slice(-5) : messages || [];

  if (display.length === 0) {
    return (
      <div className="incidents-log">
        <div className="incidents-log__empty">{t('incidents_no_messages')}</div>
      </div>
    );
  }

  return (
    <div className="incidents-log">
      {display.map((msg, i) => (
        <div key={i} className={`incidents-log__item incidents-log__item--${getCategoryClass(msg.category)}`}>
          <span className="incidents-log__time">
            {msg.date ? new Date(msg.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
          </span>
          <span className="incidents-log__flag">
            {msg.flag || msg.category || ''}
          </span>
          <span className="incidents-log__message">{msg.message}</span>
        </div>
      ))}
    </div>
  );
}

function getCategoryClass(category) {
  if (!category) return 'default';
  const c = category.toLowerCase();
  if (c.includes('flag')) return 'flag';
  if (c.includes('safety') || c.includes('sc')) return 'safety';
  if (c.includes('drs')) return 'drs';
  return 'default';
}
