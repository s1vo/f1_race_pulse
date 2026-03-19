import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import './Header.css';

const PAGE_TITLE_KEYS = {
  '/': 'header_pit_wall',
  '/live': 'header_live_timing',
  '/schedule': 'header_race_calendar',
  '/results': 'header_results',
  '/standings': 'header_championship',
  '/settings': 'header_settings',
  '/weekend': 'header_race_weekend',
  '/grid': 'header_starting_grid',
  '/driver': 'header_driver_profile',
};

export default function Header({ liveSession }) {
  const location = useLocation();
  const { t, language, setLanguage } = useAppContext();
  const basePath = '/' + (location.pathname.split('/')[1] || '');
  const titleKey = PAGE_TITLE_KEYS[basePath] || 'header_pit_wall';

  return (
    <header className="header">
      <div className="header__left">
        <h1 className="header__title">{t(titleKey)}</h1>
      </div>

      <div className="header__right">
        {liveSession && (
          <div className="header__live-badge">
            <span className="header__live-dot" />
            <span className="header__live-text">LIVE</span>
            <span className="header__live-session">{liveSession}</span>
          </div>
        )}
        <div className="header__nav-links">
          <span className="header__nav-link header__nav-link--active">{t('header_pit_wall')}</span>
          <span className="header__nav-link">{t('header_telemetry')}</span>
          <span className="header__nav-link">{t('header_strategy')}</span>
          <span className="header__nav-link">{t('header_weather')}</span>
        </div>
        <div className="header__lang-toggle">
          <button
            className={`header__lang-btn ${language === 'EN' ? 'header__lang-btn--active' : ''}`}
            onClick={() => setLanguage('EN')}
          >
            EN
          </button>
          <button
            className={`header__lang-btn ${language === 'RU' ? 'header__lang-btn--active' : ''}`}
            onClick={() => setLanguage('RU')}
          >
            RU
          </button>
        </div>
      </div>
    </header>
  );
}
