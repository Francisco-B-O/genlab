// Pure rules for the non-pathway level modes. No UI and no store in here,
// so every rule can be unit-tested on its own.

import type {
  AssembleDefinition, CrisprDefinition, CutDefinition, InheritDefinition, InheritScenario, PairDefinition, TuneDefinition,
} from '../../types/level.types';

// ───────────────────────── Sequence ("order the process") ─────────────────────────

/** Deterministic shuffle so a level always shows its steps in the same scrambled order. */
export function shuffled<T>(items: readonly T[], seed: string): T[] {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  // Never show the solution as the starting order
  if (out.length > 1 && out.every((x, i) => x === items[i])) out.reverse();
  return out;
}

/** Index of the first step that is out of place, or -1 if the order is right. */
export function firstWrongStep(order: readonly string[], solution: readonly string[]): number {
  return solution.findIndex((id, i) => order[i] !== id);
}

// ───────────────────────── Inheritance (Punnett squares) ─────────────────────────

/** Genotype with its two alleles in the level's canonical order, e.g. ('p','P') → 'Pp'. */
export function genotype(a: string, b: string, alleles: readonly string[]): string {
  return alleles.indexOf(a) <= alleles.indexOf(b) ? a + b : b + a;
}

export function allGenotypes(alleles: readonly string[]): string[] {
  const out: string[] = [];
  alleles.forEach((a, i) => alleles.slice(i).forEach(b => out.push(a + b)));
  return out;
}

/** The genotypes a child can have in a level: its own list, or every pair of alleles. */
export function genotypeOptions(def: { alleles: readonly string[]; genotypes?: readonly string[] }): string[] {
  return def.genotypes ? [...def.genotypes] : allGenotypes(def.alleles);
}

/** The four children of a cross, row by row: [p1a×p2a, p1a×p2b, p1b×p2a, p1b×p2b]. */
export function punnett(p1: string, p2: string, alleles: readonly string[]): string[] {
  return [
    genotype(p1[0], p2[0], alleles), genotype(p1[0], p2[1], alleles),
    genotype(p1[1], p2[0], alleles), genotype(p1[1], p2[1], alleles),
  ];
}

/** Percentage of children (0, 25, 50, 75 or 100) showing the target phenotype. */
export function probability(cells: readonly string[], def: { phenotypes: Record<string, string> }, target: string): number {
  const hits = cells.filter(g => def.phenotypes[g] === target).length;
  return (hits / cells.length) * 100;
}

/** How many squares a level has: one per gene. Each has four cells. */
export function inheritCellCount(def: InheritDefinition): number {
  return def.second ? 8 : 4;
}

/**
 * The right answer of a scenario, in percent. With two genes it is the chance of the first trait
 * times the chance of the second: genes that are inherited separately multiply.
 */
export function inheritAnswer(def: InheritDefinition, sc: InheritScenario): number {
  const first = probability(punnett(sc.parent1, sc.parent2, def.alleles), def, sc.target);
  if (!def.second) return first;
  if (!sc.parent1b || !sc.parent2b || !sc.targetB) throw new Error(`Scenario ${sc.id} lacks its second gene`);
  const second = probability(punnett(sc.parent1b, sc.parent2b, def.second.alleles), def.second, sc.targetB);
  return (first * second) / 100;
}

/** The answers offered in a two-gene level, in percent: the multiples of a sixteenth that matter. */
export const SIXTEENTHS: readonly number[] = [0, 6.25, 12.5, 18.75, 25, 37.5, 50, 56.25, 75, 100];

/** A percentage as the fraction a geneticist would say: 56.25 → "9/16". */
export function fractionLabel(percent: number): string {
  if (percent === 0) return '0';
  if (percent === 100) return '1';
  const sixteenths = Math.round((percent / 100) * 16);
  let [n, d] = [sixteenths, 16];
  while (n % 2 === 0 && d > 1) { n /= 2; d /= 2; }
  return `${n}/${d}`;
}

// ───────────────────────── Mutation ─────────────────────────

const BASES = 'TCAG';
const AMINO = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';

/** Standard genetic code, three-letter amino acid names; '***' marks a stop codon. */
const THREE: Record<string, string> = {
  F: 'Phe', L: 'Leu', S: 'Ser', Y: 'Tyr', C: 'Cys', W: 'Trp', P: 'Pro', H: 'His', Q: 'Gln',
  R: 'Arg', I: 'Ile', M: 'Met', T: 'Thr', N: 'Asn', K: 'Lys', V: 'Val', A: 'Ala', D: 'Asp',
  E: 'Glu', G: 'Gly', '*': 'Stop',
};

