import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDrivers, getLatestCompletedRaceSession, getStartingGrid } from '../services/openf1';
import { useAppContext } from '../context/AppContext';
import { getTeamColor } from '../utils/teams';
import Skeleton from '../components/common/Skeleton';
import './Grid.css';

export default function Grid() {
  const { t } = useAppContext();
  const { sessionKey: paramKey } = useParams();
  const [grid, setGrid] = useState([]);
  const [drivers, setDrivers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        let key = paramKey;
        if (!key) {
          const { raceSession } = await getLatestCompletedRaceSession();
          if (raceSession) key = raceSession.session_key;
        }
        if (key) {
          const [gridData, drvData] = await Promise.all([
            getStartingGrid(key),
            getDrivers(key),
          ]);
          setGrid((gridData || []).sort((a, b) => a.position - b.position));
          const map = {};
          (drvData || []).forEach(d => { map[d.driver_number] = d; });
          setDrivers(map);
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
  }, [paramKey]);

  if (loading) {
    return (
      <div className="grid-page">
        <h2 className="grid-page__title">{t('grid_title')}</h2>
        <div className="grid-page__layout">
          {Array.from({ length: 20 }).map((_, i) => (
            <Skeleton key={i} height="60px" borderRadius="8px" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid-page">
      <h2 className="grid-page__title">{t('grid_title')}</h2>
      <div className="grid-page__layout">
        {grid.map((g, i) => {
          const driver = drivers[g.driver_number] || {};
          const teamColor = getTeamColor(driver.team_name);
          const isLeft = g.position % 2 === 1;

          return (
            <div
              key={g.driver_number}
              className={`grid-page__slot ${isLeft ? 'grid-page__slot--left' : 'grid-page__slot--right'}`}
              style={{
                gridRow: Math.ceil(g.position / 2),
                gridColumn: isLeft ? 1 : 2,
                animationDelay: `${i * 0.04}s`,
              }}
            >
              <span className="grid-page__pos">{String(g.position).padStart(2, '0')}</span>
              <span className="grid-page__bar" style={{ backgroundColor: teamColor }} />
              <div className="grid-page__info">
                <span className="grid-page__number">{String(g.driver_number).padStart(2, '0')}</span>
                <span className="grid-page__name">
                  {driver.name_acronym || driver.broadcast_name || `#${g.driver_number}`}
                </span>
                <span className="grid-page__team">{driver.team_name || ''}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
