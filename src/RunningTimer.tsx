interface RunningTimerProps {
  name: string;
  duration: number;
  total: number;
}

export function RunningTimer({ name, duration, total }: RunningTimerProps): preact.JSX.Element {
  return <div className="running-timer">
    <div className="name">{name}</div>
    <div className="progress">{duration.toFixed(2)} of {total.toFixed(2)}</div>
  </div>;
}
