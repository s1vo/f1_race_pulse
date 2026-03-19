import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDrivers, getLatestCompletedRaceSession, getStints } from '../services/openf1';
import { useAppContext } from '../context/AppContext';
import { getTeamColor } from '../utils/teams';
import { getFlag } from '../utils/flags';
import Skeleton from '../components/common/Skeleton';
import './Driver.css';

export default function Driver() {
  const { driverNumber } = useParams();
  const { t } = useAppContext();
  const [driver, setDriver] = useState(null);
  const [stints, setStints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { raceSession } = await getLatestCompletedRaceSession();

        if (raceSession) {
          const drvs = await getDrivers(raceSession.session_key);
          const drv = drvs?.find(d => String(d.driver_number) === String(driverNumber));
          setDriver(drv);

          const st = await getStints(raceSession.session_key, driverNumber);
          setStints(st || []);
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
  }, [driverNumber]);

  if (loading) {
    return (
      <div className="driver-page">
        <Skeleton height="200px" borderRadius="12px" />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="driver-page">
        <div className="driver-page__empty">{t('driver_not_found')}</div>
      </div>
    );
  }

  const teamColor = getTeamColor(driver.team_name);

  return (
    <div className="driver-page">
      <div className="driver-page__hero" style={{ '--team-color': teamColor }}>
        <div className="driver-page__avatar" style={{ borderColor: teamColor }}>
          <span>{driver.name_acronym || '??'}</span>
        </div>
        <div className="driver-page__info">
          <span className="driver-page__flag">{getFlag(driver.country_code)}</span>
          <h2 className="driver-page__name">{driver.full_name}</h2>
          <p className="driver-page__team">{driver.team_name}</p>
          <span className="driver-page__number" style={{ color: teamColor }}>
            #{String(driver.driver_number).padStart(2, '0')}
          </span>
        </div>
      </div>

      {stints.length > 0 && (
        <div className="driver-page__section">
          <h3 className="driver-page__section-title">{t('driver_latest_stints')}</h3>
          <div className="driver-page__stints">
            {stints.map((s, i) => (
              <div key={i} className="driver-page__stint">
                <span className="driver-page__stint-compound" data-compound={s.compound?.toLowerCase()}>
                  {s.compound || '?'}
                </span>
                <span className="driver-page__stint-laps">
                  {s.lap_end && s.lap_start
                    ? `${s.lap_end - s.lap_start + 1} ${t('driver_laps')}`
                    : `${t('driver_lap')} ${s.lap_start}+`}
                </span>
                <span className="driver-page__stint-range">
                  L{s.lap_start}—L{s.lap_end || '?'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
