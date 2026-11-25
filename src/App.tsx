import { Segment } from "./Segment";
import { RunningTimer } from "./RunningTimer";
import { LoadTimers } from "./LoadTimers";
import { useEffect, useState } from 'preact/hooks';
import { finishTicking, initAudio, pauseTicking, startTicking, stopTicking } from './sounds';
import { deleteTimer, loadTimers, saveTimer, type SegmentConfig } from './storage';
import './App.css';

export function App(): preact.JSX.Element {
  const [timerName, setTimerName] = useState('');
  const [segments, setSegments] = useState<SegmentConfig[]>([{ name: 'Segment 1', duration: 4 }]);
  const [savedTimers, setSavedTimers] = useState(loadTimers);
  const [showingLoad, setShowingLoad] = useState(false);
  // Total seconds elapsed across all segments; null when not running.
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);

  const segmentEnds = segments.reduce<number[]>(
    (ends, segment) => [...ends, (ends.length > 0 ? ends[ends.length - 1] : 0) + segment.duration],
    []
  );
  const totalDuration = segmentEnds.length > 0 ? segmentEnds[segmentEnds.length - 1] : 0;

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
      startTicking(elapsed, segmentEnds);
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

  const trimmedTimerName = timerName.trim();
  const savedMatch = savedTimers.find(timer => timer.name === trimmedTimerName);
  const isSaved = savedMatch !== undefined
    && JSON.stringify(savedMatch.segments) === JSON.stringify(segments);

  const save = () => {
    setTimerName(trimmedTimerName);
    setSavedTimers(saveTimer(trimmedTimerName, segments));
  };

  if (showingLoad) {
    return <div className="app">
      <LoadTimers
        timers={savedTimers}
        onLoad={timer => {
          setTimerName(timer.name);
          setSegments(timer.segments);
          setShowingLoad(false);
        }}
        onDelete={timer => setSavedTimers(deleteTimer(timer.name))}
        onBack={() => setShowingLoad(false)}
      />
    </div>;
  }

  if (elapsed !== null) {
    const segmentIndex = Math.max(0, segmentEnds.findIndex(end => end > elapsed));
    const currentSegment = segments[segmentIndex];
    const segmentElapsed = segmentIndex > 0 ? elapsed - segmentEnds[segmentIndex - 1] : elapsed;
    return <div className="app">
      <RunningTimer
        name={currentSegment.name}
        duration={segmentElapsed}
        total={currentSegment.duration}
        paused={paused}
        onTogglePause={() => setPaused(!paused)}
        onCancel={cancel}
      />
    </div>;
  }

  return <div className="app">
    <input
      className="timer-name-input"
      type="text"
      placeholder="Timer name"
      value={timerName}
      onInput={e => setTimerName(e.currentTarget.value)}
    />
    <div className="segments">
      {segments.map((segment, index) => (
        <Segment
          key={index}
          name={segment.name}
          setName={(newName) => {
            const newSegments = [...segments];
            newSegments[index] = { ...newSegments[index], name: newName };
            setSegments(newSegments);
          }}
          duration={segment.duration}
          setDuration={(newDuration) => {
            const newSegments = [...segments];
            newSegments[index] = { ...newSegments[index], duration: newDuration };
            setSegments(newSegments);
          }}
        />
      ))}
    </div>
    <div className="controls">
      <button
        onClick={() => setSegments([...segments, { name: `Segment ${segments.length + 1}`, duration: 4 }])}
      >
        Add Segment
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
        disabled={trimmedTimerName === '' || isSaved}
        title={trimmedTimerName === '' ? 'Name this timer to save it' : undefined}
      >
        {isSaved ? 'Saved' : 'Save'}
      </button>
      <button
        onClick={() => setShowingLoad(true)}
        disabled={savedTimers.length === 0}
      >
        Load
      </button>
    </div>
  </div>;
}
