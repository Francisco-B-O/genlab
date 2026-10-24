"""Shared helpers of batch 5 (everyday cases): spec builders for every mode.

Unlike the older batches, importing this module writes nothing. The batches that use it
(`batch5a.py`, `batch5b.py`, `batch5c.py`) call `write_levels` at the end.
"""
import os, sys, random, itertools
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from levelgen import *

NOTHING = B('Nothing: it is where it starts.', 'Nada: es el punto de partida.')
ECOLI = ['Bacteria', 'Pseudomonadota', 'Gammaproteobacteria', 'Enterobacterales', 'Enterobacteriaceae', 'Escherichia']
PLANT = ['Plantae', 'Tracheophyta']
FUNGI = ['Fungi', 'Ascomycota', 'Saccharomycetes', 'Saccharomycetales', 'Saccharomycetaceae']
MAMMAL = ['Animalia', 'Chordata', 'Mammalia']


def org(id_, en, es, sci, desc, taxonomy=None, tissue='whole organism', organelle='cytoplasm'):
    return dict(id=id_, name=B(en, es), sci=sci, desc=desc, taxonomy=taxonomy or ['Eukaryota'], tissue=tissue, organelle=organelle)


def ref(authors, year, title, journal, doi=None, kind='paper'):
    r = {'authors': authors, 'year': year, 'title': title, 'journal': journal, 'type': kind}
    if doi:
        r['doi'] = doi
    return r


N = lambda i, t, label, desc, c, r: (i, t, label, desc, c, r)
R = lambda i, s, t, e, d: (i, s, t, e, d)


def ex(kind, label, title, desc):
    """One card of the exploration strip: ex('dna', B(..), B(..), B(..))."""
    return (kind, label, title, desc)


# ═════════════════════════ common closing fields ═════════════════════════

def closing(done_title, summary, impact, case, context, simplify, refs):
    return dict(done_title=done_title, summary=summary, impact=impact, case=case, context=context,
                simplify=simplify if isinstance(simplify, list) else [simplify], refs=refs)


# ═════════════════════════ pathway ═════════════════════════

def path_spec(id_, title, subtitle, diff, minutes, kind, objective, description, organism, explore, pathway, product, steps, hints, **end):
    return dict(id=id_, mode='pathway', kind=kind, title=title, subtitle=subtitle, difficulty=diff, minutes=minutes, objective=objective,
                description=description, organism=organism, exploration=explore, pathway=pathway, product=product, steps=steps, hints=hints, **end)


# ═════════════════════════ sequence ═════════════════════════

def seq_spec(id_, title, subtitle, diff, minutes, kind, objective, description, organism, explore, steps, product, hints, **end):
    return dict(id=id_, mode='sequence', kind=kind, title=title, subtitle=subtitle, difficulty=diff, minutes=minutes, objective=objective,
                description=description, organism=organism, exploration=explore, sequence=steps, product=product,
                steps=[(B('Start', 'Inicio'), B('The process begins.', 'Empieza el proceso.')),
                       (B('Middle', 'Desarrollo'), B('Each step prepares the next.', 'Cada paso prepara el siguiente.')),
                       (B('Result', 'Resultado'), B('The process ends.', 'El proceso termina.'))],
                hints=hints, **end)


# ═════════════════════════ inherit ═════════════════════════

def sc(p1, p2, l1, l2, q, target, why):
    return dict(p1=p1, p2=p2, l1=l1, l2=l2, q=q, target=target, why=why)


def inh_spec(id_, title, subtitle, diff, minutes, kind, objective, description, organism, explore, inherit, hints, **end):
    return dict(id=id_, mode='inherit', kind=kind, title=title, subtitle=subtitle, difficulty=diff, minutes=minutes, objective=objective,
                description=description, organism=organism, exploration=explore, inherit=inherit, product=B('Probability', 'Probabilidad'),
                steps=[(B('Parents', 'Progenitores'), B('Each gives one allele.', 'Cada uno da un alelo.')),
                       (B('Square', 'Cuadro'), B('All combinations.', 'Todas las combinaciones.')),
                       (B('Trait', 'Rasgo'), B('Read the result.', 'Lee el resultado.'))],
                hints=hints, **end)


