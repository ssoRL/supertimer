import { Timer } from "./Timer";
import { RunningTimer } from "./RunningTimer";
import { useEffect, useState } from 'preact/hooks';
import './App.css';

type Progress = {
  timer: number;
  duration: number;
}

type TimerConfig = {
  name: string;
  duration: number;
}

export function App(): preact.JSX.Element {
  const [timers, setTimers] = useState<TimerConfig[]>([{ name: 'Timer 1', duration: 4 }]);
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    if (progress === null) {
      return;
    }

    const startTime = Date.now();
    const timerStarts = timers.reduce<number[]>(
      (starts, timer) => {
        const lastStart = starts.length > 0 ? starts[starts.length - 1] : 0;
        return [...starts, lastStart + timer.duration];
      },
      []
    );
    const timer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const currentTimer = timerStarts.findIndex(start => start > elapsed);
      if (currentTimer === -1) {
        clearInterval(timer);
        setProgress(null);
      } else {
        setProgress({ timer: currentTimer, duration: currentTimer > 0 ? elapsed - timerStarts[currentTimer - 1] : elapsed });
      }
    }, 5);
    return () => clearInterval(timer);
  }, [progress == null]);

  if (progress !== null) {
    const currentTimer = timers[progress.timer];
    return <div className="app">
      <RunningTimer
        name={currentTimer.name}
        duration={progress.duration}
        total={currentTimer.duration}
      />
    </div>;
  }

  return <div className="app">
    <div className="timers">
      {timers.map((timer, index) => (
        <Timer
          key={index}
          name={timer.name}
          setName={(newName) => {
            const newTimers = [...timers];
            newTimers[index] = { ...newTimers[index], name: newName };
            setTimers(newTimers);
          }}
          duration={timer.duration}
          setDuration={(newDuration) => {
            const newTimers = [...timers];
            newTimers[index] = { ...newTimers[index], duration: newDuration };
            setTimers(newTimers);
          }}
        />
      ))}
    </div>
    <div className="controls">
      <button
        onClick={() => setTimers([...timers, { name: `Timer ${timers.length + 1}`, duration: 4 }])}
      >
        Add Timer
      </button>
      <button
        onClick={() => setProgress({ timer: 0, duration: 0 })}
      >
      Start
      </button>
    </div>
  </div>;
}
