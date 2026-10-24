import type { BiologicalNode, EdgeType, NodeType } from '../types/biology.types';
import { GraphValidator } from '../biology/GraphValidator';
import type { LevelData } from '../types/level.types';
import { t, fmt, type Language } from '../i18n';

export type FeedbackTone = 'success' | 'bonus' | 'error' | 'info';

export interface Feedback {
  tone: FeedbackTone;
  title: string;
  detail?: string;
}

/**
 * Picks an edge type for two node types when the level does not define the
 * connection. Only used to evaluate (and explain) wrong attempts.
 */
export function fallbackEdgeType(src: NodeType, tgt: NodeType): EdgeType {
  const valid = GraphValidator.findValidEdgeTypes(src, tgt);
  return valid[0] ?? 'influences';
}

function typeRule(lang: Language, a: NodeType, b: NodeType): string | null {
  const rules = t(lang).feedback.typeRules as Record<string, string>;
  return rules[`${a}_${b}`] ?? rules[`${b}_${a}`] ?? null;
}

export function correctFeedback(
  lang: Language,
  source: BiologicalNode,
  target: BiologicalNode,
  edgeType: EdgeType,
  description: string | undefined,
): Feedback {
  const i18n = t(lang);
  return {
    tone: 'success',
    title: fmt(i18n.feedback.correct, {
      source: source.label,
      verb: i18n.edgeTypes[edgeType],
      target: target.label,
    }),
    detail: description,
  };
}

export function optionalFeedback(
  lang: Language,
  source: BiologicalNode,
  target: BiologicalNode,
  edgeType: EdgeType,
  points: number,
  description: string | undefined,
): Feedback {
  const i18n = t(lang);
  return {
    tone: 'bonus',
    title: fmt(i18n.feedback.optional, {
      source: source.label,
      verb: i18n.edgeTypes[edgeType],
      target: target.label,
      points,
    }),
    detail: description,
  };
}

/** Explains why two pieces do not connect, preferring level-specific reasons. */
export function wrongFeedback(
  lang: Language,
  level: LevelData,
  a: BiologicalNode,
  b: BiologicalNode,
): Feedback {
  const i18n = t(lang);

  const specific = level.puzzle.invalidConnections.find(
    ic => (ic.sourceId === a.id && ic.targetId === b.id) || (ic.sourceId === b.id && ic.targetId === a.id)
  );
  if (specific?.reason) {
    return { tone: 'error', title: specific.reason, detail: i18n.feedback.chain };
  }

  const trap = a.isDistractor ? a : b.isDistractor ? b : null;
  if (trap) {
    return {
      tone: 'error',
      title: fmt(i18n.feedback.distractor, { label: trap.label }),
      detail: trap.description,
    };
  }

  const validForward = GraphValidator.findValidEdgeTypes(a.type, b.type);
  const validBackward = GraphValidator.findValidEdgeTypes(b.type, a.type);
  const compatible = validForward[0] ?? validBackward[0];
  if (compatible) {
    const [source, target] = validForward[0] ? [a, b] : [b, a];
    return {
      tone: 'error',
      title: fmt(i18n.feedback.wrongPair, {
        source: source.label,
        target: target.label,
        verb: i18n.edgeTypes[compatible],
        sourceType: i18n.nodeTypes[source.type],
        targetType: i18n.nodeTypes[target.type],
      }),
    };
  }

  return {
    tone: 'error',
    title: typeRule(lang, a.type, b.type) ?? fmt(i18n.feedback.generic, { source: a.label, target: b.label }),
    detail: i18n.feedback.chain,
  };
}
