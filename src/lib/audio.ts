// Web Audio API Sound & BGM Synthesizer for Arcane Academy

let audioCtx: AudioContext | null = null;
let bgmOsc1: OscillatorNode | null = null;
let bgmOsc2: OscillatorNode | null = null;
let bgmGain: GainNode | null = null;
let bgmInterval: NodeJS.Timeout | null = null;
let isBgmPlaying = false;
let isMuted = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function toggleAudioMute(mute?: boolean): boolean {
  if (mute !== undefined) {
    isMuted = mute;
  } else {
    isMuted = !isMuted;
  }

  if (isMuted && bgmGain) {
    bgmGain.gain.setTargetAtTime(0, audioCtx ? audioCtx.currentTime : 0, 0.1);
  } else if (!isMuted && bgmGain) {
    bgmGain.gain.setTargetAtTime(0.08, audioCtx ? audioCtx.currentTime : 0, 0.1);
  }

  return isMuted;
}

export function playSoundFX(type: 'click' | 'spell' | 'levelup' | 'chest' | 'correct' | 'wrong' | 'fanfare', element?: string) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'correct') {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.2, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.2);
      });
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(120, now + 0.25);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'levelup' || type === 'fanfare') {
      const scale = [440, 554.37, 659.25, 880, 1108.73]; // A4, C#5, E5, A5, C#6
      scale.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.25, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.4);
      });
    } else if (type === 'chest') {
      // Arpeggio magic sweep
      const freqs = [300, 400, 500, 600, 750, 900, 1200];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.18, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.15);
      });
    } else if (type === 'spell') {
      const el = element || 'fire';
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (el === 'fire') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.2);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);
      } else if (el === 'water' || el === 'ice') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.35);
      } else if (el === 'wind') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(900, now + 0.2);
      } else if (el === 'earth' || el === 'thunder') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.4);
      } else if (el === 'light') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
      } else {
        // dark / shadow
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.4);
      }

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (e) {
    // Audio Context not ready or user hasn't interacted
  }
}

export function startAmbientBGM(): boolean {
  if (isBgmPlaying) return true;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    bgmGain = ctx.createGain();
    bgmGain.gain.setValueAtTime(isMuted ? 0 : 0.08, now);
    bgmGain.connect(ctx.destination);

    // Chords ambient sequence: Am -> F -> C -> G
    const chords = [
      [220, 261.63, 329.63], // Am
      [174.61, 220, 261.63], // F
      [261.63, 329.63, 392], // C
      [196, 246.94, 293.66], // G
    ];

    let chordIdx = 0;

    const playChord = () => {
      if (!bgmGain) return;
      const cNow = ctx.currentTime;
      const currentChord = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;

      currentChord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, cNow);
        gain.gain.setValueAtTime(0.03, cNow);
        gain.gain.exponentialRampToValueAtTime(0.0001, cNow + 3.8);

        osc.connect(gain);
        gain.connect(bgmGain!);

        osc.start(cNow);
        osc.stop(cNow + 4.0);
      });
    };

    playChord();
    bgmInterval = setInterval(playChord, 4000);
    isBgmPlaying = true;
    return true;
  } catch (e) {
    return false;
  }
}

export function stopAmbientBGM() {
  if (bgmInterval) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
  if (bgmGain) {
    bgmGain.gain.setTargetAtTime(0, audioCtx ? audioCtx.currentTime : 0, 0.1);
  }
  isBgmPlaying = false;
}
