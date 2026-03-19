import React, { useState } from 'react';
import useStandings from '../hooks/useStandings';
import { useAppContext } from '../context/AppContext';
import { getTeamColor } from '../utils/teams';
import { getFlag } from '../utils/flags';
import { SkeletonTable } from '../components/common/Skeleton';
import './Standings.css';

export default function Standings() {
  const { t } = useAppContext();
  const { drivers, teams, loading } = useStandings();
  const [tab, setTab] = useState('drivers');
  const currentList = tab === 'drivers' ? drivers : teams;

  const maxPoints = Math.max(...currentList.map(item => item.points || 0), 1);

  return (
    <div className="standings-page">
      <div className="standings-page__header">
        <h2 className="standings-page__title">{t('standings_title')}</h2>
        <div className="standings-page__tabs">
          <button
            className={`standings-page__tab ${tab === 'drivers' ? 'standings-page__tab--active' : ''}`}
            onClick={() => setTab('drivers')}
          >
            {t('standings_drivers')}
          </button>
          <button
            className={`standings-page__tab ${tab === 'teams' ? 'standings-page__tab--active' : ''}`}
            onClick={() => setTab('teams')}
          >
            {t('standings_constructors')}
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={tab === 'drivers' ? 20 : 10} cols={5} />
      ) : currentList.length === 0 ? (
        <div className="standings-page__empty">{t('standings_no_data')}</div>
      ) : tab === 'drivers' ? (
        <div className="standings-list">
          {drivers
            .map((d, i) => {
              const teamColor = getTeamColor(d.team_name);
              const driverName = d.broadcast_name || [d.first_name, d.last_name?.toUpperCase()].filter(Boolean).join(' ') || `#${d.driver_number}`;
              return (
                <div
                  key={i}
                  className="standings-item"
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <span className="standings-item__pos">
                    {d.position_current || d.position || i + 1}
                  </span>
                  <span className="standings-item__flag">
                    {getFlag(d.country_code || d.nationality)}
                  </span>
                  <span className="standings-item__bar" style={{ backgroundColor: teamColor }} />
                  <div className="standings-item__info">
                    <span className="standings-item__name">{driverName}</span>
                    <span className="standings-item__team">{d.team_name}</span>
                  </div>
                  <div className="standings-item__stats">
                    <div className="standings-item__points-bar-wrap">
                      <div
                        className="standings-item__points-bar"
                        style={{
                          width: `${((d.points || 0) / maxPoints) * 100}%`,
                          backgroundColor: teamColor,
                        }}
                      />
                    </div>
                    <span className="standings-item__points">{d.points || 0}</span>
                  </div>
                  {d.wins > 0 && (
                    <span className="standings-item__wins">{d.wins}W</span>
                  )}
                </div>
              );
            })}
        </div>
      ) : (
        <div className="standings-list">
          {teams
            .map((tm, i) => {
              const teamColor = getTeamColor(tm.team_name);
              return (
                <div
                  key={i}
                  className="standings-item"
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <span className="standings-item__pos">
                    {tm.position_current || tm.position || i + 1}
                  </span>
                  <span className="standings-item__bar standings-item__bar--wide" style={{ backgroundColor: teamColor }} />
                  <div className="standings-item__info">
                    <span className="standings-item__name">{tm.team_name?.toUpperCase()}</span>
                  </div>
                  <div className="standings-item__stats">
                    <div className="standings-item__points-bar-wrap">
                      <div
                        className="standings-item__points-bar"
                        style={{
                          width: `${((tm.points || 0) / maxPoints) * 100}%`,
                          backgroundColor: teamColor,
                        }}
                      />
                    </div>
                    <span className="standings-item__points">{tm.points || 0}</span>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
