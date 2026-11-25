import * as Tone from 'tone';

// Tick on whole seconds, tock on half seconds.
const BEAT_SECONDS = 0.5;
// Number of hollow count beats before each change of segment and before the end.
const COUNT_BEATS = 4;

// Tolerance for comparing float times.
const EPSILON = 1e-6;

let tickSynth: Tone.NoiseSynth | null = null;
let tockSynth: Tone.NoiseSynth | null = null;
let countSynth: Tone.MembraneSynth | null = null;
let chimeSynth: Tone.PolySynth<Tone.FMSynth> | null = null;
let gongSynth: Tone.FMSynth | null = null;
let eventIds: number[] = [];
let gongPlayed = false;

// Crisp mechanical clock click: a very short burst of white noise through a
// resonant band-pass filter. The filter frequency sets the "pitch" of the
// click, so tick and tock differ by center frequency.
function makeClick(frequency: number): Tone.NoiseSynth {
  const filter = new Tone.Filter({ type: 'bandpass', frequency, Q: 6 }).toDestination();
  return new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.0005, decay: 0.015, sustain: 0, release: 0.005 },
    volume: 0,
  }).connect(filter);
}

// Short, hollow woodblock-style knock used to count in.
function makeCount(): Tone.MembraneSynth {
  return new Tone.MembraneSynth({
    pitchDecay: 0.008,
    octaves: 2,
    envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.01 },
    volume: -8,
  }).toDestination();
}

// Bell-like chime: FM with a slightly detuned non-integer ratio gives the
// inharmonic partials of a struck bell; the modulation decays faster than the
// tone so the strike is bright and the tail is pure.
function makeChime(): Tone.PolySynth<Tone.FMSynth> {
  return new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 3.01,
    modulationIndex: 12,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 2, sustain: 0, release: 2 },
    modulation: { type: 'sine' },
    modulationEnvelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.4 },
    volume: -14,
  }).toDestination();
}

// Gong: low FM tone with an inharmonic ratio. The modulation swells in after
// the strike and then fades, giving the characteristic bloom of a gong.
function makeGong(): Tone.FMSynth {
  return new Tone.FMSynth({
    harmonicity: 1.41,
    modulationIndex: 18,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.005, decay: 7, sustain: 0, release: 7 },
    modulation: { type: 'sine' },
    modulationEnvelope: { attack: 0.4, decay: 5, sustain: 0, release: 5 },
    volume: -4,
  }).toDestination();
}

function playGong(time?: number): void {
  gongPlayed = true;
  gongSynth?.triggerAttackRelease('A2', 1, time);
}

/**
 * Unlocks audio. Must be called from a user gesture (e.g. a click handler)
 * because browsers block audio until the user interacts with the page.
 */
export async function initAudio(): Promise<void> {
  await Tone.start();
  tickSynth ??= makeClick(4200);
  tockSynth ??= makeClick(2800);
  countSynth ??= makeCount();
  chimeSynth ??= makeChime();
  gongSynth ??= makeGong();
}

type SoundEvent = { time: number; play: (time: number) => void };

/**
 * Builds every sound for a run, in run time (seconds from the start of the
 * first segment). Before each change from one segment to the next, and before the
 * final end, there are four hollow count beats; each change gets a chime and
 * the final end gets a gong. Ticks play throughout, aligned to the start of
 * the current segment, layered with the other sounds.
 */
function buildEvents(segmentEnds: number[]): SoundEvent[] {
  // Distinct boundaries: each segment start plus the final end. Zero-length
  // segments collapse into their neighbours.
  const boundaries: number[] = [];
  for (const b of [0, ...segmentEnds]) {
    if (boundaries.length === 0 || b > boundaries[boundaries.length - 1] + EPSILON) {
      boundaries.push(b);
    }
  }

  const events: SoundEvent[] = [];
  boundaries.forEach((boundary, i) => {
    // The very start of the run is silent; every later boundary is counted in.
    if (i > 0) {
      // Count beats, kept within the previous segment so they never collide
      // with its start chime.
      for (let beat = COUNT_BEATS; beat >= 1; beat--) {
        const time = boundary - beat * BEAT_SECONDS;
        if (time > boundaries[i - 1] + EPSILON) {
          events.push({ time, play: t => countSynth?.triggerAttackRelease('D5', 0.03, t) });
        }
      }

      if (i === boundaries.length - 1) {
        events.push({ time: boundary, play: t => playGong(t) });
        return;
      }
      events.push({ time: boundary, play: t => chimeSynth?.triggerAttackRelease(['C6', 'G6'], 0.5, t) });
    }

    // Ticks run through the whole segment, alongside the count beats and
    // chime. They stop before the next boundary, so the gong plays alone.
    const next = boundaries[i + 1];
    if (next === undefined) {
      return;
    }
    for (let beat = 0; ; beat++) {
      const time = boundary + beat * BEAT_SECONDS;
      if (time > next - EPSILON) {
        break;
      }
      const synth = beat % 2 === 0 ? tickSynth : tockSynth;
      events.push({ time, play: t => synth?.triggerAttackRelease(0.005, t) });
    }
  });
  return events;
}

/**
 * Starts (or resumes) the run's sounds from `fromSeconds` of run time.
 * `segmentEnds` are the cumulative end
 * times of each segment. Sounds are scheduled on the audio clock, so they stay
 * steady even if the main thread stalls or the tab is in the background.
 */
export function startTicking(fromSeconds: number, segmentEnds: number[]): void {
  const transport = Tone.getTransport();
  if (eventIds.length === 0) {
    gongPlayed = false;
    eventIds = buildEvents(segmentEnds).map(({ time, play }) => transport.schedule(play, time));
  }
  transport.seconds = fromSeconds;
  transport.start();
}

export function pauseTicking(): void {
  Tone.getTransport().pause();
}

export function stopTicking(): void {
  const transport = Tone.getTransport();
  transport.stop();
  for (const id of eventIds) {
    transport.clear(id);
  }
  eventIds = [];
}

/**
 * Ends a run that completed naturally. Normally the gong was already
 * scheduled on the audio clock; if the UI clock got there first, sound it
 * now so stopping the transport can't swallow it.
 */
export function finishTicking(): void {
  if (!gongPlayed) {
    playGong();
  }
  stopTicking();
}
