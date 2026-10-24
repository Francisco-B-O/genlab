// ============================================================
// Biology Domain Types
// ============================================================

export type NodeType =
  | 'gene'
  | 'protein'
  | 'enzyme'
  | 'metabolite'
  | 'reaction'
  | 'phenotype'
  | 'organelle'
  | 'tissue';

export type EdgeType =
  | 'encodes'
  | 'catalyzes'
  | 'consumes'
  | 'produces'
  | 'influences'
  | 'regulates'
  | 'represses'
  | 'localizes_to';

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface BiologicalNode {
  id: string;
  type: NodeType;
  label: string;
  description: string;
  scientificName?: string;
  isDistractor?: boolean;
  position?: Position3D;
  metadata: Record<string, unknown>;
}

export interface BiologicalEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  label?: string;
  isRequired: boolean;
  isValid?: boolean;
}

export interface Pathway {
  id: string;
  name: string;
  description: string;
  nodes: BiologicalNode[];
  edges: BiologicalEdge[];
  startNodes: string[];
  endNodes: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  code: string;
  message: string;
  sourceId?: string;
  targetId?: string;
  edgeType?: EdgeType;
}

export interface ValidationWarning {
  code: string;
  message: string;
}

export interface ConnectionResult {
  success: boolean;
  edge?: BiologicalEdge;
  feedback: string;
  isCorrect: boolean;
  pointsEarned: number;
}

// Semantic rules for which node types can connect via which edge types
export const VALID_CONNECTION_RULES: Record<EdgeType, { sources: NodeType[]; targets: NodeType[] }> = {
  encodes: {
    sources: ['gene'],
    targets: ['protein', 'enzyme'],
  },
  catalyzes: {
    sources: ['enzyme', 'protein'],
    targets: ['reaction'],
  },
  consumes: {
    sources: ['reaction'],
    targets: ['metabolite', 'protein'],
  },
  produces: {
    sources: ['reaction'],
    targets: ['metabolite', 'protein', 'phenotype'],
  },
  influences: {
    sources: ['metabolite', 'protein', 'enzyme', 'phenotype'],
    targets: ['phenotype', 'metabolite', 'gene'],
  },
  regulates: {
    sources: ['gene', 'protein', 'metabolite'],
    targets: ['gene', 'protein', 'reaction'],
  },
  represses: {
    sources: ['gene', 'protein', 'metabolite', 'reaction'],
    targets: ['gene', 'protein', 'reaction'],
  },
  localizes_to: {
    sources: ['gene', 'protein', 'enzyme', 'metabolite', 'reaction'],
    targets: ['organelle', 'tissue'],
  },
};

export interface WinCondition {
  type: 'metabolite_produced' | 'pathway_complete' | 'phenotype_achieved' | 'connections_complete';
  targetNodeId?: string;
  requiredConnectionIds: string[];
  description?: string;
}
