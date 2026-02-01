import { Timer } from "./Timer";
import { useState } from 'preact/hooks';

export function App(): preact.JSX.Element {
  const [durations, setDurations] = useState<number[]>([10]);

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
        remainder={null}
      />
    ))}
    <button
      onClick={() => setDurations([...durations, 10])}
    >
      Add Timer
    </button>
  </div>;
}
