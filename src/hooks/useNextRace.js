import { useState, useEffect } from 'react';
import { getMeetings, getSessions, getSessionResults, getDrivers } from '../services/openf1';
import { showToast } from '../components/common/Toast';
import {
  findCurrentMeeting,
  findLastCompletedMeeting,
  findMainRaceSession,
  findNextMeeting,
  isSessionCompleted,
  sortMeetingsByStart,
  sortSessionsByStart,
} from '../utils/raceSessions';

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
        const sortedMeetings = sortMeetingsByStart(meetings || []);
        const currentMeeting = findCurrentMeeting(sortedMeetings, now);
        const upcoming = findNextMeeting(sortedMeetings, now);
        const fallbackNextRace = upcoming || sortedMeetings[sortedMeetings.length - 1] || null;
        const lastCompletedMeeting = findLastCompletedMeeting(sortedMeetings, now);

        setNextRace(fallbackNextRace);
        setRoundNumber(
          upcoming
            ? sortedMeetings.findIndex(meeting => meeting.meeting_key === upcoming.meeting_key) + 1
            : sortedMeetings.length
        );

        const meetingKeys = [fallbackNextRace, currentMeeting, lastCompletedMeeting]
          .filter(Boolean)
          .map(meeting => meeting.meeting_key)
          .filter((meetingKey, index, list) => list.indexOf(meetingKey) === index);
        const sessionEntries = await Promise.all(
          meetingKeys.map(async meetingKey => [
            meetingKey,
            sortSessionsByStart(await getSessions(meetingKey)),
          ])
        );

        if (!active) return;

        const sessionsByMeetingKey = Object.fromEntries(sessionEntries);
        const sortedUpcomingSessions = fallbackNextRace
          ? sessionsByMeetingKey[fallbackNextRace.meeting_key] || []
          : [];
        const currentMeetingSessions = currentMeeting
          ? sessionsByMeetingKey[currentMeeting.meeting_key] || []
          : [];
        const currentMeetingRace = findMainRaceSession(currentMeetingSessions);
        const useCurrentMeetingAsLastRace = !!(
          currentMeeting &&
          currentMeetingRace &&
          isSessionCompleted(currentMeetingRace, now)
        );
        const resolvedLastRace = useCurrentMeetingAsLastRace ? currentMeeting : lastCompletedMeeting;
        const sortedPreviousSessions = resolvedLastRace
          ? sessionsByMeetingKey[resolvedLastRace.meeting_key] || []
          : [];

        setNextRaceSessions(sortedUpcomingSessions);
        setLastRaceSessions(sortedPreviousSessions);
        setLastRace(resolvedLastRace);

        const raceSession = findMainRaceSession(sortedPreviousSessions);
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