# ═════════════════════════ mutation ═════════════════════════

def mut_spec(id_, title, subtitle, diff, minutes, kind, gene, reference, mutant, story, expl, explore, hints, organism, **end):
    return dict(id=id_, mode='mutation', kind=kind, title=title, subtitle=subtitle, difficulty=diff, minutes=minutes,
                objective=B('Find the letter that changed in the gene and say what the change does to the protein.',
                            'Encuentra la letra que ha cambiado en el gen y di qué efecto tiene en la proteína.'),
                description=B('A change of one letter in DNA can change an amino acid, cut a protein short, or do nothing at all. Compare the two sequences codon by codon.',
                              'Un cambio de una letra en el ADN puede cambiar un aminoácido, cortar una proteína o no hacer nada. Compara las dos secuencias codón a codón.'),
                organism=organism, exploration=explore, mutation=dict(gene=gene, reference=reference, mutant=mutant, story=story, explanations=expl),
                product=B('Effect', 'Efecto'),
                steps=[(B('Compare', 'Comparar'), B('Find the changed letter.', 'Encuentra la letra cambiada.')),
                       (B('Translate', 'Traducir'), B('Read the codons.', 'Lee los codones.')),
                       (B('Effect', 'Efecto'), B('Decide what it does.', 'Decide qué hace.'))],
                hints=hints, **end)


# ═════════════════════════ pairing ═════════════════════════

def pair_spec(id_, title, subtitle, diff, minutes, kind, template, story, objective, hints, explore, **end):
    return dict(id=id_, mode='pairing', kind='dna', title=title, subtitle=subtitle, difficulty=diff, minutes=minutes, objective=objective,
                description=B('Strands pair with strict rules. Work out each partner letter by letter, as the cell does.',
                              'Las hebras se emparejan con reglas estrictas. Averigua cada pareja letra a letra, como hace la célula.'),
                organism=org('pair-' + id_, 'A strand of nucleic acid', 'Una hebra de ácido nucleico', 'Nucleic acids', B('DNA and RNA strands.', 'Hebras de ADN y ARN.'), ['Molecule'], tissue='nucleus', organelle='nucleus'),
                exploration=explore, pairing=dict(kind=kind, template=template, story=story), product=B('Strand', 'Hebra'),
                steps=[(B('Template', 'Molde'), B('The strand that exists.', 'La hebra que ya existe.')),
                       (B('Pairs', 'Parejas'), B('Each base finds its partner.', 'Cada base encuentra a su pareja.')),
                       (B('Strand', 'Hebra'), B('The new strand is complete.', 'La hebra nueva está completa.'))],
                hints=hints, **end)


# ═════════════════════════ construct ═════════════════════════

def construct_spec(id_, title, subtitle, diff, minutes, kind, objective, description, organism, explore, construct, hints, steps, product, **end):
    return dict(id=id_, mode='construct', kind=kind, title=title, subtitle=subtitle, difficulty=diff, minutes=minutes, objective=objective,
                description=description, organism=organism, exploration=explore, construct=construct, product=product, steps=steps, hints=hints, **end)


# ═════════════════════════ tune ═════════════════════════

def opt(i, en, es, den, des, cost, per, gr):
    return (i, B(en, es), B(den, des), cost, per, gr)


def tune_outcomes(t):
    combos = list(itertools.product(*[k[2] for k in t['knobs']]))
    res = []
    for combo in combos:
        per = gr = 1
        cost = 0
        for o in combo:
            cost += o[3]; per *= o[4]; gr *= o[5]
        res.append((round(t['base'] * per * gr * 10) / 10, gr, cost, [o[0] for o in combo]))
    return res


