import React from 'react';
import './Skeleton.css';

export default function Skeleton({ width, height, borderRadius, style }) {
  return (
    <div
      className="skeleton"
      style={{
        width: width || '100%',
        height: height || '20px',
        borderRadius: borderRadius || '4px',
        ...style,
      }}
    />
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="skeleton-table">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-row" style={{ animationDelay: `${i * 0.05}s` }}>
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} height="16px" width={j === 0 ? '30px' : undefined} />
          ))}
        </div>
      ))}
    </div>
  );
}
