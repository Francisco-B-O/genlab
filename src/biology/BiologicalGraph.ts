import type {
  BiologicalNode,
  BiologicalEdge,
  EdgeType,
  ValidationResult,
  ConnectionResult,
  WinCondition,
} from '../types/biology.types';
import { GraphNode } from './GraphNode';
import { GraphEdge, generateEdgeId } from './GraphEdge';
import { GraphValidator } from './GraphValidator';
import { PathwayAnalyzer } from './PathwayAnalyzer';
import type { PathwayAnalysisResult } from './PathwayAnalyzer';

export class BiologicalGraph {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  private adjacencyList: Map<string, string[]> = new Map();
  private reverseAdjacencyList: Map<string, string[]> = new Map();
  // Maps "source->target" to edge for fast lookup
  private edgesBySourceTarget: Map<string, GraphEdge> = new Map();
  // Set of required connection IDs that have been correctly placed
  private satisfiedRequiredIds: Set<string> = new Set();

  // ─── Node management ──────────────────────────────────────

  addNode(node: BiologicalNode): void {
    const graphNode = new GraphNode(node);
    this.nodes.set(node.id, graphNode);
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, []);
    }
    if (!this.reverseAdjacencyList.has(node.id)) {
      this.reverseAdjacencyList.set(node.id, []);
    }
  }

  removeNode(id: string): void {
    if (!this.nodes.has(id)) return;

    // Remove all edges connected to this node
    const edgesToRemove: string[] = [];
    this.edges.forEach((edge, edgeId) => {
      if (edge.source === id || edge.target === id) {
        edgesToRemove.push(edgeId);
      }
    });
    edgesToRemove.forEach(edgeId => this.removeEdge(edgeId));

    this.nodes.delete(id);
    this.adjacencyList.delete(id);
    this.reverseAdjacencyList.delete(id);
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  getNodeCount(): number {
    return this.nodes.size;
  }

  // ─── Edge management ──────────────────────────────────────

  /**
   * Adds an edge to the graph. Returns false if the connection is semantically invalid.
   * Validates edge type against node type rules before adding.
   */
  addEdge(edge: BiologicalEdge): boolean {
    const sourceNode = this.nodes.get(edge.source);
    const targetNode = this.nodes.get(edge.target);

    if (!sourceNode || !targetNode) return false;

    const validation = GraphValidator.validateSemanticConnection(
      sourceNode.type,
      targetNode.type,
      edge.type
    );

    if (!validation.isValid) return false;

    const graphEdge = new GraphEdge({ ...edge, isValid: true });
    this.edges.set(edge.id, graphEdge);

    // Update adjacency lists
    const sourceNeighbors = this.adjacencyList.get(edge.source) ?? [];
    if (!sourceNeighbors.includes(edge.target)) {
      sourceNeighbors.push(edge.target);
    }
    this.adjacencyList.set(edge.source, sourceNeighbors);

    const targetParents = this.reverseAdjacencyList.get(edge.target) ?? [];
    if (!targetParents.includes(edge.source)) {
      targetParents.push(edge.source);
    }
    this.reverseAdjacencyList.set(edge.target, targetParents);

    this.edgesBySourceTarget.set(`${edge.source}->${edge.target}`, graphEdge);

    return true;
  }

  removeEdge(id: string): void {
    const edge = this.edges.get(id);
    if (!edge) return;

    // Update adjacency lists
    const sourceNeighbors = this.adjacencyList.get(edge.source) ?? [];
    const filteredNeighbors = sourceNeighbors.filter(n => {
      // Only remove if no other edge connects these two nodes
      const remainingEdges = Array.from(this.edges.values()).filter(
        e => e.id !== id && e.source === edge.source && e.target === edge.target
      );
      return remainingEdges.length > 0 ? true : n !== edge.target;
    });
    this.adjacencyList.set(edge.source, filteredNeighbors);

    const targetParents = this.reverseAdjacencyList.get(edge.target) ?? [];
    const filteredParents = targetParents.filter(p => {
      const remainingEdges = Array.from(this.edges.values()).filter(
        e => e.id !== id && e.source === edge.source && e.target === edge.target
      );
      return remainingEdges.length > 0 ? true : p !== edge.source;
    });
    this.reverseAdjacencyList.set(edge.target, filteredParents);

    this.edgesBySourceTarget.delete(`${edge.source}->${edge.target}`);
    this.edges.delete(id);
    this.satisfiedRequiredIds.delete(id);
  }

  getEdge(id: string): GraphEdge | undefined {
    return this.edges.get(id);
  }

  getAllEdges(): GraphEdge[] {
    return Array.from(this.edges.values());
  }

  getEdgeCount(): number {
    return this.edges.size;
  }

  // ─── Validation ───────────────────────────────────────────

  /**
   * Validates whether a proposed connection is semantically valid.
   * Returns detailed feedback explaining any failure reason.
   */
  validateConnection(sourceId: string, targetId: string, edgeType: EdgeType): ValidationResult {
    const sourceNode = this.nodes.get(sourceId);
    const targetNode = this.nodes.get(targetId);

    const errors: import('../types/biology.types').ValidationError[] = [];
    const warnings: import('../types/biology.types').ValidationWarning[] = [];

    if (!sourceNode) {
      errors.push({ code: 'NODE_NOT_FOUND', message: `Source node "${sourceId}" not found in graph.` });
    }
    if (!targetNode) {
      errors.push({ code: 'NODE_NOT_FOUND', message: `Target node "${targetId}" not found in graph.` });
    }

    if (errors.length > 0) {
      return { isValid: false, errors, warnings };
    }

    // Check for self-loops
    if (sourceId === targetId) {
      return {
        isValid: false,
        errors: [{ code: 'SELF_LOOP', message: 'A node cannot connect to itself.' }],
        warnings: [],
      };
    }

    // Check for duplicate edge
    const existingEdge = this.edgesBySourceTarget.get(`${sourceId}->${targetId}`);
    if (existingEdge && existingEdge.type === edgeType) {
      return {
        isValid: false,
        errors: [{ code: 'DUPLICATE_EDGE', message: 'This connection already exists.' }],
        warnings: [],
      };
    }

    // Semantic validation
    const semanticResult = GraphValidator.validateSemanticConnection(
      sourceNode!.type,
      targetNode!.type,
      edgeType
    );

    if (!semanticResult.isValid) {
      // Enrich errors with contextual feedback
      const contextual = GraphValidator.getContextualFeedback(sourceNode!, targetNode!, edgeType);
      return {
        isValid: false,
        errors: [{ code: 'SEMANTIC_ERROR', message: contextual, sourceId, targetId, edgeType }],
        warnings: [],
      };
    }

    // Warn if distractor nodes are involved
    if (sourceNode!.isDistractor || targetNode!.isDistractor) {
      warnings.push({
        code: 'DISTRACTOR_WARNING',
        message: `One or more nodes in this connection may not be part of the target pathway.`,
      });
    }

    return { isValid: true, errors: [], warnings };
  }

  /**
   * Attempts to add a player-placed edge. Returns detailed ConnectionResult.
   */
  tryConnect(
    sourceId: string,
    targetId: string,
    edgeType: EdgeType,
    requiredConnectionIds: Set<string>,
    requiredConnectionMap: Map<string, { sourceId: string; targetId: string; edgeType: string; id: string }>
  ): ConnectionResult {
    const validation = this.validateConnection(sourceId, targetId, edgeType);

    if (!validation.isValid) {
      const message = validation.errors[0]?.message ?? 'Invalid connection.';
      return {
        success: false,
        feedback: message,
        isCorrect: false,
        pointsEarned: 0,
      };
    }

    const edgeId = generateEdgeId(sourceId, targetId, edgeType);
    const newEdge: BiologicalEdge = {
      id: edgeId,
      source: sourceId,
      target: targetId,
      type: edgeType,
      isRequired: false,
      isValid: true,
    };

    // Check if this matches a required connection
    let matchedRequiredId: string | null = null;
    let isCorrect = false;

    requiredConnectionMap.forEach((req, reqId) => {
      if (
        req.sourceId === sourceId &&
        req.targetId === targetId &&
        req.edgeType === edgeType &&
        !requiredConnectionIds.has(reqId)
      ) {
        matchedRequiredId = reqId;
        isCorrect = true;
        newEdge.isRequired = true;
      }
    });

    this.addEdge(newEdge);
    const edge = this.edges.get(edgeId);
    if (edge) edge.isPlayerPlaced = true;

    if (matchedRequiredId) {
      this.satisfiedRequiredIds.add(matchedRequiredId);
    }

    if (isCorrect) {
      const sourceNode = this.nodes.get(sourceId);
      const targetNode = this.nodes.get(targetId);
      return {
        success: true,
        edge: newEdge,
        feedback: `Correct! ${sourceNode?.label ?? sourceId} → ${edgeType} → ${targetNode?.label ?? targetId}. This is a key step in the carotenoid pathway.`,
        isCorrect: true,
        pointsEarned: 100,
      };
    }

    // Semantic connection succeeded but is not a required connection
    if (validation.warnings.length > 0) {
      return {
        success: true,
        edge: newEdge,
        feedback: `Connection added, but ${validation.warnings[0].message}`,
        isCorrect: false,
        pointsEarned: 0,
      };
    }

    return {
      success: true,
      edge: newEdge,
      feedback: 'Connection added. Check whether this connection is part of the target pathway.',
      isCorrect: false,
      pointsEarned: 0,
    };
  }

  // ─── Pathway queries ──────────────────────────────────────

  getPathway(startId: string, endId: string): PathwayAnalysisResult {
    return PathwayAnalyzer.findPath(
      startId,
      endId,
      this.nodes,
      this.adjacencyList,
      this.edgesBySourceTarget
    );
  }

  getNodeNeighbors(nodeId: string): BiologicalNode[] {
    const neighborIds = this.adjacencyList.get(nodeId) ?? [];
    return neighborIds
      .map(id => this.nodes.get(id))
      .filter((n): n is GraphNode => n !== undefined)
      .map(n => n.toPlainObject());
  }

  getNodeParents(nodeId: string): BiologicalNode[] {
    const parentIds = this.reverseAdjacencyList.get(nodeId) ?? [];
    return parentIds
      .map(id => this.nodes.get(id))
      .filter((n): n is GraphNode => n !== undefined)
      .map(n => n.toPlainObject());
  }

  // ─── Win condition ────────────────────────────────────────

  checkWinCondition(condition: WinCondition): boolean {
    switch (condition.type) {
      case 'pathway_complete':
      case 'metabolite_produced':
      case 'phenotype_achieved': {
        // All required connections must be present
        return condition.requiredConnectionIds.every(reqId =>
          this.satisfiedRequiredIds.has(reqId)
        );
      }
      default:
        return false;
    }
  }

  getSatisfiedRequiredIds(): Set<string> {
    return new Set(this.satisfiedRequiredIds);
  }

  // ─── Contextual feedback ──────────────────────────────────

  getContextualFeedback(sourceId: string, targetId: string): string {
    const sourceNode = this.nodes.get(sourceId);
    const targetNode = this.nodes.get(targetId);

    if (!sourceNode || !targetNode) {
      return 'One or more nodes not found.';
    }

    const validEdgeTypes = GraphValidator.findValidEdgeTypes(sourceNode.type, targetNode.type);

    if (validEdgeTypes.length === 0) {
      return `There is no valid biological relationship between a "${sourceNode.type}" and a "${targetNode.type}". ` +
        `Consider whether these nodes belong to the same pathway step.`;
    }

    return `"${sourceNode.label}" and "${targetNode.label}" could be connected using: ${validEdgeTypes.join(', ')}. ` +
      `Choose the edge type that best represents their biological relationship.`;
  }

  // ─── Serialization ────────────────────────────────────────

  toSnapshot(): { nodes: BiologicalNode[]; edges: BiologicalEdge[] } {
    return {
      nodes: Array.from(this.nodes.values()).map(n => n.toPlainObject()),
      edges: Array.from(this.edges.values()).map(e => e.toPlainObject()),
    };
  }

  static fromSnapshot(snapshot: { nodes: BiologicalNode[]; edges: BiologicalEdge[] }): BiologicalGraph {
    const graph = new BiologicalGraph();
    snapshot.nodes.forEach(n => graph.addNode(n));
    snapshot.edges.forEach(e => graph.addEdge(e));
    return graph;
  }

  clone(): BiologicalGraph {
    return BiologicalGraph.fromSnapshot(this.toSnapshot());
  }
}
