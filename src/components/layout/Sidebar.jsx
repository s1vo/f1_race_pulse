import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { path: '/', icon: '⊞', labelKey: 'nav_dashboard' },
  { path: '/live', icon: '⏱', labelKey: 'nav_live' },
  { path: '/schedule', icon: '📅', labelKey: 'nav_schedule' },
  { path: '/results', icon: '📊', labelKey: 'nav_results' },
  { path: '/standings', icon: '🏆', labelKey: 'nav_standings' },
  { path: '/settings', icon: '⚙', labelKey: 'nav_settings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useAppContext();

  return (
    <>
      <button
        className="sidebar-hamburger"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>

      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${mobileOpen ? 'sidebar--mobile-open' : ''}`}>
        <div className="sidebar__logo">
          <span className="sidebar__logo-text">RACE</span>
          <span className="sidebar__logo-accent">PULSE</span>
        </div>

        <div className="sidebar__version">
          TELEMETRY V1.0
        </div>

        <nav className="sidebar__nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
              onClick={() => setMobileOpen(false)}
            >
              <span className="sidebar__icon">{item.icon}</span>
              {!collapsed && <span className="sidebar__label">{t(item.labelKey)}</span>}
            </NavLink>
          ))}
        </nav>

        <button
          className="sidebar__collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span
            className={`sidebar__collapse-icon ${collapsed ? 'sidebar__collapse-icon--right' : 'sidebar__collapse-icon--left'}`}
            aria-hidden="true"
          />
        </button>
      </aside>
    </>
  );
}
