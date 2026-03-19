function normalizeWhitespace(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

export function formatBroadcastName(name = '') {
  const normalized = normalizeWhitespace(name);
  if (!normalized) return '';

  const [firstToken, ...rest] = normalized.split(' ');
  const initial = firstToken.replace(/\./g, '');

  if (initial.length === 1 && rest.length > 0) {
    return `${initial.toUpperCase()}. ${rest.join(' ')}`;
  }

  return normalized;
}

export function formatDriverDisplayName(driver = {}) {
  const broadcastName = formatBroadcastName(driver.broadcast_name);
  if (broadcastName) return broadcastName;

  const firstName = normalizeWhitespace(driver.first_name);
  const lastName = normalizeWhitespace(driver.last_name);
  if (firstName && lastName) {
    return `${firstName[0].toUpperCase()}. ${lastName.toUpperCase()}`;
  }

  return driver.driver_number != null ? `#${driver.driver_number}` : '—';
}
