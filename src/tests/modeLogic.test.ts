import { describe, it, expect } from 'vitest';
import {
  shuffled, firstWrongStep, genotype, allGenotypes, punnett, probability,
  codonToAmino, translate, inheritAnswer, fractionLabel, mutationIndex, mutationKind, mutationSites, codonGroups, classifyMutation, evaluateTune,
  pairBase, rnaCodonToAmino, pairSlotCount, pairSolution, pairChoices, wrongPairs, geneticCodeTable,
  cutPositions, fragmentsOf, evaluateCut, gelPosition,
  overlapLength, mergeFragments, evaluateAssembly, matchesPam, bindingSites, evaluateGuide,
} from '../game/modes/logic';
import type {
  AssembleDefinition, CrisprDefinition, CutDefinition, InheritDefinition, PairDefinition, TuneDefinition,
} from '../types/level.types';

describe('sequence rules', () => {
  const steps = ['a', 'b', 'c', 'd', 'e'];

  it('shuffles deterministically and never returns the solution order', () => {
    expect(shuffled(steps, 'level-1')).toEqual(shuffled(steps, 'level-1'));
    expect(shuffled(steps, 'level-1')).not.toEqual(steps);
    expect([...shuffled(steps, 'x')].sort()).toEqual(steps);
  });

  it('finds the first wrong step', () => {
    expect(firstWrongStep(['a', 'b', 'c', 'd', 'e'], steps)).toBe(-1);
    expect(firstWrongStep(['a', 'c', 'b', 'd', 'e'], steps)).toBe(1);
    expect(firstWrongStep(['a', 'b'], steps)).toBe(2);
  });
});

describe('inheritance rules', () => {
  const pku: InheritDefinition = {
    trait: 'PKU', alleles: ['P', 'p'],
    phenotypes: { PP: 'unaffected', Pp: 'carrier', pp: 'affected' },
    phenotypeLabels: {}, scenarios: [],
  };
  const abo: InheritDefinition = {
    trait: 'ABO', alleles: ['A', 'B', 'O'],
    phenotypes: { AA: 'A', AO: 'A', BB: 'B', BO: 'B', AB: 'AB', OO: 'O' },
    phenotypeLabels: {}, scenarios: [],
  };

  it('keeps alleles in canonical order', () => {
    expect(genotype('p', 'P', pku.alleles)).toBe('Pp');
    expect(genotype('O', 'A', abo.alleles)).toBe('AO');
    expect(allGenotypes(abo.alleles)).toEqual(['AA', 'AB', 'AO', 'BB', 'BO', 'OO']);
  });

  it('two carriers: 1 in 4 children are affected, 1 in 2 are carriers', () => {
    const cells = punnett('Pp', 'Pp', pku.alleles);
    expect(cells).toEqual(['PP', 'Pp', 'Pp', 'pp']);
    expect(probability(cells, pku, 'affected')).toBe(25);
    expect(probability(cells, pku, 'carrier')).toBe(50);
  });

  it('a carrier with an unaffected parent never has affected children', () => {
    const cells = punnett('PP', 'Pp', pku.alleles);
    expect(probability(cells, pku, 'affected')).toBe(0);
    expect(probability(cells, pku, 'carrier')).toBe(50);
  });

  it('a carrier with an affected parent: half the children are affected', () => {
    expect(probability(punnett('Pp', 'pp', pku.alleles), pku, 'affected')).toBe(50);
  });

  it('blood groups A (AO) × B (BO): a quarter each of A, B, AB and O', () => {
    const cells = punnett('AO', 'BO', abo.alleles);
    (['A', 'B', 'AB', 'O'] as const).forEach(g => expect(probability(cells, abo, g)).toBe(25));
  });
});

