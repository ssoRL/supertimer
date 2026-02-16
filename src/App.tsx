import { Timer } from "./Timer";
import { useEffect, useState } from 'preact/hooks';

type Progress = {
  timer: number;
  duration: number;
}

export function App(): preact.JSX.Element {
  const [durations, setDurations] = useState<number[]>([4]);
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    if (progress === null) {
      return;
    }

    const startTime = Date.now();
    const timerStarts = durations.reduce<number[]>(
      (starts, duration) => {
        const lastStart = starts.length > 0 ? starts[starts.length - 1] : 0;
        return [...starts, lastStart + duration];
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

  return <div>
    {durations.map((duration, index) => (
      <Timer
        key={index}
        duration={duration}
        setDuration={(newDuration) => {
          const newDurations = [...durations];
          newDurations[index] = newDuration;
          setDurations(newDurations);
        }}
        progress={progress?.timer === index ? progress.duration : null}
        disabled={progress !== null}
      />
    ))}
    <button
      onClick={() => setDurations([...durations, 4])}
    >
      Add Timer
    </button>
    <button
      onClick={() => setProgress({ timer: 0, duration: 0 })}
    >
     Start
    </button>
  </div>;
}
