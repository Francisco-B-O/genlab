import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage for the node test environment before the game modules are loaded
const store: Record<string, string> = {};
// @ts-expect-error — setting global for node test environment
globalThis.localStorage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
};

const { ALL_SCENES, CHAPTERS, chapterOf, findScene } = await import('../story/chapters');
const { TOOLS, TOOL_MODE } = await import('../story/tools');
const { isSceneDone, nextScene, sceneStates, unlockedTools } = await import('../story/progress');
const { beatCount, useStoryStore } = await import('../story/StoryStore');
const { PersistenceManager } = await import('../utils/persistence');
const { useGameStore, levelMode } = await import('../game/GameStore');
const { LevelLoader, LEVEL_ORDER } = await import('../levels/LevelLoader');

const loader = new LevelLoader();
const none = () => false;

describe('story data', () => {
  it('has unique ids and at least one scene per chapter', () => {
    expect(new Set(CHAPTERS.map(c => c.id)).size).toBe(CHAPTERS.length);
    expect(new Set(ALL_SCENES.map(s => s.id)).size).toBe(ALL_SCENES.length);
    CHAPTERS.forEach(c => expect(c.scenes.length, c.id).toBeGreaterThan(0));
  });

  it('every chapter and scene is named in both languages', () => {
    CHAPTERS.forEach(c => {
      [c.era, c.era_es, c.title, c.title_es].forEach(text => expect(text.trim(), c.id).not.toBe(''));
      c.scenes.forEach(s => [s.title, s.title_es].forEach(text => expect(text.trim(), s.id).not.toBe('')));
    });
  });

  it('every line is spoken by a character, in both languages', () => {
    ALL_SCENES.forEach(scene => {
      [...scene.before, ...scene.after].forEach((line, i) => {
        expect(['doc', 'robot'], `${scene.id}[${i}]`).toContain(line.who);
        expect(['neutral', 'happy', 'worried', 'surprised', 'thinking']).toContain(line.mood);
        expect(line.text.trim().length, `${scene.id}[${i}] en`).toBeGreaterThan(10);
        expect(line.text_es.trim().length, `${scene.id}[${i}] es`).toBeGreaterThan(10);
        expect(line.text_es, `${scene.id}[${i}] is translated`).not.toBe(line.text);
      });
    });
  });

  it('scenes with a level point to a registered level, each level used once', () => {
    const levels = ALL_SCENES.flatMap(s => (s.level ? [s.level] : []));
    levels.forEach(id => expect(LEVEL_ORDER, id).toContain(id));
    expect(new Set(levels).size).toBe(levels.length);
  });

  it('every tool is handed over by exactly one scene, with a level of its own mode', async () => {
    for (const tool of TOOLS) {
      const givers = ALL_SCENES.filter(s => s.tool === tool);
      expect(givers.length, tool).toBe(1);
      const level = givers[0].level;
      expect(level, `${tool} is introduced with a level`).toBeTruthy();
      expect(levelMode(await loader.loadLevel(level!)), tool).toBe(TOOL_MODE[tool]);
    }
    ALL_SCENES.forEach(s => { if (s.tool) expect(TOOLS).toContain(s.tool); });
  });

  it('starts with the tutorial level and a welcome that is only dialogue', () => {
    expect(ALL_SCENES[0].level).toBeUndefined();
    expect(ALL_SCENES[1].level).toBe('tutorial');
  });

  it('chapterOf finds the chapter of a scene', () => {
    expect(chapterOf('peas-seeds')?.chapter.id).toBe('peas');
    expect(chapterOf('nope')).toBeUndefined();
  });
});

describe('story progress', () => {
  it('the first scene to play is open and the rest wait', () => {
    const states = sceneStates(new Set(), none);
    expect(states.get(ALL_SCENES[0].id)).toBe('available');
    ALL_SCENES.slice(1).forEach(s => expect(states.get(s.id), s.id).toBe('locked'));
  });

  it('a dialogue scene is done once opened, a level scene once the level is completed', () => {
    const talk = ALL_SCENES[0];
    const level = ALL_SCENES[1];
    expect(isSceneDone(talk, new Set([talk.id]), none)).toBe(true);
    expect(isSceneDone(level, new Set([level.id]), none)).toBe(false);
    expect(isSceneDone(level, new Set(), id => id === level.level)).toBe(true);
  });

  it('moves on to the next scene as scenes are done', () => {
    const seen = new Set([ALL_SCENES[0].id]);
    expect(nextScene(seen, none)?.id).toBe(ALL_SCENES[1].id);
    const states = sceneStates(seen, id => id === ALL_SCENES[1].level);
    expect(states.get(ALL_SCENES[1].id)).toBe('done');
    expect(states.get(ALL_SCENES[2].id)).toBe('available');
  });

  it('is finished when everything is done', () => {
    const everything = new Set(ALL_SCENES.map(s => s.id));
    expect(nextScene(everything, () => true)).toBeUndefined();
  });

  it('unlocks a tool when its scene is opened, or its level was finished in free play', () => {
    const giver = ALL_SCENES.find(s => s.tool === 'kit')!;
    expect(unlockedTools(new Set(), none).has('kit')).toBe(false);
    expect(unlockedTools(new Set([giver.id]), none).has('kit')).toBe(true);
    expect(unlockedTools(new Set(), id => id === giver.level).has('kit')).toBe(true);
  });
});

