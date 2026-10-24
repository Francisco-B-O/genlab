/**
 * SimulationEngine — gameplay abstraction layer
 *
 * IMPORTANT: This engine computes a simplified, linear representation of
 * biological pathway activity for visualization purposes. It does NOT model
 * actual biochemical kinetics, thermodynamics, or gene regulatory networks.
 * All numerical values are gameplay abstractions used to drive animations.
 */

import type { SimulationResult, SimulationStep, SimulationVariables, VisualEvent } from '../types/simulation.types';
import { DEFAULT_SIMULATION_VARIABLES } from '../types/simulation.types';
import type { BiologicalGraph } from '../biology/BiologicalGraph';
import type { SimulationDefinition } from '../types/level.types';

export class SimulationEngine {
  private definition: SimulationDefinition;
  private totalRequired: number;

  constructor(definition: SimulationDefinition, totalRequired?: number) {
    this.definition = definition;
    this.totalRequired = totalRequired ?? definition.steps.length;
  }

  /**
   * Runs the simulation against the current player graph state.
   * Returns a step-by-step animation plan based on which connections are satisfied.
   */
  run(playerGraph: BiologicalGraph, satisfiedRequiredIds: Set<string>): SimulationResult {
    const totalRequired = this.totalRequired;
    const totalSatisfied = satisfiedRequiredIds.size;

    // Compute a completion fraction [0, 1] based on satisfied connections vs total steps
    const completionFraction = totalSatisfied > 0
      ? Math.min(totalSatisfied / Math.max(totalRequired, 1), 1)
      : 0;

    // Build simulation variables based on completion
    const variables = this.computeVariables(completionFraction);

    // Build active steps
    const steps = this.buildSteps(completionFraction);

    // Build visual events for animation
    const visualEvents = this.buildVisualEvents(steps, playerGraph);

    const feedback = this.buildFeedback(completionFraction, satisfiedRequiredIds.size);

    return {
      success: completionFraction >= 1.0,
      steps,
      finalVariables: variables,
      feedback,
      visualEvents,
    };
  }

  private computeVariables(completionFraction: number): SimulationVariables {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const f = Math.min(completionFraction, 1);

    return {
      geneExpression: lerp(0, 0.85, f),
      enzymeEfficiency: lerp(0, 0.75, Math.pow(f, 1.2)),
      substrateAvailability: lerp(1, 0.3, f),   // substrate decreases as it's consumed
      reactionFlux: lerp(0, 0.9, Math.pow(f, 0.8)),
      metaboliteAccumulation: lerp(0, 0.95, Math.pow(f, 1.5)),
      phenotypeScore: lerp(0, 1.0, Math.pow(f, 2)),
    };
  }

  private buildSteps(completionFraction: number): SimulationStep[] {
    const stepCount = this.definition.steps.length;
    const activeStepCount = Math.floor(completionFraction * stepCount);

    return this.definition.steps
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((stepDef, index) => ({
        stepId: stepDef.id ?? `step-${index}`,
        label: stepDef.label ?? '',
        variables: this.computeStepVariables(index, stepCount),
        description: stepDef.description ?? '',
        isActive: index < activeStepCount,
        animationType: (stepDef.animationType ?? 'pulse') as SimulationStep['animationType'],
        durationMs: stepDef.duration ?? 1000,
        order: stepDef.order ?? index,
      }));
  }

  private computeStepVariables(stepIndex: number, totalSteps: number): Partial<SimulationVariables> {
    const progress = (stepIndex + 1) / totalSteps;
    return {
      reactionFlux: progress * 0.9,
      metaboliteAccumulation: Math.pow(progress, 1.5) * 0.95,
    };
  }

  private buildVisualEvents(steps: SimulationStep[], playerGraph: BiologicalGraph): VisualEvent[] {
    const events: VisualEvent[] = [];
    let timeOffset = 0;

    for (const step of steps) {
      if (!step.isActive) continue;

      // Activate relevant nodes
      const nodes = playerGraph.getAllNodes();
      nodes.forEach(node => {
        events.push({
          type: 'node_activate',
          targetId: node.id,
          startTime: timeOffset,
          duration: step.durationMs * 0.8,
          data: { animationType: step.animationType, stepId: step.stepId },
        });
      });

      // Flow along edges
      const edges = playerGraph.getAllEdges();
      edges.forEach((edge, idx) => {
        events.push({
          type: 'edge_flow',
          targetId: edge.id,
          startTime: timeOffset + idx * 100,
          duration: step.durationMs,
          data: { stepId: step.stepId },
        });
      });

      timeOffset += step.durationMs + 300; // 300ms gap between steps
    }

    return events;
  }

  private buildFeedback(completionFraction: number, satisfiedCount: number): string {
    if (completionFraction === 0) {
      return 'No pathway connections detected. Connect the genes, enzymes, reactions, and metabolites to initiate the simulation.';
    }
    if (completionFraction < 0.25) {
      return `Pathway partially connected (${satisfiedCount} key connections). The simulation shows minimal enzymatic activity. Continue building the carotenoid pathway.`;
    }
    if (completionFraction < 0.5) {
      return `Pathway ${Math.round(completionFraction * 100)}% complete. Some enzymatic steps are active, but beta-carotene is not yet produced. Look for missing connections in the middle of the pathway.`;
    }
    if (completionFraction < 0.75) {
      return `Good progress! ${Math.round(completionFraction * 100)}% of the pathway is connected. Phytoene is accumulating, but the desaturation or cyclization steps may be incomplete.`;
    }
    if (completionFraction < 1.0) {
      return `Almost complete! ${Math.round(completionFraction * 100)}% done. The pathway is nearly functional — check for any missing connections to complete the flow to beta-carotene.`;
    }
    return 'Pathway complete! Beta-carotene is successfully produced in the endosperm. The golden grain phenotype is achieved.';
  }
}
