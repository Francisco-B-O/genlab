import { ALL_SCENES, type Scene } from './chapters';
import type { ToolId } from './tools';

/** A scene is done, open to play, or waiting for the ones before it. */
export type SceneState = 'done' | 'available' | 'locked';

/**
 * A scene with a level is done once that level is completed (in the story or in free play);
 * a scene that is only dialogue is done once it has been opened.
 */
export function isSceneDone(scene: Scene, seen: ReadonlySet<string>, completed: (levelId: string) => boolean): boolean {
  return scene.level ? completed(scene.level) : seen.has(scene.id);
}

/** The first scene that is not done is the one to play; the rest wait for it. */
export function sceneStates(
  seen: ReadonlySet<string>,
  completed: (levelId: string) => boolean,
  scenes: readonly Scene[] = ALL_SCENES,
): Map<string, SceneState> {
  const states = new Map<string, SceneState>();
  let nextFound = false;
  for (const scene of scenes) {
    if (isSceneDone(scene, seen, completed)) states.set(scene.id, 'done');
    else if (!nextFound) { states.set(scene.id, 'available'); nextFound = true; }
    else states.set(scene.id, 'locked');
  }
  return states;
}

/** A tool is unlocked once the scene that hands it over has been opened, or its level finished elsewhere. */
export function unlockedTools(
  seen: ReadonlySet<string>,
  completed: (levelId: string) => boolean,
  scenes: readonly Scene[] = ALL_SCENES,
): Set<ToolId> {
  const tools = new Set<ToolId>();
  for (const scene of scenes) {
    if (scene.tool && (seen.has(scene.id) || isSceneDone(scene, seen, completed))) tools.add(scene.tool);
  }
  return tools;
}

/** The scene to continue with, or undefined when the whole story is done. */
export function nextScene(
  seen: ReadonlySet<string>,
  completed: (levelId: string) => boolean,
  scenes: readonly Scene[] = ALL_SCENES,
): Scene | undefined {
  return scenes.find(scene => !isSceneDone(scene, seen, completed));
}
