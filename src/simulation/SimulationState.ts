import type { SimulationState, SimulationVariables } from '../types/simulation.types';
import { DEFAULT_SIMULATION_VARIABLES } from '../types/simulation.types';

export function createInitialSimulationState(): SimulationState {
  return {
    isRunning: false,
    currentStepIndex: 0,
    steps: [],
    variables: { ...DEFAULT_SIMULATION_VARIABLES },
    completionFraction: 0,
    isComplete: false,
  };
}

export function advanceSimulationStep(state: SimulationState): SimulationState {
  if (!state.isRunning || state.currentStepIndex >= state.steps.length - 1) {
    return {
      ...state,
      isRunning: false,
      isComplete: state.currentStepIndex >= state.steps.length - 1,
    };
  }

  return {
    ...state,
    currentStepIndex: state.currentStepIndex + 1,
  };
}

export function computeProgressVariables(
  stepIndex: number,
  totalSteps: number,
  baseVariables: SimulationVariables
): SimulationVariables {
  const progress = totalSteps > 0 ? stepIndex / totalSteps : 0;

  return {
    geneExpression: baseVariables.geneExpression * progress,
    enzymeEfficiency: baseVariables.enzymeEfficiency * Math.pow(progress, 1.2),
    substrateAvailability: baseVariables.substrateAvailability,
    reactionFlux: baseVariables.reactionFlux * Math.pow(progress, 0.8),
    metaboliteAccumulation: baseVariables.metaboliteAccumulation * Math.pow(progress, 1.5),
    phenotypeScore: baseVariables.phenotypeScore * Math.pow(progress, 2),
  };
}
