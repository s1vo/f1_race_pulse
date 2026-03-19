import {
  findCurrentMeeting,
  findLastCompletedMeeting,
  findMainRaceSession,
} from './raceSessions';

describe('raceSessions', () => {
  test('prefers the main race over sprint sessions', () => {
    const sessions = [
      {
        session_key: 1,
        session_name: 'Practice 1',
        session_type: 'Practice',
        date_start: '2026-03-20T02:30:00Z',
      },
      {
        session_key: 2,
        session_name: 'Sprint',
        session_type: 'Race',
        date_start: '2026-03-21T03:00:00Z',
      },
      {
        session_key: 3,
        session_name: 'Race',
        session_type: 'Race',
        date_start: '2026-03-22T07:00:00Z',
      },
    ];

    expect(findMainRaceSession(sessions)?.session_key).toBe(3);
  });

  test('falls back to a grand prix session name when race is not named exactly Race', () => {
    const sessions = [
      {
        session_key: 5,
        session_name: 'Sprint',
        session_type: 'Race',
        date_start: '2026-04-04T03:00:00Z',
      },
      {
        session_key: 6,
        session_name: 'Australian Grand Prix',
        session_type: 'Race',
        date_start: '2026-04-05T05:00:00Z',
      },
    ];

    expect(findMainRaceSession(sessions)?.session_key).toBe(6);
  });

  test('detects the current meeting separately from the last completed one', () => {
    const meetings = [
      {
        meeting_key: 10,
        meeting_name: 'Chinese Grand Prix',
        date_start: '2026-03-13T00:00:00Z',
        date_end: '2026-03-15T16:00:00Z',
      },
      {
        meeting_key: 11,
        meeting_name: 'Japanese Grand Prix',
        date_start: '2026-03-20T00:00:00Z',
        date_end: '2026-03-22T16:00:00Z',
      },
    ];
    const now = new Date('2026-03-21T10:00:00Z');

    expect(findCurrentMeeting(meetings, now)?.meeting_key).toBe(11);
    expect(findLastCompletedMeeting(meetings, now)?.meeting_key).toBe(10);
  });
});
