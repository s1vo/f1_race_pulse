import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { getTeamColor } from '../../utils/teams';
import { formatGap } from '../../utils/time';
import TimingCell from '../common/TimingCell';
import { SkeletonTable } from '../common/Skeleton';
import './LiveTiming.css';

export default function LiveTiming({ positions, intervals, drivers, loading, compact }) {
  const { t } = useAppContext();

  if (loading) return <SkeletonTable rows={compact ? 5 : 20} cols={5} />;

  const displayPositions = compact ? positions.slice(0, 5) : positions;

  const driverMap = {};
  (drivers || []).forEach(d => {
    driverMap[d.driver_number] = d;
  });

  return (
    <div className="live-timing">
      <div className="live-timing__header-row">
        <span className="live-timing__col live-timing__col--pos">{t('live_p')}</span>
        <span className="live-timing__col live-timing__col--driver">{t('live_driver')}</span>
        <span className="live-timing__col live-timing__col--gap">{t('live_gap')}</span>
        <span className="live-timing__col live-timing__col--lap">{t('live_last_lap')}</span>
      </div>

      <div className="live-timing__body">
        {displayPositions.map((pos, idx) => {
          const driver = driverMap[pos.driver_number] || {};
          const teamColor = getTeamColor(driver.team_name);
          const interval = intervals[pos.driver_number];
          const isPit = interval?.gap_to_leader === null && pos.position > 1;

          return (
            <div
              key={pos.driver_number}
              className="live-timing__row"
              style={{
                '--team-color': teamColor,
                animationDelay: `${idx * 0.03}s`,
              }}
            >
              <span className="live-timing__col live-timing__col--pos">
                {pos.position}
              </span>
              <span className="live-timing__col live-timing__col--driver">
                <span
                  className="live-timing__team-bar"
                  style={{ backgroundColor: teamColor }}
                />
                <span className="live-timing__name">
                  {driver.name_acronym || `#${pos.driver_number}`}
                </span>
              </span>
              <span className="live-timing__col live-timing__col--gap">
                {isPit ? (
                  <TimingCell value={t('live_in_pit')} type="pit" />
                ) : (
                  formatGap(interval?.gap_to_leader)
                )}
              </span>
              <span className="live-timing__col live-timing__col--lap">
                <TimingCell
                  value={interval?.interval != null ? formatGap(interval.interval) : '\u2014'}
                  type="yellow"
                />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
