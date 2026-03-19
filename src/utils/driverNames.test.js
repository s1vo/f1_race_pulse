import { formatBroadcastName, formatDriverDisplayName } from './driverNames';

describe('driverNames', () => {
  test('adds a period after the first-name initial in broadcast names', () => {
    expect(formatBroadcastName('K ANTONELLI')).toBe('K. ANTONELLI');
  });

  test('preserves broadcast names that already include a period', () => {
    expect(formatBroadcastName('G. RUSSELL')).toBe('G. RUSSELL');
  });

  test('falls back to first initial and uppercased surname', () => {
    expect(formatDriverDisplayName({ first_name: 'Charles', last_name: 'Leclerc' })).toBe('C. LECLERC');
  });
});
