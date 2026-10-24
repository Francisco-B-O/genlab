/**
 * Runtime schema validation for level data.
 * Validates that JSON level files conform to the LevelData interface.
 */

import type { LevelData } from '../types/level.types';

export class LevelSchemaError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value?: unknown
  ) {
    super(`LevelSchema validation failed at "${field}": ${message}`);
    this.name = 'LevelSchemaError';
  }
}

function assertString(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new LevelSchemaError('expected non-empty string', field, value);
  }
}

function assertNumber(value: unknown, field: string): asserts value is number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new LevelSchemaError('expected number', field, value);
  }
}

function assertArray(value: unknown, field: string): asserts value is unknown[] {
  if (!Array.isArray(value)) {
    throw new LevelSchemaError('expected array', field, value);
  }
}

function assertObject(value: unknown, field: string): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new LevelSchemaError('expected object', field, value);
  }
}

const VALID_NODE_TYPES = new Set(['gene', 'protein', 'enzyme', 'metabolite', 'reaction', 'phenotype', 'organelle', 'tissue']);
const VALID_EDGE_TYPES = new Set(['encodes', 'catalyzes', 'consumes', 'produces', 'influences', 'regulates', 'represses', 'localizes_to']);
const VALID_DIFFICULTIES = new Set(['beginner', 'intermediate', 'advanced']);

function validateNode(node: unknown, index: number): void {
  const field = `biologicalContext.nodes[${index}]`;
  assertObject(node, field);
  assertString(node.id, `${field}.id`);
  assertString(node.label, `${field}.label`);
  assertString(node.description, `${field}.description`);

  if (!VALID_NODE_TYPES.has(node.type as string)) {
    throw new LevelSchemaError(
      `invalid node type "${node.type as string}". Valid types: ${Array.from(VALID_NODE_TYPES).join(', ')}`,
      `${field}.type`
    );
  }

  assertObject(node.metadata, `${field}.metadata`);
}

function validateEdge(edge: unknown, index: number): void {
  const field = `biologicalContext.edges[${index}]`;
  assertObject(edge, field);
  assertString(edge.id, `${field}.id`);
  assertString(edge.source, `${field}.source`);
  assertString(edge.target, `${field}.target`);

  if (!VALID_EDGE_TYPES.has(edge.type as string)) {
    throw new LevelSchemaError(
      `invalid edge type "${edge.type as string}". Valid types: ${Array.from(VALID_EDGE_TYPES).join(', ')}`,
      `${field}.type`
    );
  }

  if (typeof edge.isRequired !== 'boolean') {
    throw new LevelSchemaError('expected boolean', `${field}.isRequired`, edge.isRequired);
  }
}

function validatePuzzle(puzzle: unknown): void {
  assertObject(puzzle, 'puzzle');
  assertArray(puzzle.availableNodes, 'puzzle.availableNodes');
  assertArray(puzzle.distractorNodes, 'puzzle.distractorNodes');
  assertArray(puzzle.requiredConnections, 'puzzle.requiredConnections');
  assertArray(puzzle.optionalConnections, 'puzzle.optionalConnections');
  assertArray(puzzle.invalidConnections, 'puzzle.invalidConnections');
  assertObject(puzzle.winCondition, 'puzzle.winCondition');

  const wc = puzzle.winCondition as Record<string, unknown>;
  assertString(wc.type, 'puzzle.winCondition.type');
  // targetNodeId is optional for connections_complete win condition type
  if (wc.type !== 'connections_complete') {
    assertString(wc.targetNodeId, 'puzzle.winCondition.targetNodeId');
  }
  assertArray(wc.requiredConnectionIds, 'puzzle.winCondition.requiredConnectionIds');

  (puzzle.requiredConnections as unknown[]).forEach((rc, i) => {
    const rcField = `puzzle.requiredConnections[${i}]`;
    assertObject(rc, rcField);
    assertString(rc.id, `${rcField}.id`);
    assertString(rc.sourceId, `${rcField}.sourceId`);
    assertString(rc.targetId, `${rcField}.targetId`);
    assertString(rc.edgeType, `${rcField}.edgeType`);
    // pointValue is optional for tutorial levels
  });
}

function validateHints(hints: unknown): void {
  assertArray(hints, 'hints');
  (hints as unknown[]).forEach((hint, i) => {
    const field = `hints[${i}]`;
    assertObject(hint, field);
    if (![1, 2, 3].includes(hint.level as number)) {
      throw new LevelSchemaError('hint level must be 1, 2, or 3', `${field}.level`, hint.level);
    }
    // title, content, and pointCost are optional for bilingual hints
  });
}

function validateScienceCard(science: unknown): void {
  assertObject(science, 'science');
  assertString(science.organism, 'science.organism');
  assertString(science.realWorldCase, 'science.realWorldCase');
  assertString(science.scientificContext, 'science.scientificContext');
  assertArray(science.gameplaySimplifications, 'science.gameplaySimplifications');
  assertArray(science.references, 'science.references');
}

/**
 * Validates that the given unknown value conforms to the LevelData interface.
 * Throws LevelSchemaError with a descriptive message if validation fails.
 * Returns the typed LevelData if valid.
 */
export function validateLevelSchema(data: unknown): LevelData {
  assertObject(data, 'root');

  assertString(data.id, 'id');
  assertString(data.title, 'title');
  assertString(data.subtitle, 'subtitle');
  assertString(data.objective, 'objective');
  assertString(data.description, 'description');

  if (!VALID_DIFFICULTIES.has(data.difficulty as string)) {
    throw new LevelSchemaError(
      `invalid difficulty "${data.difficulty as string}"`,
      'difficulty'
    );
  }

  assertNumber(data.estimatedDuration, 'estimatedDuration');

  // Organism
  assertObject(data.organism, 'organism');
  assertString(data.organism.id, 'organism.id');
  assertString(data.organism.commonName, 'organism.commonName');
  assertString(data.organism.scientificName, 'organism.scientificName');

  // Biological context
  assertObject(data.biologicalContext, 'biologicalContext');
  assertArray(data.biologicalContext.nodes, 'biologicalContext.nodes');
  assertArray(data.biologicalContext.edges, 'biologicalContext.edges');

  (data.biologicalContext.nodes as unknown[]).forEach(validateNode);
  (data.biologicalContext.edges as unknown[]).forEach(validateEdge);

  // Puzzle
  validatePuzzle(data.puzzle);

  // Hints
  validateHints(data.hints);

  // Science card
  validateScienceCard(data.science);

  // Completion
  assertObject(data.completion, 'completion');
  assertString(data.completion.title, 'completion.title');
  assertString(data.completion.summary, 'completion.summary');

  return data as unknown as LevelData;
}