describe('mutation rules', () => {
  it('reads the standard genetic code', () => {
    expect(codonToAmino('ATG')).toBe('Met');
    expect(codonToAmino('GAG')).toBe('Glu');
    expect(codonToAmino('GTG')).toBe('Val');
    expect(codonToAmino('TGG')).toBe('Trp');
    expect(codonToAmino('TGA')).toBe('Stop');
    expect(codonToAmino('TAA')).toBe('Stop');
    expect(() => codonToAmino('ANG')).toThrow();
  });

  it('translates the start of the human β-globin gene', () => {
    expect(translate('ATGGTGCATCTGACTCCTGAGGAGAAG'))
      .toEqual(['Met', 'Val', 'His', 'Leu', 'Thr', 'Pro', 'Glu', 'Glu', 'Lys']);
  });

  it('finds the single changed base', () => {
    expect(mutationIndex('ATGGAG', 'ATGGTG')).toBe(4);
    expect(() => mutationIndex('ATG', 'ATG')).toThrow();
    expect(() => mutationIndex('ATGGAG', 'ATTGTG')).toThrow();
    expect(() => mutationIndex('ATG', 'ATGA')).toThrow();
  });

  it('classifies the effect of the change', () => {
    expect(classifyMutation('ATGGAGAAG', 'ATGGTGAAG')).toBe('missense'); // Glu → Val
    expect(classifyMutation('ATGGAAAAG', 'ATGGAGAAG')).toBe('silent');   // Glu → Glu
    expect(classifyMutation('ATGTGGAAG', 'ATGTGAAAG')).toBe('nonsense'); // Trp → Stop
  });

  it('tells a changed letter from an added or a lost one', () => {
    expect(mutationKind('ATGGAG', 'ATGGTG')).toBe('substitution');
    expect(mutationKind('ATGGAG', 'ATGGTAG')).toBe('insertion');
    expect(mutationKind('ATGGAG', 'ATGAG')).toBe('deletion');
    expect(() => mutationKind('ATGGAG', 'ATGAAAAG')).toThrow();
  });

  it('finds the place of an extra or a missing letter, and accepts any place of a repeated letter', () => {
    expect(mutationSites('ATGGAG', 'ATGGTAG')).toEqual([4]);           // the extra T is in the patient's strand
    expect(mutationSites('ATGAAGCTG', 'ATGAGCTG')).toEqual([3, 4]);    // one of two A letters is missing from the healthy strand
    expect(mutationSites('ATGGAG', 'ATGGAGG')).toEqual([5, 6]);        // an extra G after a G: either one is the extra
    expect(() => mutationSites('ATGGAG', 'TTGGTAG')).toThrow();
  });

  it('classifies an added or a lost letter as a frameshift', () => {
    expect(classifyMutation('ATGAAGCAGGACTGG', 'ATGAAGCAGTGACTGG')).toBe('frameshift');
    expect(classifyMutation('ATGGCTAAGCTG', 'ATGGCTAGCTG')).toBe('frameshift');
  });

  it('groups the letters in threes and keeps the ones left over', () => {
    expect(codonGroups('ATGAAGCA')).toEqual(['ATG', 'AAG', 'CA']);
    expect(codonGroups('ATGAAG')).toEqual(['ATG', 'AAG']);
  });
});

describe('inheritance of two genes', () => {
  const gene = (alleles: string[], phenotypes: Record<string, string>) => ({ alleles, phenotypes, trait: '', phenotypeLabels: {} });
  const round = gene(['R', 'r'], { RR: 'round', Rr: 'round', rr: 'wrinkled' });
  const yellow = gene(['Y', 'y'], { YY: 'yellow', Yy: 'yellow', yy: 'green' });
  const def = { ...round, second: yellow, scenarios: [] };
  const sc = (p: [string, string, string, string], target: string, targetB: string) =>
    ({ id: 's', parent1: p[0], parent2: p[1], parent1b: p[2], parent2b: p[3], parent1Label: '', parent2Label: '', question: '', target, targetB, explanation: '' });

  it('multiplies the chances of the two genes', () => {
    expect(inheritAnswer(def, sc(['Rr', 'Rr', 'Yy', 'Yy'], 'round', 'yellow'))).toBe(56.25);    // 3/4 × 3/4 = 9/16
    expect(inheritAnswer(def, sc(['Rr', 'Rr', 'Yy', 'Yy'], 'wrinkled', 'green'))).toBe(6.25);   // 1/4 × 1/4 = 1/16
    expect(inheritAnswer(def, sc(['Rr', 'rr', 'Yy', 'yy'], 'round', 'green'))).toBe(25);        // 1/2 × 1/2 = 1/4
    expect(inheritAnswer(def, sc(['RR', 'rr', 'YY', 'yy'], 'round', 'yellow'))).toBe(100);
  });

  it('says the answer as a fraction', () => {
    expect([0, 6.25, 12.5, 18.75, 25, 37.5, 50, 56.25, 75, 100].map(fractionLabel))
      .toEqual(['0', '1/16', '1/8', '3/16', '1/4', '3/8', '1/2', '9/16', '3/4', '1']);
  });
});

