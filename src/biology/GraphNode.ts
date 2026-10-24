import type { BiologicalNode, NodeType } from '../types/biology.types';

export class GraphNode implements BiologicalNode {
  readonly id: string;
  readonly type: NodeType;
  readonly label: string;
  readonly description: string;
  readonly scientificName?: string;
  readonly isDistractor: boolean;
  position?: { x: number; y: number; z: number };
  readonly metadata: Record<string, unknown>;

  // Runtime state (not part of data model)
  isSelected: boolean = false;
  isHighlighted: boolean = false;
  isConnected: boolean = false;
  isRevealed: boolean = false;

  constructor(data: BiologicalNode) {
    this.id = data.id;
    this.type = data.type;
    this.label = data.label;
    this.description = data.description;
    this.scientificName = data.scientificName;
    this.isDistractor = data.isDistractor ?? false;
    this.position = data.position;
    this.metadata = { ...data.metadata };
  }

  toPlainObject(): BiologicalNode {
    return {
      id: this.id,
      type: this.type,
      label: this.label,
      description: this.description,
      scientificName: this.scientificName,
      isDistractor: this.isDistractor,
      position: this.position,
      metadata: { ...this.metadata },
    };
  }

  clone(): GraphNode {
    return new GraphNode(this.toPlainObject());
  }
}
