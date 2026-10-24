/**
 * GameLoop — manages frame-based updates for animations.
 * Used by the rendering layer; not required for puzzle logic.
 */

export type TickCallback = (deltaMs: number, totalMs: number) => void;

export class GameLoop {
  private callbacks: Set<TickCallback> = new Set();
  private rafId: number | null = null;
  private lastTimestamp: number = 0;
  private totalElapsed: number = 0;
  private _isRunning: boolean = false;

  start(): void {
    if (this._isRunning) return;
    this._isRunning = true;
    this.lastTimestamp = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this._isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  get isRunning(): boolean {
    return this._isRunning;
  }

  subscribe(callback: TickCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  private tick = (timestamp: number): void => {
    if (!this._isRunning) return;

    const deltaMs = timestamp - this.lastTimestamp;
    this.totalElapsed += deltaMs;
    this.lastTimestamp = timestamp;

    this.callbacks.forEach(cb => cb(deltaMs, this.totalElapsed));

    this.rafId = requestAnimationFrame(this.tick);
  };
}

// Singleton game loop instance
export const gameLoop = new GameLoop();
