import React from 'react';
import { useAppContext } from '../context/AppContext';
import './Settings.css';

const POPULAR_TIMEZONES = [
  'Europe/Moscow', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Dubai', 'Australia/Sydney',
  'Pacific/Auckland', 'America/Sao_Paulo', 'Asia/Kolkata',
  'Asia/Singapore', 'Africa/Johannesburg',
];

export default function Settings() {
  const { language, setLanguage, timezone, setTimezone, timezoneAutoDetected, t } = useAppContext();

  // Ensure current timezone is in the list
  const timezoneOptions = POPULAR_TIMEZONES.includes(timezone)
    ? POPULAR_TIMEZONES
    : [timezone, ...POPULAR_TIMEZONES];

  return (
    <div className="settings-page">
      <h2 className="settings-page__title">{t('settings_title')}</h2>

      <div className="settings-page__section">
        <h3 className="settings-page__label">{t('settings_language')}</h3>
        <div className="settings-page__toggle">
          <button
            className={`settings-page__option ${language === 'EN' ? 'settings-page__option--active' : ''}`}
            onClick={() => setLanguage('EN')}
          >
            EN
          </button>
          <button
            className={`settings-page__option ${language === 'RU' ? 'settings-page__option--active' : ''}`}
            onClick={() => setLanguage('RU')}
          >
            RU
          </button>
        </div>
      </div>

      <div className="settings-page__section">
        <h3 className="settings-page__label">{t('settings_timezone')}</h3>
        <select
          className="settings-page__select"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        >
          {timezoneOptions.map(tz => (
            <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <p className="settings-page__hint">
          {t('settings_current')}: {timezone}
          {timezoneAutoDetected && ` (${t('settings_auto_detected')})`}
        </p>
      </div>

      <div className="settings-page__section">
        <h3 className="settings-page__label">{t('settings_theme')}</h3>
        <div className="settings-page__toggle">
          <button className="settings-page__option settings-page__option--active">
            {t('settings_dark')}
          </button>
          <button className="settings-page__option" disabled>
            {t('settings_light')}
          </button>
        </div>
        <p className="settings-page__hint">{t('settings_light_soon')}</p>
      </div>

      <div className="settings-page__section">
        <h3 className="settings-page__label">{t('settings_about')}</h3>
        <p className="settings-page__about">
          RacePulse v1.0 — F1 Timing Dashboard<br />
          Data powered by OpenF1 API
        </p>
      </div>
    </div>
  );
}
