import type { BiologicalNode } from '../types/biology.types';
import type { GraphNode } from './GraphNode';
import type { GraphEdge } from './GraphEdge';

export interface PathwayAnalysisResult {
  hasPath: boolean;
  path: BiologicalNode[];
  pathEdgeIds: string[];
  length: number;
  bottlenecks: string[]; // node ids that are critical (removing them breaks the path)
}

export class PathwayAnalyzer {
  /**
   * Finds the shortest path between two nodes using BFS.
   */
  static findPath(
    startId: string,
    endId: string,
    nodes: Map<string, GraphNode>,
    adjacencyList: Map<string, string[]>,
    edgesBySourceTarget: Map<string, GraphEdge>
  ): PathwayAnalysisResult {
    if (startId === endId) {
      const node = nodes.get(startId);
      return {
        hasPath: !!node,
        path: node ? [node.toPlainObject()] : [],
        pathEdgeIds: [],
        length: 0,
        bottlenecks: [],
      };
    }

    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; path: string[]; edgeIds: string[] }> = [
      { nodeId: startId, path: [startId], edgeIds: [] },
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.nodeId === endId) {
        const pathNodes = current.path.map(id => nodes.get(id)!.toPlainObject());
        return {
          hasPath: true,
          path: pathNodes,
          pathEdgeIds: current.edgeIds,
          length: current.path.length - 1,
          bottlenecks: PathwayAnalyzer.findBottlenecks(
            startId,
            endId,
            current.path,
            nodes,
            adjacencyList,
            edgesBySourceTarget
          ),
        };
      }

      if (visited.has(current.nodeId)) continue;
      visited.add(current.nodeId);

      const neighbors = adjacencyList.get(current.nodeId) ?? [];
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          const edgeKey = `${current.nodeId}->${neighborId}`;
          const edge = edgesBySourceTarget.get(edgeKey);
          queue.push({
            nodeId: neighborId,
            path: [...current.path, neighborId],
            edgeIds: edge ? [...current.edgeIds, edge.id] : current.edgeIds,
          });
        }
      }
    }

    return { hasPath: false, path: [], pathEdgeIds: [], length: -1, bottlenecks: [] };
  }

  /**
   * Returns all node ids that can be reached from a given start node.
   */
  static getReachableNodes(
    startId: string,
    adjacencyList: Map<string, string[]>
  ): Set<string> {
    const visited = new Set<string>();
    const queue = [startId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      const neighbors = adjacencyList.get(current) ?? [];
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          queue.push(neighborId);
        }
      }
    }

    return visited;
  }

  /**
   * Identifies bottleneck nodes in a given path (nodes that if removed,
   * would break the only connection between start and end).
   */
  private static findBottlenecks(
    startId: string,
    endId: string,
    path: string[],
    nodes: Map<string, GraphNode>,
    adjacencyList: Map<string, string[]>,
    edgesBySourceTarget: Map<string, GraphEdge>
  ): string[] {
    const bottlenecks: string[] = [];

    for (const nodeId of path) {
      if (nodeId === startId || nodeId === endId) continue;

      // Temporarily remove node from adjacency list
      const savedNeighbors = adjacencyList.get(nodeId) ?? [];
      adjacencyList.delete(nodeId);

      // Check if path still exists without this node
      const result = PathwayAnalyzer.findPath(startId, endId, nodes, adjacencyList, edgesBySourceTarget);
      if (!result.hasPath) {
        bottlenecks.push(nodeId);
      }

      // Restore
      adjacencyList.set(nodeId, savedNeighbors);
    }

    return bottlenecks;
  }

  /**
   * Calculates how complete the player's graph is relative to required connections.
   */
  static calculateCompletionFraction(
    requiredConnectionIds: string[],
    presentEdgeIds: Set<string>
  ): number {
    if (requiredConnectionIds.length === 0) return 1;
    const matched = requiredConnectionIds.filter(id => presentEdgeIds.has(id)).length;
    return matched / requiredConnectionIds.length;
  }
}
