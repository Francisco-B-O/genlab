import { describe, it, expect, beforeEach } from 'vitest';
import { BiologicalGraph } from '../biology/BiologicalGraph';
import type { BiologicalNode } from '../types/biology.types';

const makeNode = (id: string, type: BiologicalNode['type']): BiologicalNode => ({
  id,
  type,
  label: id,
  description: `Test node: ${id}`,
  isDistractor: false,
  metadata: {},
});

describe('BiologicalGraph', () => {
  let graph: BiologicalGraph;

  beforeEach(() => {
    graph = new BiologicalGraph();
  });

  // ─── Node management ────────────────────────────────────────

  it('adds and retrieves nodes', () => {
    const node = makeNode('gene_a', 'gene');
    graph.addNode(node);
    expect(graph.getNode('gene_a')).toBeTruthy();
    expect(graph.getNode('gene_a')!.id).toBe('gene_a');
  });

  it('counts nodes correctly', () => {
    graph.addNode(makeNode('n1', 'gene'));
    graph.addNode(makeNode('n2', 'enzyme'));
    expect(graph.getNodeCount()).toBe(2);
  });

  it('removes nodes', () => {
    graph.addNode(makeNode('n1', 'gene'));
    graph.removeNode('n1');
    expect(graph.getNode('n1')).toBeUndefined();
    expect(graph.getNodeCount()).toBe(0);
  });

  // ─── Valid connections ───────────────────────────────────────

  it('accepts valid gene→enzyme (encodes) connection', () => {
    graph.addNode(makeNode('g1', 'gene'));
    graph.addNode(makeNode('e1', 'enzyme'));
    const validation = graph.validateConnection('g1', 'e1', 'encodes');
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('accepts valid enzyme→reaction (catalyzes) connection', () => {
    graph.addNode(makeNode('e1', 'enzyme'));
    graph.addNode(makeNode('r1', 'reaction'));
    const validation = graph.validateConnection('e1', 'r1', 'catalyzes');
    expect(validation.isValid).toBe(true);
  });

  it('accepts valid reaction→metabolite (produces) connection', () => {
    graph.addNode(makeNode('r1', 'reaction'));
    graph.addNode(makeNode('m1', 'metabolite'));
    const validation = graph.validateConnection('r1', 'm1', 'produces');
    expect(validation.isValid).toBe(true);
  });

  it('accepts valid reaction→metabolite (consumes) connection', () => {
    graph.addNode(makeNode('r1', 'reaction'));
    graph.addNode(makeNode('m1', 'metabolite'));
    const validation = graph.validateConnection('r1', 'm1', 'consumes');
    expect(validation.isValid).toBe(true);
  });

  it('accepts valid metabolite→phenotype (influences) connection', () => {
    graph.addNode(makeNode('m1', 'metabolite'));
    graph.addNode(makeNode('p1', 'phenotype'));
    const validation = graph.validateConnection('m1', 'p1', 'influences');
    expect(validation.isValid).toBe(true);
  });

  // ─── Invalid connections ─────────────────────────────────────

  it('rejects gene→metabolite direct connection', () => {
    graph.addNode(makeNode('g1', 'gene'));
    graph.addNode(makeNode('m1', 'metabolite'));
    const validation = graph.validateConnection('g1', 'm1', 'encodes');
    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });

  it('rejects metabolite→metabolite direct "produces" connection', () => {
    graph.addNode(makeNode('m1', 'metabolite'));
    graph.addNode(makeNode('m2', 'metabolite'));
    const validation = graph.validateConnection('m1', 'm2', 'produces');
    expect(validation.isValid).toBe(false);
  });

  it('rejects self-loop connections', () => {
    graph.addNode(makeNode('g1', 'gene'));
    const validation = graph.validateConnection('g1', 'g1', 'encodes');
    expect(validation.isValid).toBe(false);
    expect(validation.errors[0].code).toBe('SELF_LOOP');
  });

  it('rejects duplicate edges of same type', () => {
    graph.addNode(makeNode('g1', 'gene'));
    graph.addNode(makeNode('e1', 'enzyme'));
    const req = new Set<string>();
    const map = new Map<string, { sourceId: string; targetId: string; edgeType: string; id: string }>();
    graph.tryConnect('g1', 'e1', 'encodes', req, map);
    const validation = graph.validateConnection('g1', 'e1', 'encodes');
    expect(validation.isValid).toBe(false);
    expect(validation.errors[0].code).toBe('DUPLICATE_EDGE');
  });

  // ─── Win condition ───────────────────────────────────────────

  it('detects win condition when all required connections are satisfied', () => {
    graph.addNode(makeNode('g1', 'gene'));
    graph.addNode(makeNode('e1', 'enzyme'));

    const reqMap = new Map([
      ['req_1', { id: 'req_1', sourceId: 'g1', targetId: 'e1', edgeType: 'encodes' }],
    ]);
    const satisfiedSet = new Set<string>();

    graph.tryConnect('g1', 'e1', 'encodes', satisfiedSet, reqMap);

    // After tryConnect, satisfiedSet is NOT updated — the graph internal set is.
    const winResult = graph.checkWinCondition({
      type: 'pathway_complete',
      targetNodeId: 'e1',
      requiredConnectionIds: ['req_1'],
      description: 'test',
    });

    expect(winResult).toBe(true);
  });

  it('does not satisfy win condition with no connections', () => {
    graph.addNode(makeNode('g1', 'gene'));
    graph.addNode(makeNode('e1', 'enzyme'));
    const winResult = graph.checkWinCondition({
      type: 'pathway_complete',
      targetNodeId: 'e1',
      requiredConnectionIds: ['req_1'],
      description: 'test',
    });
    expect(winResult).toBe(false);
  });

  // ─── Serialization ───────────────────────────────────────────

  it('serializes and deserializes correctly', () => {
    graph.addNode(makeNode('g1', 'gene'));
    graph.addNode(makeNode('e1', 'enzyme'));
    const snapshot = graph.toSnapshot();
    const restored = BiologicalGraph.fromSnapshot(snapshot);
    expect(restored.getNodeCount()).toBe(2);
    expect(restored.getNode('g1')).toBeTruthy();
  });
});
