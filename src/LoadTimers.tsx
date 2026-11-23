import type { TimerSet } from './storage';

interface LoadTimersProps {
  timerSets: TimerSet[];
  onLoad: (set: TimerSet) => void;
  onDelete: (set: TimerSet) => void;
  onBack: () => void;
}

export function LoadTimers({ timerSets, onLoad, onDelete, onBack }: LoadTimersProps): preact.JSX.Element {
  const sorted = [...timerSets].sort((a, b) => a.name.localeCompare(b.name));

  return <div className="load-timers">
    <h2>Saved Timers</h2>
    {sorted.length === 0
      ? <p className="empty">No saved timers yet.</p>
      : <ul>
        {sorted.map(set => {
          const total = set.timers.reduce((sum, t) => sum + t.duration, 0);
          return <li key={set.name}>
            <button className="load-set" onClick={() => onLoad(set)}>
              <span className="set-name">{set.name}</span>
              <span className="set-summary">
                {set.timers.length} {set.timers.length === 1 ? 'timer' : 'timers'}, {Number(total.toFixed(1))}s
              </span>
            </button>
            <button
              className="delete-set"
              title={`Delete ${set.name}`}
              onClick={() => {
                if (confirm(`Delete "${set.name}"?`)) {
                  onDelete(set);
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