describe('story save data', () => {
  beforeEach(() => { localStorage.clear(); });

  it('remembers the scenes that were opened', () => {
    const first = new PersistenceManager();
    first.markStorySeen('lab-welcome');
    first.markStorySeen('lab-welcome');
    expect(first.getStorySeen()).toEqual(['lab-welcome']);
    expect(new PersistenceManager().getStorySeen()).toEqual(['lab-welcome']);
  });

  it('loads a save made before the story existed, keeping its progress', () => {
    localStorage.setItem('biogen_save', JSON.stringify({
      version: 1,
      completedLevels: { tutorial: { completed: true, bestScore: 900, hintsUsed: 0, wrongConnections: 0, achievementsEarned: [] } },
      preferences: { tutorialCompleted: true },
      lastPlayedAt: '2026-10-01T00:00:00.000Z',
    }));
    const pm = new PersistenceManager();
    expect(pm.getStorySeen()).toEqual([]);
    expect(pm.isLevelCompleted('tutorial')).toBe(true);
    pm.markStorySeen('lab-welcome');
    expect(pm.isLevelCompleted('tutorial')).toBe(true);
  });
});

describe('story flow in the store', () => {
  beforeEach(() => {
    localStorage.clear();
    useStoryStore.setState({ sceneId: null, stage: 'before', beat: 0, activeSceneId: null });
    useGameStore.setState({ gamePhase: 'story' });
  });

  it('a dialogue-only scene is told line by line and returns to the map', () => {
    const scene = findScene('lab-welcome')!;
    const { openScene, advance } = useStoryStore.getState();
    openScene(scene.id);
    expect(useStoryStore.getState().sceneId).toBe(scene.id);
    for (let i = 0; i < beatCount(scene, 'before') - 1; i++) advance();
    expect(useStoryStore.getState().beat).toBe(beatCount(scene, 'before') - 1);
    advance();
    expect(useStoryStore.getState().sceneId).toBeNull();
    expect(useStoryStore.getState().activeSceneId).toBeNull();
  });

  it('a tool scene ends with the tool card, then starts the level', async () => {
    const scene = findScene('lab-microscope')!;
    expect(beatCount(scene, 'before')).toBe(scene.before.length + 1);
    useStoryStore.getState().openScene(scene.id);
    expect(unlockedTools(new Set(new PersistenceManager().getStorySeen()), none).has('microscope')).toBe(true);
    useStoryStore.getState().skip();
    expect(useStoryStore.getState().sceneId).toBeNull();
    expect(useStoryStore.getState().activeSceneId).toBe(scene.id);
    await vi.waitFor(() => expect(useGameStore.getState().currentLevel?.id).toBe('tutorial'));
    expect(useGameStore.getState().gamePhase).not.toBe('story');
  });

  it('after the level, the scene goes on with what happens next and then returns to the map', () => {
    const scene = findScene('lab-microscope')!;
    useStoryStore.setState({ activeSceneId: scene.id });
    useStoryStore.getState().resume();
    expect(useGameStore.getState().gamePhase).toBe('story');
    expect(useStoryStore.getState()).toMatchObject({ sceneId: scene.id, stage: 'after', beat: 0 });
    for (let i = 0; i < scene.after.length; i++) useStoryStore.getState().advance();
    expect(useStoryStore.getState().sceneId).toBeNull();
    expect(useStoryStore.getState().activeSceneId).toBeNull();
  });

  it('leaving a story level goes back to the map, and the main menu clears the story context', () => {
    useStoryStore.setState({ activeSceneId: 'lab-microscope' });
    useStoryStore.getState().leaveToMap();
    expect(useGameStore.getState().gamePhase).toBe('story');
    expect(useStoryStore.getState().activeSceneId).toBeNull();

    useStoryStore.setState({ activeSceneId: 'lab-microscope' });
    useGameStore.getState().setGamePhase('menu');
    expect(useStoryStore.getState().activeSceneId).toBeNull();
  });
});
