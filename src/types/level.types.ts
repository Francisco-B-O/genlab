// ============================================================
// Level Schema Types
//
// Bilingual content convention: every user-facing string is written in
// English in its base field, with a Spanish variant in a sibling `<field>_es`
// key (e.g. `title` + `title_es`). `localize()` resolves them at runtime.
// The suffixed keys are not declared here; they live only in the JSON.
// ============================================================

import type { BiologicalNode, BiologicalEdge, WinCondition } from './biology.types';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * How a level is played:
 * - pathway: connect pieces into a biological pathway (the original mode)
 * - construct: put DNA parts in the right order to build a working gene construct
 * - diagnose: find the broken piece of an already-built pathway, then pick a treatment
 * - sequence: put the steps of a real process in the right order
 * - inherit: fill in Punnett squares and work out inheritance probabilities
 * - mutation: spot the changed base in a DNA sequence and say what it does to the protein
 * - tune: choose settings for a production setup within a budget to reach a target
 * - pairing: complete a strand from its template (DNA pairs, DNA to mRNA, mRNA to amino acids)
 * - cut: choose restriction enzymes that cut a gene out of a stretch of DNA, and read the gel
 * - assemble: put overlapping fragments in order to rebuild a whole sequence (shotgun sequencing)
 * - crispr: choose the guide that makes Cas9 cut only inside the gene to edit
 */
export type LevelMode = 'pathway' | 'construct' | 'diagnose' | 'sequence' | 'inherit' | 'mutation' | 'tune' | 'pairing' | 'cut' | 'assemble' | 'crispr';

export interface LevelData {
  id: string;
  title: string;
  subtitle: string;
  organism: OrganismData;
  objective: string;
  description: string;
  difficulty: Difficulty;
  estimatedDuration: number; // minutes
  isTutorial?: boolean;
  mode?: LevelMode;
  construct?: ConstructDefinition;
  diagnose?: DiagnoseDefinition;
  sequence?: SequenceDefinition;
  inherit?: InheritDefinition;
  mutation?: MutationDefinition;
  tune?: TuneDefinition;
  pairing?: PairDefinition;
  cut?: CutDefinition;
  assemble?: AssembleDefinition;
  crispr?: CrisprDefinition;
  exploration?: ExplorationScale[];
  guide?: GuideStep[];
  biologicalContext: BiologicalContext;
  puzzle: PuzzleDefinition;
  simulation: SimulationDefinition;
  hints: HintDefinition[];
  completion: CompletionData;
  science: ScienceCard;
}

export interface OrganismData {
  id: string;
  commonName: string;
  scientificName: string;
  taxonomy: string[];
  targetTissue: string;
  targetOrganelle: string;
  description: string;
}

/** Illustrations available for exploration scales (see ui/components/Illustrations). */
export type IllustrationKind =
  | 'plant' | 'grain' | 'bacterium' | 'yeast' | 'jellyfish' | 'cell' | 'plastid'
  | 'dna' | 'pathway' | 'milk' | 'flask' | 'cheese' | 'tomato' | 'bottle' | 'blood'
  | 'bread' | 'banana' | 'silk'
  | 'shirt' | 'jeans' | 'flower' | 'vanilla' | 'strip' | 'burger' | 'wheat';

export interface ExplorationScale {
  kind: IllustrationKind;
  label: string;
  title: string;
  description: string;
}

/**
 * One step of the guided tutorial. A step with `connectionId` waits until the
 * player makes that required connection; a step without it shows a Next button.
 */
export interface GuideStep {
  text: string;
  connectionId?: string;
  highlight?: string[];
}

export interface SequenceStep {
  id: string;
  label: string;
  /** What happens in this step, revealed once the order is right. */
  description: string;
  /** What must already have happened: shown when the step is placed too early. */
  needs: string;
}

/** Steps are listed in the correct order; the game shuffles them. */
export interface SequenceDefinition {
  steps: SequenceStep[];
}

