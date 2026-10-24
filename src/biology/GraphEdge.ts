import type { BiologicalEdge, EdgeType } from '../types/biology.types';

let edgeCounter = 0;

export function generateEdgeId(source: string, target: string, type: EdgeType): string {
  return `edge_${source}_${type}_${target}_${++edgeCounter}`;
}

export class GraphEdge implements BiologicalEdge {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly type: EdgeType;
  readonly label?: string;
  readonly isRequired: boolean;
  isValid: boolean;

  // Runtime state
  isPlayerPlaced: boolean = false;
  isHighlighted: boolean = false;
  animationOffset: number = Math.random(); // for flow animation staggering

  constructor(data: BiologicalEdge) {
    this.id = data.id;
    this.source = data.source;
    this.target = data.target;
    this.type = data.type;
    this.label = data.label;
    this.isRequired = data.isRequired;
    this.isValid = data.isValid ?? false;
  }

  toPlainObject(): BiologicalEdge {
    return {
      id: this.id,
      source: this.source,
      target: this.target,
      type: this.type,
      label: this.label,
      isRequired: this.isRequired,
      isValid: this.isValid,
    };
  }

  clone(): GraphEdge {
    return new GraphEdge(this.toPlainObject());
  }

  static create(
    source: string,
    target: string,
    type: EdgeType,
    isRequired: boolean = false
  ): GraphEdge {
    return new GraphEdge({
      id: generateEdgeId(source, target, type),
      source,
      target,
      type,
      isRequired,
      isValid: undefined,
    });
  }
}
