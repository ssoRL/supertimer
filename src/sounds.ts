import * as Tone from 'tone';

// Tick on whole seconds, tock on half seconds.
const BEAT_SECONDS = 0.5;

let tickSynth: Tone.MembraneSynth | null = null;
let tockSynth: Tone.MembraneSynth | null = null;
let repeatId: number | null = null;

// Short, pitched woodblock-style click.
function makeClick(): Tone.MembraneSynth {
  return new Tone.MembraneSynth({
    pitchDecay: 0.008,
    octaves: 2,
    envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.01 },
    volume: -8,
  }).toDestination();
}

/**
 * Unlocks audio. Must be called from a user gesture (e.g. a click handler)
 * because browsers block audio until the user interacts with the page.
 */
export async function initAudio(): Promise<void> {
  await Tone.start();
  tickSynth ??= makeClick();
  tockSynth ??= makeClick();
}

/**
 * Starts (or resumes) ticking from `fromSeconds` into the run, stopping at
 * `untilSeconds`. Beats are scheduled on the audio clock, so they stay steady
 * even if the main thread stalls or the tab is in the background.
 */
export function startTicking(fromSeconds: number, untilSeconds: number): void {
  const transport = Tone.getTransport();
  if (repeatId === null) {
    repeatId = transport.scheduleRepeat(time => {
      // Use the transport position (not a counter) so tick/tock stays aligned
      // to the elapsed time after pausing and resuming.
      const beat = Math.round(transport.getSecondsAtTime(time) / BEAT_SECONDS);
      if (beat % 2 === 0) {
        tickSynth?.triggerAttackRelease('G5', 0.03, time);
      } else {
        tockSynth?.triggerAttackRelease('D5', 0.03, time);
      }
    }, BEAT_SECONDS, 0, untilSeconds);
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
  if (repeatId !== null) {
    transport.clear(repeatId);
    repeatId = null;
  }
}
