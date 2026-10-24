import React from 'react';
import { useStoryStore } from '../../story/StoryStore';
import { StoryMap } from './StoryMap';
import { StoryScene } from './StoryScene';

/** The story phase of the game: the map, or a scene being told. */
export const StoryScreen: React.FC = () => {
  const sceneId = useStoryStore(s => s.sceneId);
  return sceneId ? <StoryScene /> : <StoryMap />;
};