def check_tune(spec):
    t = spec['tune']
    res = tune_outcomes(t)
    solved = [r for r in res if r[0] >= t['target'] and r[2] <= t['budget']]
    over = [r for r in res if r[0] >= t['target'] and r[2] > t['budget']]
    suffer = [r for r in res if r[2] <= t['budget'] and r[0] < t['target'] and r[1] < 0.6]
    assert len(solved) >= 2 and len(solved) / len(res) < 0.35 and over and suffer, (spec['id'], len(solved), len(res), len(over), len(suffer))


def tune_spec(id_, title, subtitle, diff, minutes, kind, objective, description, organism, explore, tune, hints, steps, **end):
    spec = dict(id=id_, mode='tune', kind=kind, title=title, subtitle=subtitle, difficulty=diff, minutes=minutes, objective=objective,
                description=description, organism=organism, exploration=explore, tune=tune, product=B(tune['metric'][0], tune['metric'][1]),
                steps=steps, hints=hints, **end)
    check_tune(spec)
    return spec


# ═════════════════════════ cut ═════════════════════════

ENZ = lambda eid, label, rec, sites: (eid, label, B('Recognises ' + rec + '.', 'Reconoce ' + rec + '.'), sites)


def cut_spec(id_, title, subtitle, diff, minutes, kind, objective, story, gene, length, enzymes, hints, explore, organism, **end):
    return dict(id=id_, mode='cut', kind=kind, title=title, subtitle=subtitle, difficulty=diff, minutes=minutes, objective=objective,
                description=B('Restriction enzymes are molecular scissors that cut at their own sequences. You need a cut right at each end of the gene and none inside it.',
                              'Las enzimas de restricción son tijeras moleculares que cortan en sus propias secuencias. Necesitas un corte justo en cada extremo del gen y ninguno dentro.'),
                organism=organism, exploration=explore, cut=dict(length=length, gene=gene, enzymes=enzymes, story=story), product=B('Gene', 'Gen'),
                steps=[(B('Cut', 'Cortar'), B('The enzymes cut the DNA at their sites.', 'Las enzimas cortan el ADN en sus sitios.')),
                       (B('Run the gel', 'Correr el gel'), B('The pieces separate by size.', 'Los trozos se separan por tamaño.')),
                       (B('Gene free', 'Gen libre'), B('The gene is a piece of its own.', 'El gen es un trozo por sí solo.'))],
                hints=hints, **end)


EPS = 1e-6


def cut_check(spec):
    """Python port of evaluateCut: lists the enzyme sets that free the gene, and the tempting ones that do not."""
    c = spec['cut']
    start, end = c['gene'][1], c['gene'][2]
    enz = {e[0]: e[3] for e in c['enzymes']}
    good, impostors = [], []
    for r in range(1, len(enz) + 1):
        for combo in itertools.combinations(enz, r):
            cuts = sorted({p for e in combo for p in enz[e]})
            pts = [0] + cuts + [c['length']]
            frags = [(a, b) for a, b in zip(pts, pts[1:])]
            iso = any(abs(a - start) < EPS and abs(b - end) < EPS for a, b in frags)
            inside = any(start + EPS < p < end - EPS for e in combo for p in enz[e])
            if iso:
                good.append(combo)
            elif any(abs((b - a) - (end - start)) < EPS and abs(a - start) > EPS for a, b in frags):
                impostors.append(combo)
    return good, impostors


# ═════════════════════════ assemble ═════════════════════════

def _overlap(a, b):
    for k in range(min(len(a), len(b)) - 1, 0, -1):
        if a.endswith(b[:k]):
            return k
    return 0


def _merge(frags):
    out = ''
    for i, f in enumerate(frags):
        out = f if i == 0 else out + f[_overlap(out, f):]
    return out