describe('tuning rules', () => {
  const def: TuneDefinition = {
    metricLabel: 'Output', unit: '%', base: 10, target: 40, budget: 5,
    knobs: [
      { id: 'a', label: 'A', options: [
        { id: 'a1', label: '', description: '', cost: 1, perCell: 1, growth: 1 },
        { id: 'a2', label: '', description: '', cost: 3, perCell: 4, growth: 0.5 },
      ] },
      { id: 'b', label: 'B', options: [
        { id: 'b1', label: '', description: '', cost: 1, perCell: 1, growth: 1 },
        { id: 'b2', label: '', description: '', cost: 2, perCell: 2, growth: 1.1 },
      ] },
    ],
  };

  it('is incomplete until every knob has a choice', () => {
    const r = evaluateTune(def, { a: 'a1' });
    expect(r.complete).toBe(false);
    expect(r.solved).toBe(false);
  });

  it('multiplies the effects and adds up the costs', () => {
    const r = evaluateTune(def, { a: 'a2', b: 'b2' });
    expect(r.cost).toBe(5);
    expect(r.perCell).toBe(8);
    expect(r.growth).toBeCloseTo(0.55);
    expect(r.result).toBe(44);
    expect(r.solved).toBe(true);
  });

  it('fails when over budget, even if the target is reached', () => {
    const over = { ...def, budget: 4 };
    const r = evaluateTune(over, { a: 'a2', b: 'b2' });
    expect(r.reachesTarget).toBe(true);
    expect(r.withinBudget).toBe(false);
    expect(r.solved).toBe(false);
  });

  it('fails when the target is not reached', () => {
    expect(evaluateTune(def, { a: 'a1', b: 'b1' }).solved).toBe(false);
  });
});

describe('pairing rules', () => {
  const dna: PairDefinition = { kind: 'dna', template: 'TACGGATC', story: '' };
  const rna: PairDefinition = { kind: 'rna', template: 'TACCGATTCATT', story: '' };
  const protein: PairDefinition = { kind: 'protein', template: 'AUGGCUAAGUUUGGAUAA', story: '' };

  it('pairs A with T and C with G in DNA', () => {
    expect(pairBase('A', 'dna')).toBe('T');
    expect(pairBase('T', 'dna')).toBe('A');
    expect(pairBase('C', 'dna')).toBe('G');
    expect(pairBase('G', 'dna')).toBe('C');
    expect(() => pairBase('U', 'dna')).toThrow();
  });

  it('copies DNA into RNA with U in place of T', () => {
    expect(pairBase('A', 'rna')).toBe('U');
    expect(pairBase('T', 'rna')).toBe('A');
    expect(pairBase('C', 'rna')).toBe('G');
    expect(pairBase('G', 'rna')).toBe('C');
  });

  it('reads codons written with U', () => {
    expect(rnaCodonToAmino('AUG')).toBe('Met');
    expect(rnaCodonToAmino('UUU')).toBe('Phe');
    expect(rnaCodonToAmino('UAA')).toBe('Stop');
  });

  it('works out the answer of each kind', () => {
    expect(pairSolution(dna)).toEqual([...'ATGCCTAG']);
    expect(pairSolution(rna)).toEqual([...'AUGGCUAAGUAA']);
    expect(pairSolution(protein)).toEqual(['Met', 'Ala', 'Lys', 'Phe', 'Gly', 'Stop']);
    expect(pairSlotCount(dna)).toBe(8);
    expect(pairSlotCount(rna)).toBe(12);
    expect(pairSlotCount(protein)).toBe(6);
  });

  it('the RNA copied from a template reads as a protein', () => {
    const mrna = pairSolution(rna).join('');
    const aminos: string[] = [];
    for (let i = 0; i + 3 <= mrna.length; i += 3) aminos.push(rnaCodonToAmino(mrna.slice(i, i + 3)));
    expect(aminos).toEqual(['Met', 'Ala', 'Lys', 'Stop']);
  });

  it('offers the four bases, or the right amino acids plus decoys that are never right', () => {
    expect(pairChoices(dna)).toEqual(['A', 'T', 'C', 'G']);
    expect(pairChoices(rna)).toEqual(['A', 'U', 'C', 'G']);
    const tray = pairChoices(protein, 'seed');
    pairSolution(protein).forEach(a => expect(tray).toContain(a));
    expect(new Set(tray).size).toBe(tray.length);
    expect(tray.length).toBeGreaterThan(new Set(pairSolution(protein)).size);
    expect(pairChoices(protein, 'seed')).toEqual(tray);
  });

  it('finds the slots that are empty or wrong', () => {
    const right = pairSolution(dna);
    expect(wrongPairs(dna, right)).toEqual([]);
    expect(wrongPairs(dna, right.map((b, i) => (i === 2 ? 'A' : b)))).toEqual([2]);
    expect(wrongPairs(dna, right.map((b, i) => (i === 5 ? null : b)))).toEqual([5]);
    expect(wrongPairs(dna, [])).toHaveLength(8);
  });

  it('lists the whole genetic code: 21 entries and 64 codons', () => {
    const table = geneticCodeTable();
    expect(table).toHaveLength(21);
    expect(table.flatMap(r => r.codons)).toHaveLength(64);
    expect(table.find(r => r.amino === 'Met')?.codons).toEqual(['AUG']);
    expect(table.find(r => r.amino === 'Stop')?.codons.sort()).toEqual(['UAA', 'UAG', 'UGA']);
  });
});

