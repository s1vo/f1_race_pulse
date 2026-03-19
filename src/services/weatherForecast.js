import axios from 'axios';

const FORECAST_API = axios.create({
  baseURL: 'https://api.open-meteo.com/v1',
  timeout: 10000,
});

const WMO_CODES = {
  0: 'clear',
  1: 'mainly_clear',
  2: 'partly_cloudy',
  3: 'overcast',
  45: 'fog',
  48: 'fog',
  51: 'drizzle',
  53: 'drizzle',
  55: 'drizzle',
  61: 'rain',
  63: 'rain',
  65: 'rain',
  71: 'snow',
  73: 'snow',
  75: 'snow',
  80: 'rain_showers',
  81: 'rain_showers',
  82: 'rain_showers',
  85: 'snow_showers',
  86: 'snow_showers',
  95: 'thunderstorm',
  96: 'thunderstorm',
  99: 'thunderstorm',
};

export function getWeatherIcon(code) {
  const cond = WMO_CODES[code] || 'unknown';
  switch (cond) {
    case 'clear': return '\u2600';
    case 'mainly_clear': return '\u2600';
    case 'partly_cloudy': return '\u26C5';
    case 'overcast': return '\u2601';
    case 'fog': return '\u{1F32B}';
    case 'drizzle': return '\u{1F4A7}';
    case 'rain': return '\u{1F327}';
    case 'snow': return '\u2744';
    case 'rain_showers': return '\u{1F326}';
    case 'snow_showers': return '\u{1F328}';
    case 'thunderstorm': return '\u26C8';
    default: return '\u2601';
  }
}

export function getWeatherCondition(code) {
  const cond = WMO_CODES[code] || 'unknown';
  switch (cond) {
    case 'clear': return 'clear';
    case 'mainly_clear': return 'mostly_clear';
    case 'partly_cloudy': return 'partly_cloudy';
    case 'overcast': return 'cloudy';
    case 'fog': return 'fog';
    case 'drizzle': return 'drizzle';
    case 'rain': return 'rain';
    case 'snow': return 'snow';
    case 'rain_showers': return 'showers';
    case 'snow_showers': return 'snow_showers';
    case 'thunderstorm': return 'thunderstorm';
    default: return 'unknown';
  }
}

function getNearestTimeIndex(times = [], targetTimeMs) {
  if (!Array.isArray(times) || times.length === 0 || !Number.isFinite(targetTimeMs)) {
    return -1;
  }

  let closestIndex = -1;
  let closestDiff = Number.POSITIVE_INFINITY;

  times.forEach((time, index) => {
    const diff = Math.abs(time - targetTimeMs);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestIndex = index;
    }
  });

  return closestIndex;
}

function normalizeNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

async function requestForecast(lat, lon, includeSurfaceTemperature, signal) {
  const hourlyFields = [
    'temperature_2m',
    'relative_humidity_2m',
    'wind_speed_10m',
    'weather_code',
  ];

  if (includeSurfaceTemperature) {
    hourlyFields.push('surface_temperature');
  }

  const { data } = await FORECAST_API.get('/forecast', {
    params: {
      latitude: lat,
      longitude: lon,
      hourly: hourlyFields.join(','),
      forecast_days: 16,
      wind_speed_unit: 'kmh',
      temperature_unit: 'celsius',
      timeformat: 'unixtime',
    },
    signal,
  });

  return data;
}

export async function getForecast(lat, lon, targetDate, signal) {
  try {
    let data;

    try {
      data = await requestForecast(lat, lon, true, signal);
    } catch (err) {
      if (err.response?.status !== 400) {
        throw err;
      }
      data = await requestForecast(lat, lon, false, signal);
    }

    const targetTimeMs = targetDate ? new Date(targetDate).getTime() : Date.now();
    const hourly = data.hourly;
    const hourlyTimes = (hourly?.time || []).map(time => Number(time) * 1000);
    const targetIdx = getNearestTimeIndex(hourlyTimes, targetTimeMs);

    if (targetIdx < 0) {
      return null;
    }

    const nearestTimeMs = hourlyTimes[targetIdx];
    const maxAllowedDiff = 18 * 60 * 60 * 1000;
    if (Math.abs(nearestTimeMs - targetTimeMs) > maxAllowedDiff) {
      return null;
    }

    return {
      air_temperature: normalizeNumber(hourly.temperature_2m?.[targetIdx]),
      track_temperature: normalizeNumber(hourly.surface_temperature?.[targetIdx]),
      humidity: normalizeNumber(hourly.relative_humidity_2m?.[targetIdx]),
      wind_speed: normalizeNumber(hourly.wind_speed_10m?.[targetIdx]),
      weather_code: normalizeNumber(hourly.weather_code?.[targetIdx]),
      source: 'forecast',
      date: new Date(nearestTimeMs).toISOString(),
    };
  } catch (err) {
    if (err.code === 'ERR_CANCELED' || err.name === 'CanceledError') {
      throw err;
    }
    console.error('Forecast API error:', err.message);
    throw err;
  }
}