def _solved_orders(seq, frags, min_overlap):
    good, trap = [], []
    for perm in itertools.permutations(range(len(frags))):
        parts = [frags[i] for i in perm]
        if all(_overlap(parts[i], parts[i + 1]) >= min_overlap for i in range(len(parts) - 1)):
            (good if _merge(parts) == seq else trap).append(perm)
    return good, trap


def make_asm(seed, length, n, ov, want_trap, frag_min=8, frag_max=15, repeat=None):
    """Finds a sequence and n overlapping fragments with exactly one solving order."""
    rng = random.Random(seed)
    for _ in range(20000):
        seq = ''.join(rng.choice('ACGT') for _ in range(length))
        forced = []
        if repeat:
            r = ''.join(rng.choice('ACGT') for _ in range(repeat))
            a = rng.randrange(8, length // 2 - repeat - 2)
            b = rng.randrange(length // 2 + 3, length - repeat - 8)
            seq = seq[:a] + r + seq[a + repeat:b] + r + seq[b + repeat:]
            forced = [a + 1, b + 1]
        seq = 'ATG' + seq[3:]
        others = n - 1 - len(forced)
        pool = [c for c in range(frag_min, length - frag_min) if all(abs(c - f) >= frag_min - ov for f in forced)]
        if len(pool) < others:
            continue
        cuts = sorted(forced + rng.sample(pool, others))
        starts, ends = [0], []
        for c in cuts:
            ends.append(c + ov)
            starts.append(c)
        ends.append(length)
        frags = [seq[s:e] for s, e in zip(starts, ends)]
        if any(len(f) < frag_min or len(f) > frag_max for f in frags):
            continue
        if len(set(frags)) != n:
            continue
        good, trap = _solved_orders(seq, frags, ov)
        if len(good) == 1 and good[0] == tuple(range(n)) and bool(trap) == want_trap:
            return seq, frags
    raise SystemExit(f'no assembly found for seed {seed}')


def asm_spec(id_, title, subtitle, diff, minutes, kind, objective, story, seed, length, n, ov, trap, organism, extra_explore, hints_extra, repeat=None, **end):
    seq, frags = make_asm(seed, length, n, ov, trap, repeat=repeat)
    order = ' → '.join(frags)
    return dict(
        id=id_, mode='assemble', kind=kind, title=title, subtitle=subtitle, difficulty=diff, minutes=minutes, objective=objective,
        description=B('Machines read DNA in short pieces, never all at once. Neighbouring pieces share a few letters, and that overlap shows how to put them back together.',
                      'Las máquinas leen el ADN en trozos cortos, nunca de una vez. Los trozos vecinos comparten unas letras, y ese solape indica cómo volver a unirlos.'),
        organism=organism, exploration=extra_explore,
        assemble=dict(sequence=seq, fragments=frags, minOverlap=ov, story=story),
        product=B('Sequence', 'Secuencia'),
        steps=[(B('Reads', 'Lecturas'), B('The DNA is broken into short pieces.', 'El ADN se rompe en trozos cortos.')),
               (B('Overlaps', 'Solapes'), B('The software finds the letters shared by neighbours.', 'El programa encuentra las letras que comparten los vecinos.')),
               (B('Sequence', 'Secuencia'), B('The pieces are chained into the whole sequence.', 'Los trozos se encadenan en la secuencia completa.'))],
        hints=[B('Look for the letters that repeat at the end of one fragment and at the start of another.',
                 'Busca las letras que se repiten al final de un fragmento y al principio de otro.'),
               hints_extra,
               B('The order is: ' + order + '.', 'El orden es: ' + order + '.')],
        **end)


# ═════════════════════════ crispr ═════════════════════════

def _hamming(a, b):
    return sum(1 for x, y in zip(a, b) if x != y)


def _sites(genome, guide, mism):
    out = []
    for i in range(len(genome) - len(guide) + 1):
        mm = _hamming(genome[i:i + len(guide)], guide)
        if mm <= mism:
            pam = genome[i + len(guide):i + len(guide) + 3]
            out.append((i, mm, len(pam) == 3 and pam[1:] == 'GG'))
    return out


def _verdict(genome, guide, mism, start, end):
    s = _sites(genome, guide, mism)
    cuts = [x for x in s if x[2]]
    inside = [x for x in cuts if x[0] >= start and x[0] + len(guide) <= end]
    if not s: return 'nomatch'
    if not cuts: return 'nopam'
    if not inside: return 'elsewhere'
    if len(cuts) > len(inside): return 'offtarget'
    return 'perfect'


def _rnd(rng, n):
    return ''.join(rng.choice('ACGT') for _ in range(n))


def make_crispr(seed, glen, start, end, mism, design, L=8):
    rng = random.Random(seed)
    for _ in range(4000):
        g = list(_rnd(rng, glen))
        guides, planted = [], []

        def plant(pos, seq, pam):
            g[pos:pos + L] = list(seq)
            if pam is not None:
                g[pos + L:pos + L + 3] = list(pam)

        def free(lo, hi):
            for _ in range(60):
                p = rng.randrange(lo, hi - L - 3)
                if all(abs(p - q) > L + 4 for q in planted):
                    return p
            return None

        ok = True
        for gid, kind in design:
            seq = _rnd(rng, L)
            if kind == 'nomatch':
                guides.append((gid, seq)); continue
            if kind in ('perfect', 'offtarget'):
                p = free(start, end + 3)
                if p is None or p + L > end: ok = False; break
                plant(p, seq, rng.choice('ACGT') + 'GG'); planted.append(p)
                if kind == 'offtarget':
                    q = free(0, glen)
                    if q is None or (start - L - 4 < q < end + 3): ok = False; break
                    near = list(seq); k = rng.randrange(L // 2); near[k] = rng.choice([c for c in 'ACGT' if c != near[k]])
                    plant(q, ''.join(near), rng.choice('ACGT') + 'GG'); planted.append(q)
            elif kind == 'nopam':
                p = free(start, end + 3)
                if p is None or p + L > end: ok = False; break
                plant(p, seq, rng.choice('ACGT') + rng.choice(['AG', 'GA', 'CA', 'AC', 'TA'])); planted.append(p)
            elif kind == 'elsewhere':
                p = free(0, glen)
                if p is None or (start - L - 4 < p < end + 3): ok = False; break
                plant(p, seq, rng.choice('ACGT') + 'GG'); planted.append(p)
            guides.append((gid, seq))
        if not ok:
            continue
        genome = ''.join(g)
        if all(_verdict(genome, seq, mism, start, end) == kind for (gid, seq), (_, kind) in zip(guides, design)):
            return genome, guides
    raise SystemExit(f'no CRISPR design for seed {seed}')


def crispr_spec(id_, title, subtitle, diff, minutes, kind, objective, description, organism, explore, target_label, seed, glen, start, end, mism, design,
                story, hints, **end_fields):
    """`design` lists (guide id, verdict) in the order the guides appear; exactly one must be 'perfect'."""
    assert sum(1 for _, k in design if k == 'perfect') == 1, id_
    genome, guides = make_crispr(seed, glen, start, end, mism, design)
    return dict(id=id_, mode='crispr', kind=kind, title=title, subtitle=subtitle, difficulty=diff, minutes=minutes, objective=objective,
                description=description, organism=organism, exploration=explore,
                crispr=dict(genome=genome, target=(target_label, start, end), guides=guides, mismatches=mism, story=story),
                product=B('Cut', 'Corte'),
                steps=[(B('Guide', 'Guía'), B('The guide leads Cas9 to the target.', 'La guía lleva a Cas9 al objetivo.')),
                       (B('Cut', 'Corte'), B('Cas9 cuts the DNA.', 'Cas9 corta el ADN.')),
                       (B('Repair', 'Reparación'), B('The cell repairs it and the gene changes.', 'La célula lo repara y el gen cambia.'))],
                hints=hints, **end_fields)
