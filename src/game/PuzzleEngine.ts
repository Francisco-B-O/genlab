import type { EdgeType, ConnectionResult, WinCondition } from '../types/biology.types';
import type { HintResult, ScoreBreakdown } from '../types/game.types';
import type { HintDefinition, LevelData, RequiredConnection } from '../types/level.types';
import type { SimulationResult } from '../types/simulation.types';
import {
  BASE_SCORE_PER_REQUIRED_CONNECTION,
  BONUS_OPTIONAL_CONNECTION,
} from '../types/game.types';
import { computeScore } from './scoring';
import { BiologicalGraph } from '../biology/BiologicalGraph';
import { SimulationEngine } from '../simulation/SimulationEngine';

export interface PuzzleState {
  isComplete: boolean;
  satisfiedRequiredIds: Set<string>;
  wrongConnectionCount: number;
  hintsUsed: { 1: boolean; 2: boolean; 3: boolean };
  optionalConnectionsMade: Set<string>;
}

export class PuzzleEngine {
  private graph: BiologicalGraph;
  private level: LevelData;
  private satisfiedRequiredIds: Set<string> = new Set();
  private wrongConnectionCount: number = 0;
  private hintsUsed: { 1: boolean; 2: boolean; 3: boolean } = { 1: false, 2: false, 3: false };
  private optionalConnectionsMade: Set<string> = new Set();
  private startTimestamp: number = Date.now();
  // When every required connection was first in place; end-of-level bonuses depend on it
  private completedTimestamp: number | null = null;
  private attempts: number = 0;

  // Map of required connection ID → connection definition
  private requiredConnectionMap: Map<
    string,
    { sourceId: string; targetId: string; edgeType: string; id: string }
  >;
  // Set of optional connection IDs → their definitions
  private optionalConnectionMap: Map<
    string,
    { sourceId: string; targetId: string; edgeType: string; id: string; bonusPoints: number }
  >;

  private simulationEngine: SimulationEngine;

  constructor(level: LevelData, graph: BiologicalGraph) {
    this.level = level;
    this.graph = graph;

    this.requiredConnectionMap = new Map();
    level.puzzle.requiredConnections.forEach(rc => {
      this.requiredConnectionMap.set(rc.id, {
        id: rc.id,
        sourceId: rc.sourceId,
        targetId: rc.targetId,
        edgeType: rc.edgeType,
      });
    });

    this.optionalConnectionMap = new Map();
    level.puzzle.optionalConnections.forEach(oc => {
      this.optionalConnectionMap.set(oc.id, {
        id: oc.id,
        sourceId: oc.sourceId,
        targetId: oc.targetId,
        edgeType: oc.edgeType,
        bonusPoints: oc.bonusPoints,
      });
    });

    this.simulationEngine = new SimulationEngine(level.simulation, level.puzzle.winCondition.requiredConnectionIds.length);
  }

  // ─── Connection management ────────────────────────────────

  connectNodes(sourceId: string, targetId: string, edgeType: EdgeType): ConnectionResult {
    this.attempts++;

    const result = this.graph.tryConnect(
      sourceId,
      targetId,
      edgeType,
      this.satisfiedRequiredIds,
      this.requiredConnectionMap
    );

    if (!result.success) {
      this.wrongConnectionCount++;
      return result;
    }

    if (result.isCorrect) {
      // Find which required connection was satisfied
      this.requiredConnectionMap.forEach((rc, reqId) => {
        if (
          rc.sourceId === sourceId &&
          rc.targetId === targetId &&
          rc.edgeType === edgeType
        ) {
          this.satisfiedRequiredIds.add(reqId);
        }
      });
      if (this.completedTimestamp === null && this.validatePuzzle().isComplete) {
        this.completedTimestamp = Date.now();
      }
      return result;
    }

    // Optional connections are valid bonus links, not mistakes
    let matchedOptional = false;
    this.optionalConnectionMap.forEach((oc, ocId) => {
      if (
        oc.sourceId === sourceId &&
        oc.targetId === targetId &&
        oc.edgeType === edgeType
      ) {
        this.optionalConnectionsMade.add(ocId);
        matchedOptional = true;
      }
    });

    if (!matchedOptional) {
      // Semantically valid but not a required or optional connection
      this.wrongConnectionCount++;
    }

    return result;
  }

  disconnectNodes(edgeId: string): void {
    const edge = this.graph.getEdge(edgeId);
    if (!edge) return;

    // Remove from satisfied required IDs if it was required
    this.requiredConnectionMap.forEach((rc, reqId) => {
      if (
        rc.sourceId === edge.source &&
        rc.targetId === edge.target &&
        rc.edgeType === edge.type
      ) {
        this.satisfiedRequiredIds.delete(reqId);
        this.completedTimestamp = null;
      }
    });

    this.optionalConnectionMap.forEach((oc, ocId) => {
      if (
        oc.sourceId === edge.source &&
        oc.targetId === edge.target &&
        oc.edgeType === edge.type
      ) {
        this.optionalConnectionsMade.delete(ocId);
      }
    });

    this.graph.removeEdge(edgeId);
  }

