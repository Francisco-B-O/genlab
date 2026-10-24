import { create } from 'zustand';
import { useGameStore } from '../game/GameStore';
import { persistence } from '../utils/persistence';
import { findScene, type Scene } from './chapters';

export type Stage = 'before' | 'after';

/**
 * Where the player is in the story. The map is shown when `sceneId` is null; a scene is
 * told one beat at a time (a beat is a line of dialogue, plus a last card with the tool the
 * scene hands over). `activeSceneId` remembers which scene the level in play belongs to.
 */
interface StoryState {
  sceneId: string | null;
  stage: Stage;
  beat: number;
  activeSceneId: string | null;

  openScene: (sceneId: string) => void;
  advance: () => void;
  skip: () => void;
  /** After a story level: tell what happens next. */
  resume: () => void;
  /** Leave a story level for the map without finishing the scene. */
  leaveToMap: () => void;
}

/** Number of beats of a scene stage. */
export function beatCount(scene: Scene, stage: Stage): number {
  return stage === 'before' ? scene.before.length + (scene.tool ? 1 : 0) : scene.after.length;
}

export const useStoryStore = create<StoryState>()((set, get) => {
  const finishStage = () => {
    const { sceneId, stage } = get();
    const scene = sceneId ? findScene(sceneId) : undefined;
    if (scene && stage === 'before' && scene.level) {
      // Off to the level: the scene continues when it is completed
      set({ sceneId: null, activeSceneId: scene.id });
      void useGameStore.getState().loadLevel(scene.level);
    } else {
      set({ sceneId: null, activeSceneId: null });
    }
  };

  return {
    sceneId: null,
    stage: 'before',
    beat: 0,
    activeSceneId: null,

    openScene: (sceneId) => {
      const scene = findScene(sceneId);
      if (!scene) return;
      persistence.markStorySeen(sceneId);
      set({ sceneId, stage: 'before', beat: 0, activeSceneId: null });
      if (beatCount(scene, 'before') === 0) finishStage();
    },

    advance: () => {
      const { sceneId, stage, beat } = get();
      const scene = sceneId ? findScene(sceneId) : undefined;
      if (!scene) return;
      if (beat + 1 < beatCount(scene, stage)) set({ beat: beat + 1 });
      else finishStage();
    },

    skip: () => finishStage(),

    resume: () => {
      const { activeSceneId } = get();
      const scene = activeSceneId ? findScene(activeSceneId) : undefined;
      if (scene && scene.after.length > 0) {
        set({ sceneId: scene.id, stage: 'after', beat: 0 });
      } else {
        set({ sceneId: null, activeSceneId: null });
      }
      useGameStore.getState().setGamePhase('story');
    },

    leaveToMap: () => {
      set({ sceneId: null, activeSceneId: null });
      useGameStore.getState().setGamePhase('story');
    },
  };
});

// Back at the main menu there is no story context left
useGameStore.subscribe(
  s => s.gamePhase,
  phase => {
    if (phase === 'menu') useStoryStore.setState({ sceneId: null, activeSceneId: null });
  },
);
