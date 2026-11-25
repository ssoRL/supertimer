export type SegmentConfig = {
  name: string;
  duration: number;
};

export type TimerConfig = {
  name: string;
  segments: SegmentConfig[];
  savedAt: number;
};

const STORAGE_KEY = 'supertimer.timers';

function isSegmentConfig(value: unknown): value is SegmentConfig {
  const v = value as SegmentConfig;
  return typeof v === 'object' && v !== null
    && typeof v.name === 'string'
    && typeof v.duration === 'number';
}

function isTimerConfig(value: unknown): value is TimerConfig {
  const v = value as TimerConfig;
  return typeof v === 'object' && v !== null
    && typeof v.name === 'string'
    && typeof v.savedAt === 'number'
    && Array.isArray(v.segments) && v.segments.every(isSegmentConfig);
}

/** All saved timers. Corrupt or unrecognized entries are skipped. */
export function loadTimers(): TimerConfig[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isTimerConfig) : [];
  } catch {
    return [];
  }
}

function writeTimers(timers: TimerConfig[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
}

/** Saves a timer, overwriting any existing timer with the same name. Returns the new list. */
export function saveTimer(name: string, segments: SegmentConfig[]): TimerConfig[] {
  const timer: TimerConfig = { name, segments, savedAt: Date.now() };
  const timers = [...loadTimers().filter(t => t.name !== name), timer];
  writeTimers(timers);
  return timers;
}

/** Deletes the timer with this name. Returns the new list. */
export function deleteTimer(name: string): TimerConfig[] {
  const timers = loadTimers().filter(t => t.name !== name);
  writeTimers(timers);
  return timers;
}
