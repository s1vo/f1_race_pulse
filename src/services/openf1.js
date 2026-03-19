import axios from 'axios';
import { startLoading, stopLoading } from '../components/common/LoadingBar';
import {
  findCurrentMeeting,
  findLastCompletedMeeting,
  findMainRaceSession,
  isSessionCompleted,
  sortMeetingsByStart,
  sortSessionsByStart,
} from '../utils/raceSessions';

const API = axios.create({
  baseURL: 'https://api.openf1.org/v1',
  timeout: 15000,
});

// Axios interceptors for global loading bar
API.interceptors.request.use(config => {
  startLoading();
  return config;
});

API.interceptors.response.use(
  response => { stopLoading(); return response; },
  error => { stopLoading(); return Promise.reject(error); }
);

const CACHE_TTL = 60000; // 60 seconds
const cache = {};
const pendingRequests = {};
const MIN_REQUEST_INTERVAL = 400;
const RETRYABLE_STATUS_CODES = new Set([429]);
let requestQueue = Promise.resolve();
let lastRequestStartedAt = 0;

function getCached(key) {
  const entry = cache[key];
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  return null;
}

function setCache(key, data) {
  cache[key] = { data, timestamp: Date.now() };
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function scheduleRequest(task) {
  const run = async () => {
    const now = Date.now();
    const waitTime = Math.max(0, MIN_REQUEST_INTERVAL - (now - lastRequestStartedAt));
    if (waitTime > 0) {
      await delay(waitTime);
    }

    lastRequestStartedAt = Date.now();
    return task();
  };

  const scheduled = requestQueue.then(run, run);
  requestQueue = scheduled.catch(() => {});
  return scheduled;
}

async function requestWithRetry(url, params = {}, retries = 1) {
  try {
    return await scheduleRequest(() => API.get(url, { params }));
  } catch (error) {
    if (retries > 0 && RETRYABLE_STATUS_CODES.has(error.response?.status)) {
      const retryAfterHeader = Number(error.response?.headers?.['retry-after']);
      const retryDelay = Number.isFinite(retryAfterHeader) && retryAfterHeader > 0
        ? retryAfterHeader * 1000
        : 1200;

      await delay(retryDelay);
      return requestWithRetry(url, params, retries - 1);
    }

    throw error;
  }
}

async function cachedGet(url, params = {}, skipCache = false) {
  const cacheKey = url + JSON.stringify(params);
  if (!skipCache) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  if (pendingRequests[cacheKey]) {
    return pendingRequests[cacheKey];
  }

  const requestPromise = (async () => {
    try {
      const { data } = await requestWithRetry(url, params);
      if (!skipCache) setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`API Error [${url}]:`, error.message);
      throw error;
    } finally {
      delete pendingRequests[cacheKey];
    }
  })();

  pendingRequests[cacheKey] = requestPromise;

  try {
    return await requestPromise;
  } finally {
    delete pendingRequests[cacheKey];
  }
}

// Meetings (schedule)
export const getMeetings = (year = new Date().getFullYear()) =>
  cachedGet('/meetings', { year });

// Sessions for a meeting
export const getSessions = (meetingKey) =>
  cachedGet('/sessions', { meeting_key: meetingKey });

// Session results
export const getSessionResults = (sessionKey) =>
  cachedGet('/session_result', { session_key: sessionKey });

// Starting grid
export const getStartingGrid = (sessionKey) =>
  cachedGet('/starting_grid', { session_key: sessionKey });

// Live positions
export const getPositions = (sessionKey) =>
  cachedGet('/position', { session_key: sessionKey, 'position<=': 20 }, true);

// Live intervals
export const getIntervals = (sessionKey) =>
  cachedGet('/intervals', { session_key: sessionKey }, true);

// Race control messages
export const getRaceControl = (sessionKey) =>
  cachedGet('/race_control', { session_key: sessionKey }, true);

// Weather
export const getWeather = (sessionKey) =>
  cachedGet('/weather', { session_key: sessionKey });

// Drivers championship
export const getDriversChampionship = (sessionKey) =>
  cachedGet('/championship_drivers', { session_key: sessionKey });

// Teams championship
export const getTeamsChampionship = (sessionKey) =>
  cachedGet('/championship_teams', { session_key: sessionKey });

// Stints
export const getStints = (sessionKey, driverNumber) =>
  cachedGet('/stints', { session_key: sessionKey, driver_number: driverNumber });

// Drivers list
export const getDrivers = (sessionKey) =>
  cachedGet('/drivers', { session_key: sessionKey });

// Lap data
export const getLaps = (sessionKey, driverNumber) =>
  cachedGet('/laps', { session_key: sessionKey, driver_number: driverNumber });

// Latest session (most recent)
export const getLatestSession = () =>
  cachedGet('/sessions', { session_name: 'Race', year: new Date().getFullYear() });

export async function getLatestCompletedRaceSession(now = new Date()) {
  const meetings = await getMeetings();
  const sortedMeetings = sortMeetingsByStart(meetings || []);
  const currentMeeting = findCurrentMeeting(sortedMeetings, now);
  const lastCompletedMeeting = findLastCompletedMeeting(sortedMeetings, now);
  const candidateMeetings = [currentMeeting, lastCompletedMeeting]
    .filter(Boolean)
    .filter((meeting, index, list) =>
      list.findIndex(candidate => candidate.meeting_key === meeting.meeting_key) === index
    );

  for (const meeting of candidateMeetings) {
    const sessions = sortSessionsByStart(await getSessions(meeting.meeting_key));
    const raceSession = findMainRaceSession(sessions);

    if (!raceSession) continue;

    if (currentMeeting?.meeting_key === meeting.meeting_key && !isSessionCompleted(raceSession, now)) {
      continue;
    }

    return { meeting, sessions, raceSession };
  }

  return { meeting: null, sessions: [], raceSession: null };
}

const openf1 = {
  getMeetings,
  getSessions,
  getSessionResults,
  getStartingGrid,
  getPositions,
  getIntervals,
  getRaceControl,
  getWeather,
  getDriversChampionship,
  getTeamsChampionship,
  getStints,
  getDrivers,
  getLaps,
  getLatestSession,
  getLatestCompletedRaceSession,
};

export default openf1;
