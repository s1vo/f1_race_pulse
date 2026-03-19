import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDrivers, getLatestCompletedRaceSession, getSessionResults } from '../services/openf1';
import { useAppContext } from '../context/AppContext';
import { getTeamColor } from '../utils/teams';
import { SkeletonTable } from '../components/common/Skeleton';
import { showToast } from '../components/common/Toast';
import './Results.css';

function formatGapDisplay(gap, position) {
  if (position === 1) return '';
  if (gap === null || gap === undefined) return '—';
  if (gap === 0) return '';
  if (typeof gap === 'string') return gap;
  return `+${gap.toFixed(3)}s`;
}

export default function Results() {
  const { sessionKey: paramKey } = useParams();
  const { t } = useAppContext();
  const [results, setResults] = useState([]);
  const [sessionInfo, setSessionInfo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        let key = paramKey;
        let meetingName = '';
        let sessionName = '';

        if (!key) {
          const { meeting, raceSession } = await getLatestCompletedRaceSession();

          if (meeting && raceSession) {
            key = raceSession.session_key;
            meetingName = meeting.meeting_name;
            sessionName = raceSession.session_name;
            setSessionInfo(`${meetingName} — ${sessionName}`);
          }
        }

        if (key) {
          const [resultsData, driversList] = await Promise.all([
            getSessionResults(key),
            getDrivers(key),
          ]);

          const driverMap = {};
          (driversList || []).forEach(d => { driverMap[d.driver_number] = d; });

          const enriched = (resultsData || []).map(r => {
            const drv = driverMap[r.driver_number] || {};
            return {
              ...r,
              team_name: drv.team_name || '',
              first_name: drv.first_name || '',
              last_name: drv.last_name || '',
              broadcast_name: drv.broadcast_name || '',
              team_colour: drv.team_colour || '',
            };
          });
          setResults(enriched);
        }
      } catch {
        showToast('Failed to load results');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [paramKey]);

  return (
    <div className="results-page">
      <h2 className="results-page__title">
        {sessionInfo || t('results_title')}
      </h2>

      {loading ? (
        <SkeletonTable rows={20} cols={6} />
      ) : results.length === 0 ? (
        <div className="results-page__empty">{t('results_no_data')}</div>
      ) : (
        <div className="results-page__table-wrap">
          <table className="results-table">
            <thead>
              <tr>
                <th>{t('results_pos')}</th>
                <th>{t('results_driver')}</th>
                <th>{t('results_team')}</th>
                <th>{t('results_time_gap')}</th>
                <th>{t('results_points')}</th>
              </tr>
            </thead>
            <tbody>
              {results
                .filter(r => r.position != null)
                .sort((a, b) => a.position - b.position)
                .map((r, idx) => {
                  const teamColor = r.team_colour
                    ? `#${r.team_colour}`
                    : getTeamColor(r.team_name);
                  return (
                    <tr
                      key={idx}
                      className="results-table__row"
                      style={{ animationDelay: `${idx * 0.02}s` }}
                    >
                      <td className="results-table__pos">{r.position}</td>
                      <td className="results-table__driver">
                        <span className="results-table__team-bar" style={{ backgroundColor: teamColor }} />
                        {r.broadcast_name || (r.first_name && r.last_name ? `${r.first_name[0]}. ${r.last_name.toUpperCase()}` : `#${r.driver_number}`)}
                      </td>
                      <td className="results-table__team">{r.team_name || '—'}</td>
                      <td className="results-table__time">
                        {r.position === 1
                          ? t('results_winner')
                          : formatGapDisplay(r.gap_to_leader, r.position)}
                      </td>
                      <td className="results-table__points">{r.points ?? 0}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