export interface InheritScenario {
  id: string;
  parent1: string;
  parent2: string;
  parent1Label: string;
  parent2Label: string;
  question: string;
  /** Phenotype key the question asks about. */
  target: string;
  /** Second gene of a two-gene level: the genotypes of the parents and the phenotype asked about. */
  parent1b?: string;
  parent2b?: string;
  targetB?: string;
  explanation: string;
}

/** The second gene of a level that follows two genes at once; it has its own square. */
export interface InheritSecondGene {
  trait: string;
  alleles: string[];
  genotypes?: string[];
  phenotypes: Record<string, string>;
  phenotypeLabels: Record<string, string>;
}

export interface InheritDefinition {
  trait: string;
  alleles: string[];
  /**
   * Genotypes the player can choose for a child, when not every pair of alleles is possible
   * (for example 'YY' in an X-linked trait). Defaults to every pair of `alleles`.
   */
  genotypes?: string[];
  /** Genotype (alleles in canonical order) → phenotype key. */
  phenotypes: Record<string, string>;
  phenotypeLabels: Record<string, string>;
  /**
   * A second gene that is inherited on its own. The player fills a square for each gene, and the
   * question asks for the chance of both traits at once: the product of the two chances.
   */
  second?: InheritSecondGene;
  scenarios: InheritScenario[];
}

export interface MutationDefinition {
  geneLabel: string;
  /** Coding strand of the healthy gene; length is a multiple of 3. */
  reference: string;
  /**
   * Same strand in the patient, with exactly one changed base, or with one base more
   * (insertion) or one base less (deletion), which shifts the reading frame.
   */
  mutant: string;
  story: string;
  /** `frameshift` is required when the patient's strand is one letter longer or shorter. */
  explanations: Record<'silent' | 'missense' | 'nonsense', string> & { frameshift?: string };
}

export interface TuneOption {
  id: string;
  label: string;
  description: string;
  cost: number;
  /** Multiplier on what each cell makes. */
  perCell: number;
  /** Multiplier on how fast the culture grows. */
  growth: number;
}

export interface TuneKnob {
  id: string;
  label: string;
  options: TuneOption[];
}

export interface TuneDefinition {
  metricLabel: string;
  unit: string;
  base: number;
  target: number;
  budget: number;
  knobs: TuneKnob[];
  /** Level-specific names for the two multipliers (defaults describe a microbe culture). */
  labels?: { perCell: string; growth: string };
  /** Level-specific advice when the target is missed. */
  messages?: { lowGrowth: string; lowPerCell: string };
}

/**
 * What the player writes in a pairing level:
 * - dna: the complementary DNA strand of a DNA template
 * - rna: the messenger RNA copied from a DNA template
 * - protein: the amino acid of each codon of a messenger RNA
 */
export type PairKind = 'dna' | 'rna' | 'protein';

export interface PairDefinition {
  kind: PairKind;
  /** DNA letters (A, C, G, T) for dna and rna; mRNA letters (A, C, G, U) in threes for protein. */
  template: string;
  /** A line of context shown above the strands. */
  story: string;
}

/** A restriction enzyme: it cuts the DNA at every position of `sites` (in kilobases from the start). */
export interface CutEnzyme {
  id: string;
  label: string;
  description: string;
  sites: number[];
}

export interface CutDefinition {
  /** Length of the stretch of DNA, in kilobases. */
  length: number;
  /** The gene to isolate: it must come out as a fragment of its own. */
  gene: { label: string; start: number; end: number };
  enzymes: CutEnzyme[];
  /** A line of context shown above the map. */
  story: string;
}

export interface AssembleDefinition {
  /** The whole sequence the fragments were read from. */
  sequence: string;
  /** The fragments, listed in the right order; the game shuffles them. Neighbours overlap. */
  fragments: string[];
  /** Letters that two neighbours must share for the join to count. */
  minOverlap: number;
  /** A line of context shown above the fragments. */
  story: string;
}

export interface CrisprGuide {
  id: string;
  /** The DNA letters of the guide (the 20 of a real guide are shortened to fit the screen). */
  sequence: string;
}

