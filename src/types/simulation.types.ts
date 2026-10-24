// ============================================================
// Simulation Layer Types
// NOTE: This simulation is a gameplay abstraction designed to
// visualize biological processes. It does not model actual
// biochemical kinetics or thermodynamics.
// ============================================================

export interface SimulationVariables {
  geneExpression: number;           // 0–1, relative expression level
  enzymeEfficiency: number;         // 0–1, relative catalytic rate
  substrateAvailability: number;    // 0–1, relative metabolite pool
  reactionFlux: number;             // 0–1, relative pathway throughput
  metaboliteAccumulation: number;   // 0–1, relative product concentration
  phenotypeScore: number;           // 0–1, overall phenotype realization
}

export interface SimulationStep {
  stepId: string;
  label: string;
  variables: Partial<SimulationVariables>;
  description: string;
  isActive: boolean;
  animationType: 'pulse' | 'flow' | 'glow' | 'transform';
  durationMs: number;
  order: number;
}

export interface SimulationState {
  isRunning: boolean;
  currentStepIndex: number;
  steps: SimulationStep[];
  variables: SimulationVariables;
  completionFraction: number; // 0–1
  isComplete: boolean;
  errorMessage?: string;
}

export interface SimulationResult {
  success: boolean;
  steps: SimulationStep[];
  finalVariables: SimulationVariables;
  feedback: string;
  visualEvents: VisualEvent[];
}

export interface VisualEvent {
  type: 'node_activate' | 'edge_flow' | 'particle_burst' | 'color_shift';
  targetId: string;
  startTime: number;  // ms from simulation start
  duration: number;   // ms
  data: Record<string, unknown>;
}

export const DEFAULT_SIMULATION_VARIABLES: SimulationVariables = {
  geneExpression: 0,
  enzymeEfficiency: 0,
  substrateAvailability: 0,
  reactionFlux: 0,
  metaboliteAccumulation: 0,
  phenotypeScore: 0,
};
