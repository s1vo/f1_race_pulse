import { useState, useEffect, useRef } from 'react';
import { getPositions, getIntervals, getRaceControl } from '../services/openf1';

export default function useLiveData(sessionKey, enabled = true) {
  const [positions, setPositions] = useState([]);
  const [intervals, setIntervals] = useState([]);
  const [raceControl, setRaceControl] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sessionKey || !enabled) return;

    async function fetchLive() {
      try {
        const [pos, ints, rc] = await Promise.all([
          getPositions(sessionKey),
          getIntervals(sessionKey),
          getRaceControl(sessionKey),
        ]);

        // Get latest position per driver
        const latestPositions = {};
        (pos || []).forEach(p => {
          if (!latestPositions[p.driver_number] ||
              new Date(p.date) > new Date(latestPositions[p.driver_number].date)) {
            latestPositions[p.driver_number] = p;
          }
        });
        setPositions(
          Object.values(latestPositions).sort((a, b) => a.position - b.position)
        );

        // Get latest interval per driver
        const latestIntervals = {};
        (ints || []).forEach(i => {
          if (!latestIntervals[i.driver_number] ||
              new Date(i.date) > new Date(latestIntervals[i.driver_number].date)) {
            latestIntervals[i.driver_number] = i;
          }
        });
        setIntervals(latestIntervals);

        setRaceControl(rc || []);
      } catch (err) {
        console.error('Live data error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLive();
    intervalRef.current = setInterval(fetchLive, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sessionKey, enabled]);

  return { positions, intervals, raceControl, loading };
}
