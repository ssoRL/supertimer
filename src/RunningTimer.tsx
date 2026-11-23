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
  // Round up so the display starts at the full duration and never reads 0.0
  // while time remains.
  const remaining = Math.max(0, Math.ceil((total - duration) * 10) / 10);
  return <div className="running-timer">
    <div className="name">{name}</div>
    <div className="remaining"><FixedWidthNumber value={remaining} decimals={1} /></div>
    <div className="total">of {Number(total.toFixed(1))}</div>
    <div className="controls">
      <button onClick={onTogglePause}>{paused ? 'Play' : 'Pause'}</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  </div>;
}
