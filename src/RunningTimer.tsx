import { FixedWidthNumber } from './FixedWidthNumber';

interface RunningTimerProps {
  name: string;
  duration: number;
  total: number;
  paused: boolean;
  onTogglePause: () => void;
  onCancel: () => void;
}

export function RunningTimer({ name, duration, total, paused, onTogglePause, onCancel }: RunningTimerProps): preact.JSX.Element {
  return <div className="running-timer">
    <div className="name">{name}</div>
    <div className="progress"><FixedWidthNumber value={duration} /> of {total.toFixed(2)}</div>
    <div className="controls">
      <button onClick={onTogglePause}>{paused ? 'Play' : 'Pause'}</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  </div>;
}
