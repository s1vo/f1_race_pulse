import React, { useState, useEffect } from 'react';
import useLiveData from '../hooks/useLiveData';
import { useAppContext } from '../context/AppContext';
import { getMeetings, getSessions, getDrivers } from '../services/openf1';
import { getTeamColor } from '../utils/teams';
import { formatGap } from '../utils/time';
import TimingCell from '../components/common/TimingCell';
import IncidentsLog from '../components/widgets/IncidentsLog';
import { SkeletonTable } from '../components/common/Skeleton';
import { showToast } from '../components/common/Toast';
import './Live.css';

export default function Live() {
  const { t } = useAppContext();
  const [sessionKey, setSessionKey] = useState(null);
  const [sessionName, setSessionName] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [sessionStatus, setSessionStatus] = useState('');
  const { positions, intervals, raceControl, loading } = useLiveData(sessionKey, !!sessionKey);

  useEffect(() => {
    async function findSession() {
      try {
        const meetings = await getMeetings();
        if (!meetings || meetings.length === 0) return;

        const now = new Date();
        const sorted = [...meetings].sort(
          (a, b) => new Date(a.date_start) - new Date(b.date_start)
        );

        let meeting = sorted.find(m => {
          const start = new Date(m.date_start);
          const end = new Date(m.date_end || start.getTime() + 4 * 24 * 60 * 60 * 1000);
          return now >= start && now <= end;
        });

        if (!meeting) {
          const past = sorted.filter(m => new Date(m.date_start) <= now);
          meeting = past[past.length - 1] || sorted[0];
        }

        const sessions = await getSessions(meeting.meeting_key);
        const active = sessions?.find(s => {
          const start = new Date(s.date_start);
          const end = new Date(s.date_end);
          return now >= start && now <= end;
        });

        const session = active || sessions?.[sessions.length - 1];
        if (session) {
          setSessionKey(session.session_key);
          setSessionName(session.session_name);
          setSessionStatus(active ? 'LIVE' : 'REPLAY');
          const drv = await getDrivers(session.session_key);
          setDrivers(drv || []);
        }
      } catch (err) {
        showToast('Failed to find session');
      }
    }
    findSession();
  }, []);

  const driverMap = {};
  drivers.forEach(d => { driverMap[d.driver_number] = d; });

  const lastFlag = raceControl
    .filter(rc => rc.flag)
    .slice(-1)[0];
  const flagStatus = lastFlag?.flag || 'GREEN';

  return (
    <div className="live-page">
      <div className="live-page__header">
        <div className="live-page__session-info">
          <h2 className="live-page__session-name">{sessionName || t('live_session')}</h2>
          <div className={`live-page__status live-page__status--${flagStatus.toLowerCase()}`}>
            {sessionStatus === 'LIVE' && <span className="live-page__status-dot" />}
            {sessionStatus === 'LIVE' ? t('live_live') : t('live_replay')} — {flagStatus}
          </div>
        </div>
      </div>

      <div className="live-page__content">
        <div className="live-page__timing">
          {loading ? (
            <SkeletonTable rows={20} cols={6} />
          ) : (
            <div className="live-page__table-wrap">
              <table className="live-table">
                <thead>
                  <tr>
                    <th>{t('live_pos')}</th>
                    <th>{t('live_no')}</th>
                    <th>{t('live_driver')}</th>
                    <th>{t('live_team')}</th>
                    <th>{t('live_gap')}</th>
                    <th>{t('live_interval')}</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos, idx) => {
                    const driver = driverMap[pos.driver_number] || {};
                    const teamColor = getTeamColor(driver.team_name);
                    const interval = intervals[pos.driver_number];

                    return (
                      <tr
                        key={pos.driver_number}
                        className="live-table__row"
                        style={{
                          '--team-color': teamColor,
                          animationDelay: `${idx * 0.02}s`,
                        }}
                      >
                        <td className="live-table__pos">{pos.position}</td>
                        <td className="live-table__number">
                          <span className="live-table__team-dot" style={{ backgroundColor: teamColor }} />
                          {String(pos.driver_number).padStart(2, '0')}
                        </td>
                        <td className="live-table__driver">
                          {driver.name_acronym || `Driver ${pos.driver_number}`}
                        </td>
                        <td className="live-table__team">{driver.team_name || '—'}</td>
                        <td className="live-table__gap">
                          {interval?.gap_to_leader != null
                            ? formatGap(interval.gap_to_leader)
                            : pos.position === 1 ? t('live_leader') : '—'}
                        </td>
                        <td className="live-table__interval">
                          {interval?.interval != null ? (
                            <TimingCell value={formatGap(interval.interval)} type="yellow" />
                          ) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="live-page__sidebar">
          <div className="live-page__rc-card">
            <h3 className="live-page__rc-title">{t('live_race_control')}</h3>
            <IncidentsLog messages={raceControl} />
          </div>
        </div>
      </div>
    </div>
  );
}
