import React from 'react';
import './TimingCell.css';

// type: 'purple' (overall best), 'green' (personal best), 'yellow' (normal), 'pit'
export default function TimingCell({ value, type = 'yellow' }) {
  return (
    <span className={`timing-cell timing-cell--${type}`}>
      {value || '—'}
    </span>
  );
}
