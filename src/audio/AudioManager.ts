/**
 * AudioManager — handles game audio via the Web Audio API.
 * Sounds are generated programmatically using oscillators (no external files needed).
 */

export type SoundId =
  | 'connection_correct'
  | 'connection_wrong'
  | 'hint_used'
  | 'simulation_start'
  | 'simulation_step'
  | 'level_complete'
  | 'node_hover'
  | 'node_select';

export class AudioManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private masterGain: GainNode | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.4;
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainValue: number = 0.3
  ): void {
    if (!this.enabled) return;

    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(gainValue, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context may be unavailable in some environments
    }
  }

  play(soundId: SoundId): void {
    switch (soundId) {
      case 'connection_correct':
        this.playTone(440, 0.15);
        setTimeout(() => this.playTone(660, 0.2), 120);
        break;
      case 'connection_wrong':
        this.playTone(200, 0.3, 'sawtooth', 0.2);
        break;
      case 'hint_used':
        this.playTone(330, 0.2, 'triangle');
        break;
      case 'simulation_start':
        [220, 330, 440, 550].forEach((f, i) =>
          setTimeout(() => this.playTone(f, 0.3, 'sine', 0.25), i * 100)
        );
        break;
      case 'simulation_step':
        this.playTone(550, 0.1, 'sine', 0.15);
        break;
      case 'level_complete':
        [440, 550, 660, 880].forEach((f, i) =>
          setTimeout(() => this.playTone(f, 0.5, 'sine', 0.3), i * 150)
        );
        break;
      case 'node_hover':
        this.playTone(880, 0.06, 'sine', 0.08);
        break;
      case 'node_select':
        this.playTone(440, 0.1, 'sine', 0.2);
        break;
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (this.masterGain) {
      this.masterGain.gain.value = enabled ? 0.4 : 0;
    }
  }

  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume)) * 0.4;
    }
  }

  dispose(): void {
    this.ctx?.close();
    this.ctx = null;
    this.masterGain = null;
  }
}

export const audioManager = new AudioManager();
