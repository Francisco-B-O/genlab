import { eventBus } from './EventBus';
import { gameLoop } from '../game/GameLoop';
import { levelLoader } from '../levels/LevelLoader';
import { persistence } from '../utils/persistence';

export class GameEngine {
  private static instance: GameEngine | null = null;
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine();
    }
    return GameEngine.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.info('[GameEngine] Initializing...');

    // Start the render loop
    gameLoop.start();

    // Pre-warm the level cache by loading the first level summary
    const levels = levelLoader.getAvailableLevels();
    console.info(`[GameEngine] ${levels.length} level(s) registered.`);

    this.initialized = true;
    console.info('[GameEngine] Ready.');
  }

  dispose(): void {
    gameLoop.stop();
    eventBus.removeAllListeners();
    this.initialized = false;
  }

  get isInitialized(): boolean {
    return this.initialized;
  }

  getPreferences() {
    return persistence.getPreferences();
  }
}

export const gameEngine = GameEngine.getInstance();
