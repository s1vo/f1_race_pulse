import { useState, useEffect } from 'react';
import { getMeetings, getSessions, getSessionResults, getDrivers } from '../services/openf1';
import { showToast } from '../components/common/Toast';

function sortSessionsByStart(sessions = []) {
  return [...sessions].sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
}

function findRaceSession(sessions = []) {
  return sessions.find(session =>
    session.session_name === 'Race' ||
    session.session_type === 'Race' ||
    /grand prix|race/i.test(session.session_name || '')
  ) || null;
}

function buildDriverMap(drivers = []) {
  return (drivers || []).reduce((acc, driver) => {
    acc[driver.driver_number] = driver;
    return acc;
  }, {});
}

function enrichRaceResults(results = [], drivers = []) {
  const driverMap = buildDriverMap(drivers);

  return (results || [])
    .filter(result => result.position != null)
    .sort((a, b) => a.position - b.position)
    .slice(0, 3)
    .map(result => {
      const driver = driverMap[result.driver_number] || {};

      return {
        position: result.position,
        driver_number: result.driver_number,
        points: result.points,
        gap_to_leader: result.gap_to_leader,
        number_of_laps: result.number_of_laps,
        team_name: driver.team_name || `Team #${result.driver_number}`,
        first_name: driver.first_name || '',
        last_name: driver.last_name || '',
        name_acronym: driver.name_acronym || '',
        broadcast_name: driver.broadcast_name || `#${result.driver_number}`,
        team_colour: driver.team_colour || '',
      };
    });
}

export default function useNextRace() {
  const [nextRace, setNextRace] = useState(null);
  const [nextRaceSessions, setNextRaceSessions] = useState([]);
  const [lastRace, setLastRace] = useState(null);
  const [lastRaceSessions, setLastRaceSessions] = useState([]);
  const [lastResults, setLastResults] = useState([]);
  const [roundNumber, setRoundNumber] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      try {
        const meetings = await getMeetings();
        if (!active) return;

        if (!meetings || meetings.length === 0) {
          if (active) setLoading(false);
          return;
        }

        const now = new Date();
        const sorted = [...meetings].sort(
          (a, b) => new Date(a.date_start) - new Date(b.date_start)
        );

        // Find the next upcoming meeting (whose date_end hasn't passed yet)
        const upcomingIdx = sorted.findIndex(m => {
          const end = m.date_end ? new Date(m.date_end) : new Date(new Date(m.date_start).getTime() + 3 * 24 * 60 * 60 * 1000);
          return end > now;
        });

        const upcoming = upcomingIdx >= 0 ? sorted[upcomingIdx] : null;
        const past = sorted.filter(m => new Date(m.date_start) <= now);
        const lastPast = past[past.length - 1];

        // If the last past meeting is also "upcoming" (weekend in progress), pick the one before
        const actualLast = (upcoming && lastPast && upcoming.meeting_key === lastPast.meeting_key)
          ? past[past.length - 2] || null
          : lastPast || null;

        setNextRace(upcoming || sorted[sorted.length - 1]);
        setRoundNumber(upcomingIdx >= 0 ? upcomingIdx + 1 : sorted.length);
        setLastRace(actualLast);

        const [upcomingSessions, previousSessions] = await Promise.all([
          upcoming ? getSessions(upcoming.meeting_key) : Promise.resolve([]),
          actualLast ? getSessions(actualLast.meeting_key) : Promise.resolve([]),
        ]);

        if (!active) return;

        const sortedUpcomingSessions = sortSessionsByStart(upcomingSessions || []);
        const sortedPreviousSessions = sortSessionsByStart(previousSessions || []);

        setNextRaceSessions(sortedUpcomingSessions);
        setLastRaceSessions(sortedPreviousSessions);

        const raceSession = findRaceSession(sortedPreviousSessions);
        if (raceSession) {
          try {
            const [results, drivers] = await Promise.all([
              getSessionResults(raceSession.session_key),
              getDrivers(raceSession.session_key),
            ]);

            if (!active) return;

            setLastResults(enrichRaceResults(results, drivers));
          } catch (error) {
            if (!active) return;
            setLastResults([]);
          }
        } else {
          setLastResults([]);
        }
      } catch (err) {
        showToast('Failed to load race schedule');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, []);

  return { nextRace, nextRaceSessions, lastRace, lastRaceSessions, lastResults, roundNumber, loading };
}
