import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessions, getMeetings } from '../services/openf1';
import { useAppContext } from '../context/AppContext';
import { formatSessionTime } from '../utils/time';
import Skeleton from '../components/common/Skeleton';
import './Weekend.css';

export default function Weekend() {
  const { meetingKey } = useParams();
  const [sessions, setSessions] = useState([]);
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const { timezone, t } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [sess, meetings] = await Promise.all([
          getSessions(meetingKey),
          getMeetings(),
        ]);
        setSessions((sess || []).sort((a, b) => new Date(a.date_start) - new Date(b.date_start)));
        const m = meetings?.find(m => String(m.meeting_key) === String(meetingKey));
        setMeeting(m);
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
  }, [meetingKey]);

  if (loading) {
    return (
      <div className="weekend">
        <Skeleton height="40px" width="300px" />
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height="72px" borderRadius="10px" />
          ))}
        </div>
      </div>
    );
  }

  const now = new Date();

  return (
    <div className="weekend">
      <h2 className="weekend__title">{meeting?.meeting_name?.toUpperCase() || t('weekend_title')}</h2>
      <p className="weekend__subtitle">{meeting?.location}, {meeting?.country_name}</p>

      <div className="weekend__sessions">
        {sessions.map((s, i) => {
          const start = new Date(s.date_start);
          const end = new Date(s.date_end);
          let status = 'upcoming';
          if (now > end) status = 'completed';
          else if (now >= start && now <= end) status = 'live';

          return (
            <div
              key={s.session_key}
              className={`weekend__session weekend__session--${status}`}
              onClick={() => status === 'completed' ? navigate(`/results/${s.session_key}`) : null}
              style={{ animationDelay: `${i * 0.05}s`, cursor: status === 'completed' ? 'pointer' : 'default' }}
            >
              <div className="weekend__session-left">
                <span className="weekend__session-type">{s.session_type || ''}</span>
                <span className="weekend__session-name">{s.session_name}</span>
              </div>
              <div className="weekend__session-right">
                <span className="weekend__session-time">
                  {formatSessionTime(s.date_start, timezone)}
                </span>
                <span className={`weekend__session-status weekend__session-status--${status}`}>
                  {status === 'live' && <span className="weekend__live-dot" />}
                  {t(`weekend_${status}`)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
