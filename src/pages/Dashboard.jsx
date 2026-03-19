import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useNextRace from '../hooks/useNextRace';
import useLiveData from '../hooks/useLiveData';
import { useAppContext } from '../context/AppContext';
import { getDrivers, getRaceControl } from '../services/openf1';
import { getCountdown, formatDriverNumber, formatSessionTime } from '../utils/time';
import { formatDriverDisplayName } from '../utils/driverNames';
import { getFlag } from '../utils/flags';
import { getTeamColor } from '../utils/teams';
import WeatherWidget from '../components/widgets/WeatherWidget';
import LiveTiming from '../components/widgets/LiveTiming';
import IncidentsLog from '../components/widgets/IncidentsLog';
import Skeleton from '../components/common/Skeleton';
import { findMainRaceSession } from '../utils/raceSessions';
import './Dashboard.css';

function formatGapDisplay(gap) {
  if (gap === null || gap === undefined) return '';
  if (gap === 0) return '';
  if (typeof gap === 'string') return gap;
  return `+${gap.toFixed(3)}s`;
}

export default function Dashboard() {
  const { t, timezone } = useAppContext();
  const { nextRace, nextRaceSessions, lastRace, lastResults, roundNumber, loading } = useNextRace();
  const [countdown, setCountdown] = useState(null);
  const [liveSessionKey, setLiveSessionKey] = useState(null);
  const [liveSessionName, setLiveSessionName] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [raceControlMessages, setRaceControlMessages] = useState([]);
  const [weatherSessionKey, setWeatherSessionKey] = useState(null);
  const orderedNextRaceSessions = [...(nextRaceSessions || [])].sort(
    (a, b) => new Date(a.date_start) - new Date(b.date_start)
  );

  const { positions, intervals, loading: liveLoading } = useLiveData(liveSessionKey, !!liveSessionKey);

  // Find live session
  useEffect(() => {
    const sessions = [...(nextRaceSessions || [])].sort(
      (a, b) => new Date(a.date_start) - new Date(b.date_start)
    );

    if (!sessions.length) {
      setLiveSessionKey(null);
      setLiveSessionName('');
      setDrivers([]);
      setRaceControlMessages([]);
      setWeatherSessionKey(null);
      return;
    }

    const now = new Date();
    const live = sessions.find(s => {
      const start = new Date(s.date_start);
      const end = new Date(s.date_end);
      return now >= start && now <= end;
    });

    if (live) {
      setLiveSessionKey(live.session_key);
      setLiveSessionName(live.session_name);
      setWeatherSessionKey(live.session_key);
      getDrivers(live.session_key).then(d => setDrivers(d || []));
      getRaceControl(live.session_key).then(rc => setRaceControlMessages(rc || []));
    } else {
      setLiveSessionKey(null);
      setLiveSessionName('');
      setDrivers([]);
      setRaceControlMessages([]);
      setWeatherSessionKey(null);
    }
  }, [nextRaceSessions]);

  // Countdown timer — target the Race session start
  useEffect(() => {
    if (!nextRace) return;
    const raceSession = findMainRaceSession(nextRaceSessions || []);
    const targetDate = raceSession?.date_start || nextRace.date_start;

    const tick = () => setCountdown(getCountdown(targetDate));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [nextRace, nextRaceSessions]);

  if (loading) {
    return (
      <div className="dashboard">
        <Skeleton height="320px" borderRadius="16px" />
        <div className="dashboard__grid">
          <Skeleton height="300px" borderRadius="12px" />
          <Skeleton height="300px" borderRadius="12px" />
          <Skeleton height="300px" borderRadius="12px" />
        </div>
      </div>
    );
  }

  const meetingName = nextRace?.meeting_name || 'GRAND PRIX';
  const country = nextRace?.country_name || '';
  const location = nextRace?.location || '';

  const raceSession = findMainRaceSession(orderedNextRaceSessions);
  const raceDate = raceSession?.date_start || nextRace?.date_start;
  const weatherTargetSession = orderedNextRaceSessions.find(s => new Date(s.date_end) > new Date()) || raceSession || orderedNextRaceSessions[0] || null;
  const weatherTargetDate = liveSessionKey
    ? new Date().toISOString()
    : weatherTargetSession?.date_start || raceDate || nextRace?.date_start || null;

  return (
    <div className="dashboard">
      {/* Hero block */}
      <div className="dashboard__hero">
        <div
          className="dashboard__hero-photo"
          aria-hidden="true"
          style={{ '--dashboard-hero-photo-url': `url(${process.env.PUBLIC_URL}/hero-bg.jpg)` }}
        />
        <div className="dashboard__hero-badge">
          {t('dash_round')} {roundNumber ? String(roundNumber).padStart(2, '0') : '—'} | {countdown?.expired ? t('dash_completed') : t('dash_upcoming')}
        </div>
        <h1 className="dashboard__hero-title">{meetingName.toUpperCase()}</h1>
        <div className="dashboard__hero-year">{new Date().getFullYear()}</div>

        <div className="dashboard__hero-meta">
          {countdown && !countdown.expired && (
            <div className="dashboard__countdown">
              <span className="dashboard__countdown-label">{t('dash_time_remaining')}</span>
              <div className="dashboard__countdown-grid">
                <div className="dashboard__countdown-item">
                  <span className="dashboard__countdown-value">{String(countdown.days).padStart(2, '0')}</span>
                  <span className="dashboard__countdown-unit">{t('dash_days')}</span>
                </div>
                <span className="dashboard__countdown-sep">:</span>
                <div className="dashboard__countdown-item">
                  <span className="dashboard__countdown-value">{String(countdown.hours).padStart(2, '0')}</span>
                  <span className="dashboard__countdown-unit">{t('dash_hrs')}</span>
                </div>
                <span className="dashboard__countdown-sep">:</span>
                <div className="dashboard__countdown-item">
                  <span className="dashboard__countdown-value">{String(countdown.minutes).padStart(2, '0')}</span>
                  <span className="dashboard__countdown-unit">{t('dash_min')}</span>
                </div>
                <span className="dashboard__countdown-sep">:</span>
                <div className="dashboard__countdown-item">
                  <span className="dashboard__countdown-value">{String(countdown.seconds).padStart(2, '0')}</span>
                  <span className="dashboard__countdown-unit">{t('dash_sec')}</span>
                </div>
              </div>
            </div>
          )}

          <div className="dashboard__hero-details">
            <div className="dashboard__hero-location">
              <span className="dashboard__location-dot" />
              {getFlag(country)} {location}, {country}
            </div>
            {raceDate && (
              <div className="dashboard__hero-race-date">
                {formatSessionTime(raceDate, timezone)}
              </div>
            )}
            {orderedNextRaceSessions.length > 0 && (
              <div className="dashboard__hero-sessions">
                {orderedNextRaceSessions.slice(0, 5).map(s => {
                  const now = new Date();
                  const start = new Date(s.date_start);
                  const end = new Date(s.date_end);
                  const isLive = now >= start && now <= end;
                  const isPast = now > end;
                  return (
                    <div
                      key={s.session_key}
                      className={`dashboard__mini-session ${isLive ? 'dashboard__mini-session--live' : ''} ${isPast ? 'dashboard__mini-session--past' : ''}`}
                    >
                      <span className="dashboard__mini-session-name">{s.session_name}</span>
                      <span className="dashboard__mini-session-time">
                        {formatSessionTime(s.date_start, timezone)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="dashboard__grid">
        {/* Last race results */}
        <div className="dashboard__card dashboard__card--results">
          <div className="dashboard__card-header">
            <h2 className="dashboard__card-title">
              {t('dash_last_race')}: {lastRace?.meeting_name?.toUpperCase() || '—'}
            </h2>
          </div>
          <div className="dashboard__podium">
            {lastResults.length > 0 ? lastResults.map((r, i) => {
              const teamColor = r.team_colour
                ? `#${r.team_colour}`
                : getTeamColor(r.team_name);
              return (
                <div key={i} className="dashboard__podium-item" style={{ '--team-color': teamColor }}>
                  <span className="dashboard__podium-pos">{formatDriverNumber(r.position)}</span>
                  <div className="dashboard__podium-bar" style={{ backgroundColor: teamColor }} />
                  <div className="dashboard__podium-info">
                    <span className="dashboard__podium-team">{r.team_name}</span>
                    <span className="dashboard__podium-name">
                      {formatDriverDisplayName(r)}
                    </span>
                    {r.gap_to_leader !== 0 && r.gap_to_leader != null && (
                      <span className="dashboard__podium-gap">{formatGapDisplay(r.gap_to_leader)}</span>
                    )}
                  </div>
                  <div className="dashboard__podium-pts">
                    <span>{r.points || 0} {t('pts')}</span>
                    {i === 0 && <span className="dashboard__winner-badge">{t('dash_winner')}</span>}
                  </div>
                </div>
              );
            }) : (
              <div className="dashboard__card-empty">{t('dash_no_results')}</div>
            )}
          </div>
          <Link to="/results" className="dashboard__card-link">{t('dash_full_classification')} →</Link>
        </div>

        {/* Live timing or placeholder */}
        <div className="dashboard__card dashboard__card--live">
          <div className="dashboard__card-header">
            <h2 className="dashboard__card-title">
              {liveSessionKey ? `LIVE: ${liveSessionName} ${t('dash_live_telemetry')}` : t('dash_timing_data')}
            </h2>
            {liveSessionKey && (
              <div className="dashboard__live-indicator">
                <span className="dashboard__live-dot" />
                LIVE
              </div>
            )}
          </div>
          <LiveTiming
            positions={positions}
            intervals={intervals}
            drivers={drivers}
            loading={liveLoading && !!liveSessionKey}
            compact
          />
          {!liveSessionKey && positions.length === 0 && (
            <div className="dashboard__card-empty">{t('dash_no_live')}</div>
          )}
        </div>

        {/* Weather */}
        <WeatherWidget
          sessionKey={weatherSessionKey}
          location={location || country}
          country={country}
          meetingName={meetingName}
          targetDate={weatherTargetDate}
        />
      </div>

      {/* Race Control */}
      {raceControlMessages.length > 0 && (
        <div className="dashboard__card dashboard__card--rc">
          <div className="dashboard__card-header">
            <h2 className="dashboard__card-title">{t('dash_race_control')}</h2>
          </div>
          <IncidentsLog messages={raceControlMessages} compact />
        </div>
      )}
    </div>
  );
}
