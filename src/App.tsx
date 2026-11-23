import { Timer } from "./Timer";
import { RunningTimer } from "./RunningTimer";
import { LoadTimers } from "./LoadTimers";
import { useEffect, useState } from 'preact/hooks';
import { finishTicking, initAudio, pauseTicking, startTicking, stopTicking } from './sounds';
import { deleteTimerSet, loadTimerSets, saveTimerSet, type TimerConfig } from './storage';
import './App.css';

export function App(): preact.JSX.Element {
  const [setName, setSetName] = useState('');
  const [timers, setTimers] = useState<TimerConfig[]>([{ name: 'Timer 1', duration: 4 }]);
  const [savedSets, setSavedSets] = useState(loadTimerSets);
  const [showingLoad, setShowingLoad] = useState(false);
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
        finishTicking();
        setElapsed(null);
      } else {
        // Preact runs effect cleanups after paint, so this interval can still
        // fire after Cancel; don't resurrect a cancelled run.
        setElapsed(prev => prev === null ? null : newElapsed);
      }
    }, 5);
    return () => clearInterval(interval);
  }, [elapsed === null, paused]);

  // Drive the sounds from run state; the beats themselves live on the audio clock.
  useEffect(() => {
    if (elapsed === null) {
      stopTicking();
    } else if (paused) {
      pauseTicking();
    } else {
      startTicking(elapsed, timerEnds);
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

  const trimmedSetName = setName.trim();
  const savedMatch = savedSets.find(set => set.name === trimmedSetName);
  const isSaved = savedMatch !== undefined
    && JSON.stringify(savedMatch.timers) === JSON.stringify(timers);

  const save = () => {
    setSetName(trimmedSetName);
    setSavedSets(saveTimerSet(trimmedSetName, timers));
  };

  if (showingLoad) {
    return <div className="app">
      <LoadTimers
        timerSets={savedSets}
        onLoad={set => {
          setSetName(set.name);
          setTimers(set.timers);
          setShowingLoad(false);
        }}
        onDelete={set => setSavedSets(deleteTimerSet(set.name))}
        onBack={() => setShowingLoad(false)}
      />
    </div>;
  }

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
    <input
      className="set-name-input"
      type="text"
      placeholder="Timer set name"
      value={setName}
      onInput={e => setSetName(e.currentTarget.value)}
    />
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
    <div className="controls">
      <button
        onClick={save}
        disabled={trimmedSetName === '' || isSaved}
        title={trimmedSetName === '' ? 'Name this timer set to save it' : undefined}
      >
        {isSaved ? 'Saved' : 'Save'}
      </button>
      <button
        onClick={() => setShowingLoad(true)}
        disabled={savedSets.length === 0}
      >
        Load
      </button>
    </div>
  </div>;
}