export function codonToAmino(codon: string): string {
  const [a, b, c] = [...codon.toUpperCase()].map(x => BASES.indexOf(x));
  if (a < 0 || b < 0 || c < 0) throw new Error(`Invalid codon "${codon}"`);
  return THREE[AMINO[a * 16 + b * 4 + c]];
}

export function codons(seq: string): string[] {
  const out: string[] = [];
  for (let i = 0; i + 3 <= seq.length; i += 3) out.push(seq.slice(i, i + 3));
  return out;
}

export function translate(seq: string): string[] {
  return codons(seq).map(codonToAmino);
}

/** Index of the single base that differs between two sequences of the same length. */
export function mutationIndex(reference: string, mutant: string): number {
  if (reference.length !== mutant.length) throw new Error('Sequences must have the same length');
  const diffs = [...reference].flatMap((base, i) => (base !== mutant[i] ? [i] : []));
  if (diffs.length !== 1) throw new Error(`Expected exactly one difference, found ${diffs.length}`);
  return diffs[0];
}

export type MutationEffect = 'silent' | 'missense' | 'nonsense' | 'frameshift';

export type MutationKind = 'substitution' | 'insertion' | 'deletion';

/** One changed letter, one letter more in the patient, or one letter less. */
export function mutationKind(reference: string, mutant: string): MutationKind {
  const d = mutant.length - reference.length;
  if (d === 0) return 'substitution';
  if (d === 1) return 'insertion';
  if (d === -1) return 'deletion';
  throw new Error('A mutation changes one letter, or adds or removes one');
}

/**
 * Positions the player can tap to find the change, in the row where it is tapped (the patient's
 * for a changed or extra letter, the healthy one for a missing letter). An extra or missing letter
 * that repeats its neighbour can be pointed at in several places, and any of them is right.
 */
export function mutationSites(reference: string, mutant: string): number[] {
  const kind = mutationKind(reference, mutant);
  if (kind === 'substitution') return [mutationIndex(reference, mutant)];
  const [longer, shorter] = kind === 'insertion' ? [mutant, reference] : [reference, mutant];
  const sites = [...longer].flatMap((_, i) => (longer.slice(0, i) + longer.slice(i + 1) === shorter ? [i] : []));
  if (sites.length === 0) throw new Error('The strands differ by more than one letter');
  return sites;
}

/** Codons of a strand, with the one or two letters left over at the end as a last, short group. */
export function codonGroups(seq: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < seq.length; i += 3) out.push(seq.slice(i, i + 3));
  return out;
}

export function classifyMutation(reference: string, mutant: string): MutationEffect {
  if (mutationKind(reference, mutant) !== 'substitution') return 'frameshift';
  const i = Math.floor(mutationIndex(reference, mutant) / 3);
  const before = codonToAmino(codons(reference)[i]);
  const after = codonToAmino(codons(mutant)[i]);
  if (before === after) return 'silent';
  return after === 'Stop' ? 'nonsense' : 'missense';
}

// ───────────────────────── Tuning a factory ─────────────────────────

export interface TuneResult {
  perCell: number;
  growth: number;
  result: number;
  cost: number;
  complete: boolean;
  withinBudget: boolean;
  reachesTarget: boolean;
  solved: boolean;
}

/** Evaluates the chosen option of every knob. Unchosen knobs make the setup incomplete. */
export function evaluateTune(def: TuneDefinition, choices: Record<string, string | undefined>): TuneResult {
  let perCell = 1;
  let growth = 1;
  let cost = 0;
  let complete = true;

  for (const knob of def.knobs) {
    const option = knob.options.find(o => o.id === choices[knob.id]);
    if (!option) { complete = false; continue; }
    perCell *= option.perCell;
    growth *= option.growth;
    cost += option.cost;
  }

  const result = Math.round(def.base * perCell * growth * 10) / 10;
  const withinBudget = cost <= def.budget;
  const reachesTarget = result >= def.target;
  return { perCell, growth, result, cost, complete, withinBudget, reachesTarget, solved: complete && withinBudget && reachesTarget };
}

// ───────────────────────── Pairing (strands and codons) ─────────────────────────

const DNA_PAIR: Record<string, string> = { A: 'T', T: 'A', C: 'G', G: 'C' };
/** Copying a DNA template into messenger RNA: there is no T in RNA, its A pairs with U. */
const RNA_COPY: Record<string, string> = { A: 'U', T: 'A', C: 'G', G: 'C' };

