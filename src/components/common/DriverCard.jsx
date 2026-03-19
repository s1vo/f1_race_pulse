import React from 'react';
import { getTeamColor } from '../../utils/teams';
import { formatDriverNumber } from '../../utils/time';
import './DriverCard.css';

export default function DriverCard({ position, driver, team, points, gap, onClick }) {
  const teamColor = getTeamColor(team);

  return (
    <div className="driver-card" onClick={onClick} style={{ '--team-color': teamColor }}>
      <div className="driver-card__position">
        {formatDriverNumber(position)}
      </div>
      <div className="driver-card__color-bar" style={{ backgroundColor: teamColor }} />
      <div className="driver-card__info">
        <span className="driver-card__team">{team}</span>
        <span className="driver-card__name">{driver}</span>
        {gap && <span className="driver-card__gap">{gap}</span>}
      </div>
      {points !== undefined && (
        <div className="driver-card__points">
          <span className="driver-card__pts-value">{points}</span>
          <span className="driver-card__pts-label">PTS</span>
        </div>
      )}
    </div>
  );
}
