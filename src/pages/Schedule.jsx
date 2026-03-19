import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMeetings } from '../services/openf1';
import { getFlag } from '../utils/flags';
import { useAppContext } from '../context/AppContext';
import Skeleton from '../components/common/Skeleton';
import { showToast } from '../components/common/Toast';
import './Schedule.css';

export default function Schedule() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { timezone, t } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    getMeetings()
      .then(data => setMeetings((data || []).sort((a, b) => new Date(a.date_start) - new Date(b.date_start))))
      .catch(() => showToast('Failed to load schedule'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="schedule">
        <h2 className="schedule__title">{t('schedule_title')} {new Date().getFullYear()}</h2>
        <div className="schedule__grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height="160px" borderRadius="12px" />
          ))}
        </div>
      </div>
    );
  }

  const now = new Date();

  return (
    <div className="schedule">
      <h2 className="schedule__title">{t('schedule_title')} {new Date().getFullYear()}</h2>
      <div className="schedule__grid">
        {meetings.map((m, i) => {
          const start = new Date(m.date_start);
          const end = m.date_end ? new Date(m.date_end) : new Date(start.getTime() + 3 * 24 * 60 * 60 * 1000);
          let status = 'future';
          if (now > end) status = 'past';
          else if (now >= start && now <= end) status = 'current';

          return (
            <div
              key={m.meeting_key}
              className={`schedule__card schedule__card--${status}`}
              onClick={() => navigate(`/weekend/${m.meeting_key}`)}
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className="schedule__card-top">
                <span className="schedule__flag">{getFlag(m.country_name)}</span>
                <span className={`schedule__status-badge schedule__status-badge--${status}`}>
                  {status === 'current' ? t('schedule_live') : status === 'past' ? t('schedule_completed') : t('schedule_upcoming')}
                </span>
              </div>
              <h3 className="schedule__card-name">{m.meeting_name}</h3>
              <p className="schedule__card-circuit">{m.circuit_short_name || m.location}</p>
              <p className="schedule__card-date">
                {start.toLocaleDateString('en-GB', {
                  timeZone: timezone,
                  day: '2-digit',
                  month: 'short',
                })}
                {m.date_end && ` — ${end.toLocaleDateString('en-GB', {
                  timeZone: timezone,
                  day: '2-digit',
                  month: 'short',
                })}`}
              </p>
              <span className="schedule__round">R{String(i + 1).padStart(2, '0')}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