/** The base that pairs with `base` when writing a DNA strand or copying it into RNA. */
export function pairBase(base: string, kind: 'dna' | 'rna'): string {
  const out = (kind === 'dna' ? DNA_PAIR : RNA_COPY)[base];
  if (!out) throw new Error(`Invalid base "${base}" for ${kind}`);
  return out;
}

/** Amino acid of a codon written with RNA letters (U instead of T). */
export function rnaCodonToAmino(codon: string): string {
  return codonToAmino(codon.toUpperCase().replace(/U/g, 'T'));
}

/** Number of things the player writes: one per base, or one per codon for a protein. */
export function pairSlotCount(def: PairDefinition): number {
  return def.kind === 'protein' ? def.template.length / 3 : def.template.length;
}

/** What goes in each slot. */
export function pairSolution(def: PairDefinition): string[] {
  if (def.kind === 'protein') return codons(def.template).map(rnaCodonToAmino);
  return [...def.template].map(b => pairBase(b, def.kind as 'dna' | 'rna'));
}

/** Amino acids that look plausible but are never the answer of a level. */
const DECOYS = ['Leu', 'Ser', 'Val', 'Pro', 'Thr', 'Arg', 'Ile', 'Asn'];

/** The choices of the tray: the four bases, or the right amino acids plus a few decoys. */
export function pairChoices(def: PairDefinition, seed = ''): string[] {
  if (def.kind === 'dna') return ['A', 'T', 'C', 'G'];
  if (def.kind === 'rna') return ['A', 'U', 'C', 'G'];
  const needed = [...new Set(pairSolution(def))];
  const decoys = DECOYS.filter(a => !needed.includes(a)).slice(0, 3);
  return shuffled([...needed, ...decoys], seed);
}

/** Slots that are empty or wrong. */
export function wrongPairs(def: PairDefinition, answer: readonly (string | null)[]): number[] {
  const solution = pairSolution(def);
  return solution.flatMap((value, i) => (answer[i] === value ? [] : [i]));
}

/** The genetic code as a table: every amino acid with the RNA codons that stand for it. */
export function geneticCodeTable(): Array<{ amino: string; codons: string[] }> {
  const table = new Map<string, string[]>();
  for (const a of 'UCAG') for (const b of 'UCAG') for (const c of 'UCAG') {
    const codon = a + b + c;
    const amino = rnaCodonToAmino(codon);
    table.set(amino, [...(table.get(amino) ?? []), codon]);
  }
  return [...table.entries()].map(([amino, list]) => ({ amino, codons: list }));
}

// ───────────────────────── Cutting DNA (restriction enzymes and gels) ─────────────────────────

const EPS = 1e-6;
const same = (a: number, b: number) => Math.abs(a - b) < EPS;
const round3 = (n: number) => Math.round(n * 1000) / 1000;

/** Where the chosen enzymes cut: sorted, without repeats, and only inside the stretch. */
export function cutPositions(def: CutDefinition, chosen: readonly string[]): number[] {
  const sites = def.enzymes
    .filter(e => chosen.includes(e.id))
    .flatMap(e => e.sites)
    .filter(p => p > EPS && p < def.length - EPS)
    .map(round3);
  return [...new Set(sites)].sort((a, b) => a - b);
}

export interface Fragment { start: number; end: number; size: number }

/** The pieces the DNA is cut into, from left to right. */
export function fragmentsOf(def: CutDefinition, chosen: readonly string[]): Fragment[] {
  const edges = [0, ...cutPositions(def, chosen), def.length];
  return edges.slice(1).map((end, i) => ({ start: edges[i], end, size: round3(end - edges[i]) }));
}

export interface CutResult {
  fragments: Fragment[];
  /** The gene comes out as a fragment of its own. */
  isolates: boolean;
  /** Enzymes that cut inside the gene and break it. */
  cutsInside: string[];
  cutAtStart: boolean;
  cutAtEnd: boolean;
  /** Some other fragment has the size of the gene, so its band looks right but is not the gene. */
  impostor: boolean;
}

