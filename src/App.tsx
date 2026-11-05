import { Timer } from "./Timer";
import { RunningTimer } from "./RunningTimer";
import { useEffect, useState } from 'preact/hooks';
import { initAudio, pauseTicking, startTicking, stopTicking } from './sounds';
import './App.css';

type TimerConfig = {
  name: string;
  duration: number;
}

export function App(): preact.JSX.Element {
  const [timers, setTimers] = useState<TimerConfig[]>([{ name: 'Timer 1', duration: 4 }]);
  // Total seconds elapsed across all timers; null when not running.
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);

  const timerEnds = timers.reduce<number[]>(
    (ends, timer) => [...ends, (ends.length > 0 ? ends[ends.length - 1] : 0) + timer.duration],
    []
  );
  const totalDuration = timerEnds.length > 0 ? timerEnds[timerEnds.length - 1] : 0;

  useEffect(() => {
    if (elapsed === null || paused) {
      return;
    }

    // Resume from wherever we left off.
    const startTime = Date.now() - elapsed * 1000;
    const interval = setInterval(() => {
      const newElapsed = (Date.now() - startTime) / 1000;
      if (newElapsed >= totalDuration) {
        clearInterval(interval);
        setElapsed(null);
      } else {
        // Preact runs effect cleanups after paint, so this interval can still
        // fire after Cancel; don't resurrect a cancelled run.
        setElapsed(prev => prev === null ? null : newElapsed);
      }
    }, 5);
    return () => clearInterval(interval);
  }, [elapsed === null, paused]);

  // Drive the tick/tock from run state; the beats themselves live on the audio clock.
  useEffect(() => {
    if (elapsed === null) {
      stopTicking();
    } else if (paused) {
      pauseTicking();
    } else {
      startTicking(elapsed, totalDuration);
    }
  }, [elapsed === null, paused]);

  useEffect(() => stopTicking, []);

  const start = async () => {
    // Must run inside the click handler so the browser allows audio.
    await initAudio();
    setPaused(false);
    setElapsed(0);
  };

  const cancel = () => {
    setPaused(false);
    setElapsed(null);
  };

  if (elapsed !== null) {
    const timerIndex = Math.max(0, timerEnds.findIndex(end => end > elapsed));
    const currentTimer = timers[timerIndex];
    const timerElapsed = timerIndex > 0 ? elapsed - timerEnds[timerIndex - 1] : elapsed;
    return <div className="app">
      <RunningTimer
        name={currentTimer.name}
        duration={timerElapsed}
        total={currentTimer.duration}
        paused={paused}
        onTogglePause={() => setPaused(!paused)}
        onCancel={cancel}
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
        onClick={start}
      >
      Start
      </button>
    </div>
  </div>;
}
