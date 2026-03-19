import React from 'react';
import { useAppContext } from '../../context/AppContext';
import './StatusBar.css';

export default function StatusBar({ flag, message }) {
  const { t, timezone } = useAppContext();
  const flagClass = flag ? `status-bar--${flag.toLowerCase()}` : '';

  return (
    <div className={`status-bar ${flagClass}`}>
      <div className="status-bar__left">
        {flag && <span className="status-bar__flag">{flag}</span>}
        {message && <span className="status-bar__message">{message}</span>}
        <span className="status-bar__tz">{timezone}</span>
      </div>
      <div className="status-bar__right">
        <span className="status-bar__api">{t('status_api')}</span>
        <span className="status-bar__dot" />
      </div>
    </div>
  );
}