export function evaluateCut(def: CutDefinition, chosen: readonly string[]): CutResult {
  const { start, end } = def.gene;
  const fragments = fragmentsOf(def, chosen);
  const cuts = cutPositions(def, chosen);
  const isolates = fragments.some(f => same(f.start, start) && same(f.end, end));
  const cutsInside = def.enzymes
    .filter(e => chosen.includes(e.id) && e.sites.some(p => p > start + EPS && p < end - EPS))
    .map(e => e.id);
  const impostor = !isolates && fragments.some(f => same(f.size, end - start) && !same(f.start, start));
  return {
    fragments, isolates, cutsInside, impostor,
    cutAtStart: cuts.some(p => same(p, start)),
    cutAtEnd: cuts.some(p => same(p, end)),
  };
}

/** Where a band of `size` kb ends up in the gel: 0 at the wells (top) and 1 at the far end. Small pieces run farther. */
export function gelPosition(size: number, longest: number, shortest = 0.5): number {
  const s = Math.min(longest, Math.max(shortest, size));
  return 1 - Math.log(s / shortest) / Math.log(longest / shortest);
}

// ───────────────────────── Assembling a sequence from fragments ─────────────────────────

/** How many letters the end of `a` shares with the start of `b` (never the whole of `b`). */
export function overlapLength(a: string, b: string): number {
  for (let k = Math.min(a.length, b.length) - 1; k > 0; k--) {
    if (a.endsWith(b.slice(0, k))) return k;
  }
  return 0;
}

/** Joins fragments one after another, letting each overlap the end of the previous ones. */
export function mergeFragments(fragments: readonly string[]): string {
  return fragments.reduce((joined, f, i) => (i === 0 ? f : joined + f.slice(overlapLength(joined, f))), '');
}

export interface AssembleResult {
  /** Position of the first fragment that does not overlap the next one enough, or -1. */
  badJoin: number;
  merged: string;
  solved: boolean;
}

export function evaluateAssembly(def: AssembleDefinition, order: readonly number[]): AssembleResult {
  const parts = order.map(i => def.fragments[i]);
  const badJoin = parts.findIndex((part, i) => i < parts.length - 1 && overlapLength(part, parts[i + 1]) < def.minOverlap);
  const merged = mergeFragments(parts);
  return { badJoin, merged, solved: badJoin === -1 && order.length === def.fragments.length && merged === def.sequence };
}

// ───────────────────────── CRISPR: choosing a guide ─────────────────────────

/** Cas9 only cuts where the site is followed by a PAM: any letter and then GG. */
export function matchesPam(text: string): boolean {
  return text.length === 3 && text.slice(1) === 'GG';
}

const differences = (a: string, b: string) => [...a].reduce((n, c, i) => n + (c === b[i] ? 0 : 1), 0);

export interface BindingSite {
  index: number;
  mismatches: number;
  /** A PAM follows the site, so Cas9 cuts here. */
  pam: boolean;
}

/** Everywhere the guide pairs with the genome, with or without a PAM. */
export function bindingSites(def: CrisprDefinition, guideId: string): BindingSite[] {
  const guide = def.guides.find(g => g.id === guideId)?.sequence;
  if (!guide) return [];
  const sites: BindingSite[] = [];
  for (let i = 0; i + guide.length <= def.genome.length; i++) {
    const mismatches = differences(def.genome.slice(i, i + guide.length), guide);
    if (mismatches <= def.mismatches) {
      sites.push({ index: i, mismatches, pam: matchesPam(def.genome.slice(i + guide.length, i + guide.length + 3)) });
    }
  }
  return sites;
}

/**
 * - perfect: Cas9 cuts, and only inside the gene
 * - nomatch: the guide pairs with nothing
 * - nopam: it pairs, but no PAM follows, so Cas9 does not cut
 * - elsewhere: it cuts, but not inside the gene
 * - offtarget: it cuts inside the gene and also somewhere else
 */
export type GuideVerdict = 'perfect' | 'nomatch' | 'nopam' | 'elsewhere' | 'offtarget';

export interface GuideResult {
  sites: BindingSite[];
  cuts: BindingSite[];
  verdict: GuideVerdict;
}

export function evaluateGuide(def: CrisprDefinition, guideId: string): GuideResult {
  const sites = bindingSites(def, guideId);
  const cuts = sites.filter(s => s.pam);
  const length = def.guides.find(g => g.id === guideId)?.sequence.length ?? 0;
  const inside = cuts.filter(s => s.index >= def.target.start && s.index + length <= def.target.end);
  const verdict: GuideVerdict =
    sites.length === 0 ? 'nomatch'
    : cuts.length === 0 ? 'nopam'
    : inside.length === 0 ? 'elsewhere'
    : cuts.length > inside.length ? 'offtarget'
    : 'perfect';
  return { sites, cuts, verdict };
}
