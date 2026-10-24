import type { LevelData } from '../types/level.types';
import type { ValidationResult } from '../types/biology.types';

interface LevelIntegrityResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates the internal consistency of level data after schema validation.
 * Checks that node IDs referenced in puzzle definitions actually exist in
 * biologicalContext.nodes, required connection IDs are consistent, etc.
 */
export class LevelValidator {
  static validateIntegrity(level: LevelData): LevelIntegrityResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const nodeIds = new Set(level.biologicalContext.nodes.map(n => n.id));
    const edgeIds = new Set(level.biologicalContext.edges.map(e => e.id));
    const requiredConnectionIds = new Set(level.puzzle.requiredConnections.map(rc => rc.id));

    // Verify all availableNodes exist
    for (const nodeId of level.puzzle.availableNodes) {
      if (!nodeIds.has(nodeId)) {
        errors.push(`puzzle.availableNodes references unknown node "${nodeId}"`);
      }
    }

    // Verify all distractorNodes exist
    for (const nodeId of level.puzzle.distractorNodes) {
      if (!nodeIds.has(nodeId)) {
        errors.push(`puzzle.distractorNodes references unknown node "${nodeId}"`);
      }
    }

    // Verify required connections reference existing nodes
    for (const rc of level.puzzle.requiredConnections) {
      if (!nodeIds.has(rc.sourceId)) {
        errors.push(`requiredConnections["${rc.id}"].sourceId "${rc.sourceId}" is not in biologicalContext.nodes`);
      }
      if (!nodeIds.has(rc.targetId)) {
        errors.push(`requiredConnections["${rc.id}"].targetId "${rc.targetId}" is not in biologicalContext.nodes`);
      }
    }

    // Verify win condition's required connection IDs all exist in requiredConnections
    for (const reqId of level.puzzle.winCondition.requiredConnectionIds) {
      if (!requiredConnectionIds.has(reqId)) {
        errors.push(`winCondition.requiredConnectionIds references unknown required connection "${reqId}"`);
      }
    }

    // Verify win condition targetNodeId exists (optional for connections_complete)
    const targetNodeId = level.puzzle.winCondition.targetNodeId;
    if (targetNodeId !== undefined && !nodeIds.has(targetNodeId)) {
      errors.push(`winCondition.targetNodeId "${level.puzzle.winCondition.targetNodeId}" is not in biologicalContext.nodes`);
    }

    // Verify reference edges in biologicalContext reference known nodes
    for (const edge of level.biologicalContext.edges) {
      if (!nodeIds.has(edge.source)) {
        errors.push(`biologicalContext.edges["${edge.id}"].source "${edge.source}" not in nodes`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`biologicalContext.edges["${edge.id}"].target "${edge.target}" not in nodes`);
      }
    }

    // Warn about distractor nodes that aren't in availableNodes
    for (const nodeId of level.puzzle.distractorNodes) {
      if (!level.puzzle.availableNodes.includes(nodeId)) {
        warnings.push(`Distractor node "${nodeId}" is not in availableNodes — it won't appear in the puzzle`);
      }
    }

    // Warn if hints don't cover all three levels
    const hintLevels = new Set(level.hints.map(h => h.level));
    [1, 2, 3].forEach(level => {
      if (!hintLevels.has(level as 1 | 2 | 3)) {
        warnings.push(`No hint defined for level ${level}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Converts a LevelValidator result to the generic ValidationResult format.
   */
  static toValidationResult(result: LevelIntegrityResult): ValidationResult {
    return {
      isValid: result.isValid,
      errors: result.errors.map(msg => ({ code: 'LEVEL_INTEGRITY_ERROR', message: msg })),
      warnings: result.warnings.map(msg => ({ code: 'LEVEL_INTEGRITY_WARNING', message: msg })),
    };
  }
}