export interface CrisprDefinition {
  /** The DNA (one strand) in which the guide looks for its site. */
  genome: string;
  /** The gene to edit: Cas9 must cut inside it, and only there. */
  target: { label: string; start: number; end: number };
  guides: CrisprGuide[];
  /** How many letters of a site may differ from the guide and still be recognised. */
  mismatches: number;
  /** A line of context shown above the genome. */
  story: string;
}

export type PartKind = 'promoter' | 'rbs' | 'signal' | 'gene' | 'terminator';

/** One DNA part the player can place on the construct. */
export interface ConstructPart {
  id: string;
  kind: PartKind;
  label: string;
  description: string;
  /** Explanation shown when this part is placed where it does not belong. */
  wrongReason?: string;
  isDistractor?: boolean;
}

export interface ConstructDefinition {
  /** Part ids in the correct order, one per slot. */
  solution: string[];
  parts: ConstructPart[];
}

export interface DiagnoseClue {
  text: string;
}

export interface DiagnoseFix {
  id: string;
  text: string;
  correct: boolean;
  reason: string;
}

export interface DiagnoseDefinition {
  symptom: string;
  clues: DiagnoseClue[];
  /** Pieces that count as the right answer (e.g. a gene and the enzyme it fails to make). */
  faultyIds: string[];
  /** What the player learns when they accuse each piece. */
  notes: Record<string, { text: string }>;
  fixes: DiagnoseFix[];
}

export interface BiologicalContext {
  nodes: BiologicalNode[];
  edges: BiologicalEdge[];
  pathwayDescription?: string;
}

export interface PuzzleDefinition {
  availableNodes: string[];       // node ids from biologicalContext
  distractorNodes: string[];
  requiredConnections: RequiredConnection[];
  optionalConnections: OptionalConnection[];
  invalidConnections: InvalidConnection[];
  winCondition: WinCondition;
}

export interface RequiredConnection {
  id: string;
  sourceId: string;
  targetId: string;
  edgeType: string;
  description?: string;
  pointValue?: number;
}

export interface OptionalConnection {
  id: string;
  sourceId: string;
  targetId: string;
  edgeType: string;
  description: string;
  bonusPoints: number;
}

export interface InvalidConnection {
  sourceId: string;
  targetId: string;
  reason?: string;
}

export interface SimulationDefinition {
  steps: SimulationStepDef[];
  /** Name of the final product shown in the simulation panel. */
  productLabel?: string;
  variables?: SimulationVariableDef[];
}

export interface SimulationStepDef {
  id?: string;
  label?: string;
  description?: string;
  animationType?: 'pulse' | 'flow' | 'glow' | 'transform';
  duration?: number; // milliseconds
  order?: number;
}

export interface SimulationVariableDef {
  id: string;
  label: string;
  unit: string;
  initialValue: number;
  targetValue: number;
  stepId: string;
}

export interface HintDefinition {
  level: 1 | 2 | 3;
  title?: string;
  content?: string;
  revealedNodes?: string[];
  revealedConnections?: string[];
  pointCost?: number;
}

export interface CompletionData {
  title: string;
  summary: string;
  realWorldImpact?: string;
  nextLevelId?: string;
  achievements?: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  condition: 'no_hints' | 'no_wrong_connections' | 'fast_completion' | 'all_optional';
  badgeIcon: string;
}

export interface ScienceCard {
  organism: string;
  realWorldCase: string;
  scientificContext: string;
  gameplaySimplifications: string[];
  fictionalVisualElements?: string[];
  references: ScientificReference[];
}

export interface ScientificReference {
  authors: string[];
  year: number;
  title: string;
  journal?: string;
  doi?: string;
  url?: string;
  type: 'paper' | 'database' | 'book' | 'review';
}

export interface LevelSummary {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  difficulty: Difficulty;
  isTutorial: boolean;
  mode: LevelMode;
  estimatedDuration: number;
  connections: number;
  organism: string;
  kind: IllustrationKind;
}
