export type TimerConfig = {
  name: string;
  duration: number;
};

export type TimerSet = {
  name: string;
  timers: TimerConfig[];
  savedAt: number;
};

const STORAGE_KEY = 'supertimer.timerSets';

function isTimerConfig(value: unknown): value is TimerConfig {
  const v = value as TimerConfig;
  return typeof v === 'object' && v !== null
    && typeof v.name === 'string'
    && typeof v.duration === 'number';
}

function isTimerSet(value: unknown): value is TimerSet {
  const v = value as TimerSet;
  return typeof v === 'object' && v !== null
    && typeof v.name === 'string'
    && typeof v.savedAt === 'number'
    && Array.isArray(v.timers) && v.timers.every(isTimerConfig);
}

/** All saved timer sets. Corrupt or unrecognized entries are skipped. */
export function loadTimerSets(): TimerSet[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isTimerSet) : [];
  } catch {
    return [];
  }
}

function writeTimerSets(sets: TimerSet[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
}

/** Saves a set, overwriting any existing set with the same name. Returns the new list. */
export function saveTimerSet(name: string, timers: TimerConfig[]): TimerSet[] {
  const set: TimerSet = { name, timers, savedAt: Date.now() };
  const sets = [...loadTimerSets().filter(s => s.name !== name), set];
  writeTimerSets(sets);
  return sets;
}

/** Deletes the set with this name. Returns the new list. */
export function deleteTimerSet(name: string): TimerSet[] {
  const sets = loadTimerSets().filter(s => s.name !== name);
  writeTimerSets(sets);
  return sets;
}