  /** Whether a connection matches one of the level's optional (bonus) connections. */
  isOptionalConnection(sourceId: string, targetId: string, edgeType: string): boolean {
    for (const oc of this.optionalConnectionMap.values()) {
      if (oc.sourceId === sourceId && oc.targetId === targetId && oc.edgeType === edgeType) return true;
    }
    return false;
  }

  // ─── Validation ───────────────────────────────────────────

  validatePuzzle(): { isComplete: boolean; progress: number; feedback: string } {
    const winCondition = this.level.puzzle.winCondition;
    const isComplete = winCondition.requiredConnectionIds.every(id =>
      this.satisfiedRequiredIds.has(id)
    );

    const progress =
      winCondition.requiredConnectionIds.length > 0
        ? this.satisfiedRequiredIds.size / winCondition.requiredConnectionIds.length
        : 0;

    let feedback: string;
    if (isComplete) {
      feedback = 'All required pathway connections are in place. The pathway is complete!';
    } else {
      const remaining = winCondition.requiredConnectionIds.filter(
        id => !this.satisfiedRequiredIds.has(id)
      ).length;
      feedback = `${this.satisfiedRequiredIds.size} of ${winCondition.requiredConnectionIds.length} required connections made. ${remaining} remaining.`;
    }

    return { isComplete, progress, feedback };
  }

  // ─── Hints ────────────────────────────────────────────────

  getHint(level: 1 | 2 | 3): HintResult {
    const hint = this.level.hints.find(h => h.level === level);

    if (!hint) {
      return {
        level,
        title: 'No Hint Available',
        content: 'No hint is defined for this level.',
        revealedNodes: [],
        revealedConnections: [],
        pointCost: 0,
      };
    }

    this.hintsUsed[level] = true;

    return {
      level: hint.level,
      title: hint.title ?? '',
      content: hint.content ?? '',
      revealedNodes: hint.revealedNodes ?? [],
      revealedConnections: hint.revealedConnections ?? [],
      pointCost: hint.pointCost ?? 0,
    };
  }

  getHintsUsedCount(): number {
    return Object.values(this.hintsUsed).filter(Boolean).length;
  }

  // ─── Simulation ───────────────────────────────────────────

  runSimulation(): SimulationResult {
    return this.simulationEngine.run(this.graph, this.satisfiedRequiredIds);
  }

  // ─── Scoring ──────────────────────────────────────────────

  /**
   * Score so far. Pathway levels earn points per connection; other level
   * types pass their own `base` (they have no connections to count).
   */
  getScore(base?: number): ScoreBreakdown {
    return computeScore({
      base: base ?? this.satisfiedRequiredIds.size * BASE_SCORE_PER_REQUIRED_CONNECTION,
      bonusOptional: this.optionalConnectionsMade.size * BONUS_OPTIONAL_CONNECTION,
      hintsUsed: this.hintsUsed,
      mistakes: this.wrongConnectionCount,
      startedAt: this.startTimestamp,
      completedAt: this.completedTimestamp,
    });
  }

  /** Counts a mistake made outside the connection mechanic (other level types). */
  recordMistake(): void {
    this.wrongConnectionCount++;
  }

  /** Marks a non-pathway level as solved, which unlocks the end-of-level bonuses. */
  markSolved(): void {
    if (this.completedTimestamp === null) this.completedTimestamp = Date.now();
  }

  // ─── State ────────────────────────────────────────────────

  getState(): PuzzleState {
    return {
      isComplete: this.validatePuzzle().isComplete,
      satisfiedRequiredIds: new Set(this.satisfiedRequiredIds),
      wrongConnectionCount: this.wrongConnectionCount,
      hintsUsed: { ...this.hintsUsed },
      optionalConnectionsMade: new Set(this.optionalConnectionsMade),
    };
  }

  getSatisfiedRequiredIds(): Set<string> {
    return new Set(this.satisfiedRequiredIds);
  }

  reset(): void {
    // Remove all player-placed edges
    const allEdges = this.graph.getAllEdges();
    allEdges.forEach(edge => {
      if (edge.isPlayerPlaced) {
        this.graph.removeEdge(edge.id);
      }
    });

    this.satisfiedRequiredIds.clear();
    this.wrongConnectionCount = 0;
    this.hintsUsed = { 1: false, 2: false, 3: false };
    this.optionalConnectionsMade.clear();
    this.startTimestamp = Date.now();
    this.completedTimestamp = null;
    this.attempts = 0;
  }

  getElapsedSeconds(): number {
    return (Date.now() - this.startTimestamp) / 1000;
  }

  getAttempts(): number {
    return this.attempts;
  }

  getGraph(): BiologicalGraph {
    return this.graph;
  }
}
