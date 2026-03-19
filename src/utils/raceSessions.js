const DEFAULT_MEETING_DURATION_MS = 3 * 24 * 60 * 60 * 1000;

function parseDate(value) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeValue(value) {
  return String(value || '').trim().toLowerCase();
}

export function sortMeetingsByStart(meetings = []) {
  return [...meetings].sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
}

export function sortSessionsByStart(sessions = []) {
  return [...sessions].sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
}

export function getMeetingEndDate(meeting = {}) {
  const end = parseDate(meeting.date_end);
  if (end) return end;

  const start = parseDate(meeting.date_start);
  if (!start) return null;

  return new Date(start.getTime() + DEFAULT_MEETING_DURATION_MS);
}

export function findCurrentMeeting(meetings = [], now = new Date()) {
  return sortMeetingsByStart(meetings).find(meeting => {
    const start = parseDate(meeting.date_start);
    const end = getMeetingEndDate(meeting);

    return start && end && now >= start && now < end;
  }) || null;
}

export function findNextMeeting(meetings = [], now = new Date()) {
  return sortMeetingsByStart(meetings).find(meeting => {
    const end = getMeetingEndDate(meeting);
    return end && end > now;
  }) || null;
}

export function findLastCompletedMeeting(meetings = [], now = new Date()) {
  return [...sortMeetingsByStart(meetings)].reverse().find(meeting => {
    const end = getMeetingEndDate(meeting);
    return end && end <= now;
  }) || null;
}

export function isSprintSession(session = {}) {
  const name = normalizeValue(session.session_name);
  const type = normalizeValue(session.session_type);

  return name.includes('sprint') || type.includes('sprint');
}

function isExactRaceSession(session = {}) {
  return normalizeValue(session.session_name) === 'race';
}

function isGrandPrixSession(session = {}) {
  const name = normalizeValue(session.session_name);
  return !isSprintSession(session) && (name === 'grand prix' || name.endsWith(' grand prix'));
}

function isRaceTypeSession(session = {}) {
  return !isSprintSession(session) && normalizeValue(session.session_type) === 'race';
}

export function findMainRaceSession(sessions = []) {
  const orderedSessions = sortSessionsByStart(sessions);

  return orderedSessions.find(isExactRaceSession)
    || orderedSessions.find(isGrandPrixSession)
    || [...orderedSessions].reverse().find(isRaceTypeSession)
    || null;
}

export function isSessionCompleted(session = {}, now = new Date()) {
  const end = parseDate(session.date_end);
  if (end) return end <= now;

  const start = parseDate(session.date_start);
  return start ? start <= now : false;
}
