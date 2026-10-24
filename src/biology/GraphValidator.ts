import type { EdgeType, NodeType, ValidationResult, ValidationError } from '../types/biology.types';
import { VALID_CONNECTION_RULES } from '../types/biology.types';
import type { GraphNode } from './GraphNode';

// Contextual feedback messages for invalid connection attempts
const FEEDBACK_MESSAGES: Record<string, (source: GraphNode, target: GraphNode) => string> = {
  'gene_metabolite': (s, t) =>
    `${s.label} is a gene that encodes a protein or enzyme, not a metabolite. ` +
    `Find the enzyme ${s.label} encodes, then connect that enzyme to ${t.label}.`,

  'gene_reaction': (s, t) =>
    `Genes don't directly catalyze reactions. ${s.label} encodes a protein or enzyme, ` +
    `which then catalyzes the ${t.label} reaction.`,

  'gene_phenotype': (s, _t) =>
    `Genes influence phenotypes indirectly through their encoded proteins. ` +
    `Trace the pathway: ${s.label} → enzyme → reaction → metabolite → phenotype.`,

  'metabolite_metabolite': (s, t) =>
    `Metabolites don't convert directly to other metabolites. ` +
    `A reaction catalyzed by an enzyme transforms ${s.label} into ${t.label}. ` +
    `Add the reaction node between them.`,

  'metabolite_gene': (_s, t) =>
    `Direct metabolite-to-gene connections aren't modeled here. ` +
    `If ${t.label} is regulated by a metabolite, use the "regulates" edge type, ` +
    `or check if this connection is part of the carotenoid pathway.`,

  'enzyme_metabolite_wrong_direction': (s, t) =>
    `${s.label} acts on a substrate, not a product. ` +
    `Check whether ${t.label} is the correct substrate (input) for this enzyme.`,

  'protein_metabolite': (s, _t) =>
    `${s.label} is a structural protein, not an enzyme. ` +
    `Only enzymes can catalyze reactions that transform metabolites.`,
};

export class GraphValidator {
  /**
   * Validates whether a connection between two node types via a given edge type
   * is semantically valid according to biological rules.
   */
  static validateSemanticConnection(
    sourceType: NodeType,
    targetType: NodeType,
    edgeType: EdgeType
  ): ValidationResult {
    const rule = VALID_CONNECTION_RULES[edgeType];

    const errors: ValidationError[] = [];

    if (!rule.sources.includes(sourceType)) {
      errors.push({
        code: 'INVALID_SOURCE_TYPE',
        message: `A "${sourceType}" node cannot be the source of a "${edgeType}" edge. ` +
          `Valid source types for "${edgeType}": ${rule.sources.join(', ')}.`,
        edgeType,
      });
    }

    if (!rule.targets.includes(targetType)) {
      errors.push({
        code: 'INVALID_TARGET_TYPE',
        message: `A "${targetType}" node cannot be the target of a "${edgeType}" edge. ` +
          `Valid target types for "${edgeType}": ${rule.targets.join(', ')}.`,
        edgeType,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  /**
   * Returns rich contextual feedback explaining why a connection attempt failed.
   */
  static getContextualFeedback(
    source: GraphNode,
    target: GraphNode,
    edgeType: EdgeType
  ): string {
    const key = `${source.type}_${target.type}`;
    const feedbackFn = FEEDBACK_MESSAGES[key];

    if (feedbackFn) {
      return feedbackFn(source, target);
    }

    const rule = VALID_CONNECTION_RULES[edgeType];

    if (!rule.sources.includes(source.type)) {
      return `"${source.label}" (${source.type}) cannot be the source of a "${edgeType}" connection. ` +
        `This edge type originates from: ${rule.sources.join(', ')}.`;
    }

    if (!rule.targets.includes(target.type)) {
      return `"${target.label}" (${target.type}) cannot receive a "${edgeType}" connection. ` +
        `This edge type points to: ${rule.targets.join(', ')}.`;
    }

    return `The connection from "${source.label}" to "${target.label}" via "${edgeType}" is not valid ` +
      `in the current pathway context. Review the pathway structure and try a different connection.`;
  }

  /**
   * Checks if a node type combination could be valid for ANY edge type.
   * Used to give smarter hints when the player connects nodes with the wrong edge type.
   */
  static findValidEdgeTypes(sourceType: NodeType, targetType: NodeType): EdgeType[] {
    return (Object.entries(VALID_CONNECTION_RULES) as [EdgeType, { sources: NodeType[]; targets: NodeType[] }][])
      .filter(([, rule]) =>
        rule.sources.includes(sourceType) && rule.targets.includes(targetType)
      )
      .map(([edgeType]) => edgeType);
  }
}
