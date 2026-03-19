import React, { useState, useEffect, useRef, useCallback } from 'react';
import './LoadingBar.css';

// Global loading state manager
let listeners = [];
let activeCount = 0;

export function startLoading() {
  activeCount++;
  listeners.forEach(fn => fn(activeCount));
}

export function stopLoading() {
  activeCount = Math.max(0, activeCount - 1);
  listeners.forEach(fn => fn(activeCount));
}

export default function LoadingBar() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const startProgress = useCallback(() => {
    setLoading(true);
    setVisible(true);
    setProgress(0);

    // Simulate progress that slows down as it approaches 90%
    let current = 0;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      current += Math.max(0.5, (90 - current) * 0.08);
      if (current >= 90) current = 90;
      setProgress(current);
    }, 100);
  }, []);

  const completeProgress = useCallback(() => {
    clearInterval(intervalRef.current);
    setProgress(100);
    setLoading(false);

    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 400);
  }, []);

  useEffect(() => {
    const handler = (count) => {
      if (count > 0 && !loading) {
        startProgress();
      } else if (count === 0 && loading) {
        completeProgress();
      }
    };

    listeners.push(handler);
    return () => {
      listeners = listeners.filter(fn => fn !== handler);
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, [loading, startProgress, completeProgress]);

  if (!visible) return null;

  return (
    <div className="loading-bar">
      <div
        className={`loading-bar__progress ${!loading ? 'loading-bar__progress--done' : ''}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
