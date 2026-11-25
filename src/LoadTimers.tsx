import type { TimerConfig } from './storage';

interface LoadTimersProps {
  timers: TimerConfig[];
  onLoad: (timer: TimerConfig) => void;
  onDelete: (timer: TimerConfig) => void;
  onBack: () => void;
}

export function LoadTimers({ timers, onLoad, onDelete, onBack }: LoadTimersProps): preact.JSX.Element {
  const sorted = [...timers].sort((a, b) => a.name.localeCompare(b.name));

  return <div className="load-timers">
    <h2>Saved Timers</h2>
    {sorted.length === 0
      ? <p className="empty">No saved timers yet.</p>
      : <ul>
        {sorted.map(timer => {
          const total = timer.segments.reduce((sum, s) => sum + s.duration, 0);
          return <li key={timer.name}>
            <button className="load-timer" onClick={() => onLoad(timer)}>
              <span className="timer-name">{timer.name}</span>
              <span className="timer-summary">
                {timer.segments.length} {timer.segments.length === 1 ? 'segment' : 'segments'}, {Number(total.toFixed(1))}s
              </span>
            </button>
            <button
              className="delete-timer"
              title={`Delete ${timer.name}`}
              onClick={() => {
                if (confirm(`Delete "${timer.name}"?`)) {
                  onDelete(timer);
                }
              }}
            >
              Delete
            </button>
          </li>;
        })}
      </ul>}
    <div className="controls">
      <button onClick={onBack}>Back</button>
    </div>
  </div>;
}