describe('cutting rules', () => {
  const def: CutDefinition = {
    length: 14,
    gene: { label: 'gene', start: 4, end: 9 },
    story: '',
    enzymes: [
      { id: 'eco', label: 'EcoRI', description: '', sites: [4, 12] },
      { id: 'bam', label: 'BamHI', description: '', sites: [9] },
      { id: 'hind', label: 'HindIII', description: '', sites: [6.5] },
      { id: 'xho', label: 'XhoI', description: '', sites: [2, 11] },
    ],
  };

  it('puts the cuts of the chosen enzymes in order, without repeats', () => {
    expect(cutPositions(def, [])).toEqual([]);
    expect(cutPositions(def, ['eco', 'bam'])).toEqual([4, 9, 12]);
    expect(cutPositions(def, ['xho', 'eco'])).toEqual([2, 4, 11, 12]);
    expect(cutPositions({ ...def, enzymes: [{ id: 'a', label: '', description: '', sites: [4, 4, 0, 14, 20] }] }, ['a'])).toEqual([4]);
  });

  it('cuts the DNA into pieces that add up to its length', () => {
    expect(fragmentsOf(def, [])).toEqual([{ start: 0, end: 14, size: 14 }]);
    const pieces = fragmentsOf(def, ['eco', 'bam']);
    expect(pieces.map(f => f.size)).toEqual([4, 5, 3, 2]);
    expect(pieces.reduce((sum, f) => sum + f.size, 0)).toBe(14);
  });

  it('isolates the gene only with a cut at each end and none inside', () => {
    expect(evaluateCut(def, ['eco', 'bam']).isolates).toBe(true);
    expect(evaluateCut(def, ['eco', 'bam', 'xho']).isolates).toBe(true); // extra cuts elsewhere are harmless
    expect(evaluateCut(def, ['eco']).isolates).toBe(false);
    expect(evaluateCut(def, ['bam']).isolates).toBe(false);
    expect(evaluateCut(def, []).isolates).toBe(false);
  });

  it('reports the enzymes that break the gene', () => {
    const r = evaluateCut(def, ['eco', 'bam', 'hind']);
    expect(r.isolates).toBe(false);
    expect(r.cutsInside).toEqual(['hind']);
    expect(evaluateCut(def, ['eco', 'bam']).cutsInside).toEqual([]);
  });

  it('knows which ends of the gene are cut', () => {
    expect(evaluateCut(def, ['eco'])).toMatchObject({ cutAtStart: true, cutAtEnd: false });
    expect(evaluateCut(def, ['bam'])).toMatchObject({ cutAtStart: false, cutAtEnd: true });
  });

  it('spots a band of the gene size that is another piece', () => {
    // BamHI alone: pieces of 9 and 5 kb; the 5 kb one is the end of the DNA, not the gene
    const r = evaluateCut(def, ['bam']);
    expect(r.fragments.map(f => f.size)).toEqual([9, 5]);
    expect(r.impostor).toBe(true);
    expect(evaluateCut(def, ['eco']).impostor).toBe(false);
    expect(evaluateCut(def, ['eco', 'bam']).impostor).toBe(false);
  });

  it('runs small pieces farther down the gel', () => {
    expect(gelPosition(14, 14)).toBeCloseTo(0);
    expect(gelPosition(0.5, 14)).toBeCloseTo(1);
    expect(gelPosition(2, 14)).toBeGreaterThan(gelPosition(5, 14));
    expect(gelPosition(5, 14)).toBeGreaterThan(gelPosition(9, 14));
    expect(gelPosition(100, 14)).toBeCloseTo(0);
  });
});

