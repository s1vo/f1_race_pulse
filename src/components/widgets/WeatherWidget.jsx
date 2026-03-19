import React, { useState, useEffect } from 'react';
import { getWeather } from '../../services/openf1';
import { getForecast, getWeatherCondition, getWeatherIcon } from '../../services/weatherForecast';
import { getCircuitCoords } from '../../utils/circuitCoords';
import { useAppContext } from '../../context/AppContext';
import Skeleton from '../common/Skeleton';
import './WeatherWidget.css';

function isAvailable(val) {
  return val !== null && val !== undefined && val !== '' && !Number.isNaN(Number(val));
}

function renderVal(val, unit, decimals) {
  if (!isAvailable(val)) return '\u2014';
  const rounded = Number.isInteger(decimals) ? Number(val).toFixed(decimals) : Math.round(val);
  return `${rounded}${unit}`;
}

function getLatestWeatherSample(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return [...items].sort((a, b) => new Date(a.date) - new Date(b.date))[items.length - 1] || null;
}

function getWeatherConditionLabel(weather, t) {
  if (!weather) return t('weather_no_data');
  if (isAvailable(weather.rainfall) && Number(weather.rainfall) > 0) {
    return t('weather_condition_rain');
  }
  if (!isAvailable(weather.weather_code)) {
    return t('weather_condition_clear');
  }

  const conditionKey = getWeatherCondition(weather.weather_code);
  return t(`weather_condition_${conditionKey}`);
}

export default function WeatherWidget({ sessionKey, location, country, meetingName, targetDate }) {
  const { t } = useAppContext();
  const [weather, setWeather] = useState(null);
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();

    async function load() {
      setLoading(true);
      setStatus('loading');
      setWeather(null);
      setSource(null);

      if (sessionKey) {
        try {
          const liveData = await getWeather(sessionKey);
          if (cancelled) return;

          const latest = getLatestWeatherSample(liveData);
          const hasLiveData = latest && (
            isAvailable(latest.air_temperature) ||
            isAvailable(latest.track_temperature) ||
            isAvailable(latest.humidity) ||
            isAvailable(latest.wind_speed)
          );

          if (hasLiveData) {
            setWeather(latest);
            setSource('live');
            setStatus('ready');
            setLoading(false);
            return;
          }
        } catch (_) {}
      }

      if (cancelled) return;

      const coords = getCircuitCoords(location, country, meetingName);
      if (!coords) {
        if (!cancelled) {
          setStatus('no-data');
          setLoading(false);
        }
        return;
      }

      const forecastTargetDate = sessionKey ? new Date().toISOString() : targetDate;

      try {
        const fc = await getForecast(coords.lat, coords.lon, forecastTargetDate, abortController.signal);
        if (cancelled) return;

        if (fc) {
          setWeather(fc);
          setSource('forecast');
          setStatus('ready');
        } else {
          setStatus('no-data');
        }
      } catch (_) {
        if (!cancelled) setStatus('error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [country, location, meetingName, sessionKey, targetDate]);

  if (loading) {
    return (
      <div className="weather-widget">
        <Skeleton height="220px" borderRadius="12px" />
      </div>
    );
  }

  if (status !== 'ready' || !weather) {
    return (
      <div className="weather-widget">
        <div className="weather-widget__header">
          <span className="weather-widget__label">{t('weather_upcoming')}</span>
        </div>
        <div className="weather-widget__location">{location || t('weather_circuit')}</div>
        <div className="weather-widget__no-data">
          {status === 'error' ? t('weather_error') : t('weather_no_data')}
        </div>
      </div>
    );
  }

  const icon = weather.weather_code != null
    ? getWeatherIcon(weather.weather_code)
    : (weather.rainfall ? '\u{1F327}' : '\u2600');
  const condition = getWeatherConditionLabel(weather, t);

  const airTemp = weather.air_temperature;
  const trackTemp = weather.track_temperature;
  const humidity = weather.humidity;
  const windSpeed = weather.wind_speed;

  return (
    <div className="weather-widget">
      <div className="weather-widget__header">
        <span className="weather-widget__label">{t('weather_upcoming')}</span>
        <span className="weather-widget__icon">{icon}</span>
      </div>
      <div className="weather-widget__location">{location || t('weather_circuit')}</div>
      <div className="weather-widget__status-row">
        <span className="weather-widget__condition">{condition}</span>
        <span className={`weather-widget__source weather-widget__source--${source || 'unknown'}`}>
          {source === 'live' ? t('weather_source_live') : t('weather_source_forecast')}
        </span>
      </div>
      <div className="weather-widget__temps">
        <div className="weather-widget__temp">
          <span className="weather-widget__temp-value">
            {renderVal(airTemp, '\u00B0', 0)}
          </span>
          <span className="weather-widget__temp-unit">C</span>
          <span className="weather-widget__temp-label">{t('weather_ambient')}</span>
        </div>
        <div className="weather-widget__temp">
          <span className="weather-widget__temp-value">
            {renderVal(trackTemp, '\u00B0', 0)}
          </span>
          <span className="weather-widget__temp-unit">C</span>
          <span className="weather-widget__temp-label">{t('weather_track')}</span>
        </div>
      </div>
      <div className="weather-widget__extra">
        <span>{t('weather_humidity')}: {renderVal(humidity, '%', 0)}</span>
        <span>{t('weather_wind')}: {renderVal(windSpeed, ' km/h', 0)}</span>
      </div>
    </div>
  );
}
