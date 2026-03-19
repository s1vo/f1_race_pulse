import { useState, useEffect } from 'react';
import { getDriversChampionship, getTeamsChampionship, getDrivers, getLatestSession } from '../services/openf1';
import { showToast } from '../components/common/Toast';

function sortByDateDesc(items = [], field = 'date_start') {
  return [...items].sort((a, b) => new Date(b[field]) - new Date(a[field]));
}

function buildDriverMap(drivers = []) {
  return (drivers || []).reduce((acc, driver) => {
    acc[String(driver.driver_number)] = driver;
    return acc;
  }, {});
}

function normalizeDriverStandings(standings = [], drivers = []) {
  const driverMap = buildDriverMap(drivers);

  return [...(standings || [])]
    .map(entry => {
      const driver = driverMap[String(entry.driver_number)] || {};
      const points = entry.points_current ?? entry.points ?? 0;
      const previousPoints = entry.points_start ?? null;

      return {
        ...entry,
        ...driver,
        points,
        points_current: points,
        points_start: previousPoints,
        points_delta: previousPoints != null ? points - previousPoints : null,
        position: entry.position_current ?? entry.position_start ?? null,
        country_code: driver.country_code || entry.country_code || '',
        team_name: driver.team_name || entry.team_name || '',
      };
    })
    .sort((a, b) => (a.position_current || a.position || 999) - (b.position_current || b.position || 999));
}

function normalizeTeamStandings(standings = []) {
  return [...(standings || [])]
    .map(entry => {
      const points = entry.points_current ?? entry.points ?? 0;
      const previousPoints = entry.points_start ?? null;

      return {
        ...entry,
        points,
        points_current: points,
        points_start: previousPoints,
        points_delta: previousPoints != null ? points - previousPoints : null,
        position: entry.position_current ?? entry.position_start ?? null,
      };
    })
    .sort((a, b) => (a.position_current || a.position || 999) - (b.position_current || b.position || 999));
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function useStandings() {
  const [drivers, setDrivers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchStandings() {
      try {
        const raceSessions = await getLatestSession();
        if (!active || !raceSessions || raceSessions.length === 0) {
          return;
        }

        const now = new Date();
        const latestRaceSession = sortByDateDesc(
          (raceSessions || []).filter(session => new Date(session.date_start) <= now)
        )[0];

        if (!active || !latestRaceSession?.session_key) {
          setDrivers([]);
          setTeams([]);
          return;
        }

        const driverStandings = await getDriversChampionship(latestRaceSession.session_key);
        await delay(400);
        const teamStandings = await getTeamsChampionship(latestRaceSession.session_key);
        await delay(400);
        const driverDetails = await getDrivers(latestRaceSession.session_key);

        if (!active) return;

        setDrivers(normalizeDriverStandings(driverStandings, driverDetails));
        setTeams(normalizeTeamStandings(teamStandings));
      } catch (err) {
        if (!active) return;
        setDrivers([]);
        setTeams([]);
        showToast('Failed to load standings');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchStandings();

    return () => {
      active = false;
    };
  }, []);

  return { drivers, teams, loading };
}