describe('assembling rules', () => {
  const def: AssembleDefinition = {
    sequence: 'ATGGCCAAGTTTGGATAA',
    fragments: ['ATGGCCAAG', 'CAAGTTTGG', 'TTTGGATAA'],
    minOverlap: 3,
    story: '',
  };

  it('measures how far the end of one fragment matches the start of the next', () => {
    expect(overlapLength('ATGGCCAAG', 'CAAGTTTGG')).toBe(4);
    expect(overlapLength('CAAGTTTGG', 'TTTGGATAA')).toBe(5);
    expect(overlapLength('AAA', 'CCC')).toBe(0);
    expect(overlapLength('ATGC', 'ATGC')).toBe(0); // never the whole fragment
    expect(overlapLength('GGGA', 'AGGG')).toBe(1);
  });

  it('joins fragments letting them overlap', () => {
    expect(mergeFragments(['ATGGCCAAG', 'CAAGTTTGG', 'TTTGGATAA'])).toBe('ATGGCCAAGTTTGGATAA');
    expect(mergeFragments(['ATG'])).toBe('ATG');
    expect(mergeFragments([])).toBe('');
  });

  it('solves the right order only', () => {
    expect(evaluateAssembly(def, [0, 1, 2]).solved).toBe(true);
    expect(evaluateAssembly(def, [1, 0, 2]).solved).toBe(false);
    expect(evaluateAssembly(def, [2, 1, 0]).solved).toBe(false);
    expect(evaluateAssembly(def, [0, 1]).solved).toBe(false); // not all of them
  });

  it('points at the first join that does not fit', () => {
    expect(evaluateAssembly(def, [0, 1, 2]).badJoin).toBe(-1);
    expect(evaluateAssembly(def, [0, 2, 1]).badJoin).toBe(0);
    expect(evaluateAssembly(def, [1, 0, 2]).badJoin).toBe(0);
  });

  it('asks for a minimum overlap, not just any', () => {
    const strict = { ...def, minOverlap: 5 };
    expect(evaluateAssembly(strict, [0, 1, 2]).badJoin).toBe(0); // 4 letters is too few
  });
});

describe('CRISPR rules', () => {
  //            0         1         2         3         4
  //            0123456789012345678901234567890123456789012
  const genome = 'ATTGCAGTCCATGACCTAGGCTTAAGCGGATCCATGACCTTAGGCA';
  const def: CrisprDefinition = {
    genome,
    target: { label: 'gene', start: 10, end: 26 },
    mismatches: 0,
    story: '',
    guides: [
      { id: 'a', sequence: 'ATGACCTA' },   // at 10, inside the gene, followed by GGC: not a PAM
      { id: 'b', sequence: 'GGCTTAAG' },   // at 18, inside the gene, followed by CGG: a PAM
      { id: 'c', sequence: 'TTTTTTTT' },   // nowhere
      { id: 'd', sequence: 'ATGACCTT' },   // at 33, outside the gene, followed by AGG: a PAM
    ],
  };

  it('needs a PAM: any letter followed by GG', () => {
    expect(matchesPam('CGG')).toBe(true);
    expect(matchesPam('TGG')).toBe(true);
    expect(matchesPam('CGA')).toBe(false);
    expect(matchesPam('GG')).toBe(false);
    expect(matchesPam('')).toBe(false);
  });

  it('finds every place a guide pairs, and whether a PAM follows', () => {
    const sites = bindingSites(def, 'b');
    expect(sites).toEqual([{ index: 18, mismatches: 0, pam: true }]);
    expect(bindingSites(def, 'c')).toEqual([]);
    expect(bindingSites(def, 'nope')).toEqual([]);
  });

  it('a guide that cuts only inside the gene is perfect', () => {
    expect(evaluateGuide(def, 'b').verdict).toBe('perfect');
  });

  it('says why a guide fails', () => {
    expect(evaluateGuide(def, 'c').verdict).toBe('nomatch');
    expect(evaluateGuide(def, 'a').verdict).toBe('nopam');
    expect(evaluateGuide(def, 'd').verdict).toBe('elsewhere');
  });

  it('a site that differs by one letter still counts when the level allows it', () => {
    const loose = { ...def, mismatches: 1, guides: [{ id: 'x', sequence: 'ATGACCTA' }] };
    // exact site at 10 (no PAM), and the near copy 'ATGACCTT' at 33 (one letter off, with a PAM, outside the gene)
    const sites = bindingSites(loose, 'x');
    expect(sites.map(s => s.index)).toEqual([10, 33]);
    expect(sites.find(s => s.index === 33)).toMatchObject({ mismatches: 1, pam: true });
    expect(evaluateGuide(loose, 'x').verdict).toBe('elsewhere');
  });

  it('cutting inside the gene and also somewhere else is off-target', () => {
    const twice = {
      ...def,
      genome: 'CCGGCTTAAGTGGAAGGCTTAAGCGGCC',
      target: { label: 'gene', start: 2, end: 12 },
      guides: [{ id: 'y', sequence: 'GGCTTAAG' }],
    };
    const r = evaluateGuide(twice, 'y');
    expect(r.cuts).toHaveLength(2);
    expect(r.verdict).toBe('offtarget');
  });
});
