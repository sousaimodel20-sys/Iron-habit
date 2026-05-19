const MilestoneBadge = ({ title, achieved }: { title: string; achieved: boolean }) => (
  <div className={`milestone ${achieved ? 'achieved' : ''}`}>
    <span>{achieved ? '✓' : '○'}</span>
    <strong>{title}</strong>
  </div>
);

export default MilestoneBadge;
