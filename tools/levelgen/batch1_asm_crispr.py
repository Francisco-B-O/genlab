import os
import sys, random, itertools
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from levelgen import *

# ───────── Python ports of the game logic, to design levels that really work ─────────

def overlap(a, b):
    for k in range(min(len(a), len(b)) - 1, 0, -1):
        if a.endswith(b[:k]):
            return k
    return 0

def merge(frags):
    out = ''
    for i, f in enumerate(frags):
        out = f if i == 0 else out + f[overlap(out, f):]
    return out

def solved_orders(seq, frags, min_overlap):
    """Orders whose joins all fit, split into (solving, tricking)."""
    good, trap = [], []
    for perm in itertools.permutations(range(len(frags))):
        parts = [frags[i] for i in perm]
        if all(overlap(parts[i], parts[i + 1]) >= min_overlap for i in range(len(parts) - 1)):
            (good if merge(parts) == seq else trap).append(perm)
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
            # one cut inside each copy of the repeat: the two overlaps are then the same letters
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
        good, trap = solved_orders(seq, frags, ov)
        if len(good) == 1 and good[0] == tuple(range(n)) and bool(trap) == want_trap:
            return seq, frags
    raise SystemExit(f'no assembly found for seed {seed}')

# ───────── assemble levels ─────────

SANGER = {'authors': ['Sanger, F.', 'Air, G. M.', 'Barrell, B. G.', 'Brown, N. L.', 'Coulson, A. R.'], 'year': 1977,
          'title': 'Nucleotide sequence of bacteriophage φX174 DNA', 'journal': 'Nature', 'doi': '10.1038/265687a0', 'type': 'paper'}

def asm_spec(id_, title, subtitle, diff, minutes, objective, story, seed, length, n, ov, trap, extra_explore, hints_extra, repeat=None):
    seq, frags = make_asm(seed, length, n, ov, trap, repeat=repeat)
    order = ' → '.join(frags)
    return dict(
        id=id_, mode='assemble', kind='dna', title=title, subtitle=subtitle, difficulty=diff, minutes=minutes,
        objective=objective,
        description=B('Machines read DNA in short pieces, never all at once. Neighbouring pieces share a few letters, and that overlap shows how to put them back together.',
                      'Las máquinas leen el ADN en trozos cortos, nunca de una vez. Los trozos vecinos comparten unas letras, y ese solape indica cómo volver a unirlos.'),
        organism=dict(id='dna-pieces', name=B('DNA read in pieces', 'ADN leído en trozos'), sci=B('Genome assembly', 'Ensamblaje de genomas'),
                      taxonomy=['Method'], tissue='nucleus', organelle='nucleus',
                      desc=B('A sequence rebuilt from many short, overlapping pieces.', 'Una secuencia reconstruida a partir de muchos trozos cortos que se solapan.')),
        exploration=[
            ('dna', B('Reads', 'Lecturas'), B('Only short pieces', 'Solo trozos cortos'),
             B('A sequencing machine reads only a few hundred letters at a time, so long DNA is first broken into many short pieces.',
               'Una máquina de secuenciar lee solo unos cientos de letras cada vez, así que el ADN largo se rompe antes en muchos trozos cortos.')),
            ('dna', B('Overlaps', 'Solapes'), B('Neighbours share letters', 'Los vecinos comparten letras'),
             B('The pieces are cut at random, so they overlap. Where the end of one matches the start of another, they must be neighbours.',
               'Los trozos se cortan al azar, así que se solapan. Donde el final de uno coincide con el principio de otro, son vecinos.')),
        ] + extra_explore,
        assemble=dict(sequence=seq, fragments=frags, minOverlap=ov, story=story),
        product=B('Sequence', 'Secuencia'),
        steps=[(B('Reads', 'Lecturas'), B('The DNA is broken into short pieces.', 'El ADN se rompe en trozos cortos.')),
               (B('Overlaps', 'Solapes'), B('The software finds the letters shared by neighbours.', 'El programa encuentra las letras que comparten los vecinos.')),
               (B('Sequence', 'Secuencia'), B('The pieces are chained into the whole sequence.', 'Los trozos se encadenan en la secuencia completa.'))],
        hints=[
            B('Look for the letters that repeat at the end of one fragment and at the start of another.',
              'Busca las letras que se repiten al final de un fragmento y al principio de otro.'),
            hints_extra,
            B('The order is: ' + order + '.', 'El orden es: ' + order + '.'),
        ],
        done_title=B('Puzzle solved', 'Rompecabezas resuelto'),
        summary=B('You rebuilt a sequence from overlapping pieces. Sequencing machines do exactly this with millions of pieces.',
                  'Has reconstruido una secuencia a partir de trozos que se solapan. Las máquinas de secuenciar hacen exactamente esto con millones de trozos.'),
        impact=B('Every genome ever read, from bacteria to people, was put together this way, with computers doing the matching.',
                 'Todos los genomas leídos, de bacterias a personas, se montaron así, con ordenadores haciendo las comparaciones.'),
        case=B('In 1977 Frederick Sanger\'s team read the first complete DNA genome, the virus φX174, about 5,400 letters long. Today genomes are read by breaking the DNA into short random pieces and letting computers put them back in order.',
               'En 1977 el equipo de Frederick Sanger leyó el primer genoma de ADN completo, el del virus φX174, de unas 5 400 letras. Hoy los genomas se leen rompiendo el ADN en trozos cortos al azar y dejando que los ordenadores los pongan en orden.'),
        context=B('A sequencer produces millions of short reads. Software finds the overlaps between them and chains them into longer stretches until the whole genome is rebuilt.',
                  'Un secuenciador produce millones de lecturas cortas. Un programa encuentra los solapes entre ellas y las encadena en tramos más largos hasta reconstruir el genoma entero.'),
        simplify=[B('The fragments here have 8 to 14 letters; real reads have hundreds.', 'Los fragmentos de aquí tienen de 8 a 14 letras; las lecturas reales tienen cientos.'),
                  B('Real assembly also has to deal with reading errors and with both strands of the DNA.', 'El ensamblaje real también tiene que lidiar con errores de lectura y con las dos hebras del ADN.')],
        refs=[SANGER],
    )

asm = [
    asm_spec('asm-1', B('A gene in three pieces', 'Un gen en tres trozos'), B('Pieces that overlap', 'Trozos que se solapan'), 'beginner', 4,
             B('Put three fragments in order so that their overlaps match and the whole sequence appears.',
               'Ordena tres fragmentos para que sus solapes coincidan y aparezca la secuencia completa.'),
             B('Three pieces of a gene, shuffled. Find the overlaps.', 'Tres trozos de un gen, mezclados. Busca los solapes.'),
             seed=11, length=26, n=3, ov=4, trap=False, extra_explore=[],
             hints_extra=B('The first fragment is the one whose start is not the end of any other fragment.',
                           'El primer fragmento es aquel cuyo principio no es el final de ningún otro.')),
    asm_spec('asm-2', B('A longer gene', 'Un gen más largo'), B('Five pieces to chain', 'Cinco trozos que encadenar'), 'beginner', 5,
             B('Chain five fragments, one after another, until the whole gene appears.',
               'Encadena cinco fragmentos, uno tras otro, hasta que aparezca el gen completo.'),
             B('Five reads of the same gene. Each one overlaps the next.', 'Cinco lecturas del mismo gen. Cada una se solapa con la siguiente.'),
             seed=23, length=40, n=5, ov=4, trap=False, extra_explore=[],
             hints_extra=B('Start with the fragment that begins with ATG, then look for the one that starts with the last letters of the previous one.',
                           'Empieza por el fragmento que comienza con ATG y busca el que arranca con las últimas letras del anterior.')),
    asm_spec('asm-3', B('The repeat that fools you', 'El repetido que engaña'), B('Same letters, two places', 'Mismas letras, dos sitios'), 'intermediate', 7,
             B('Rebuild the sequence. Some letters appear twice in it, so more than one join looks right: check the total length.',
               'Reconstruye la secuencia. Algunas letras aparecen dos veces, así que más de una unión parece buena: comprueba la longitud total.'),
             B('The sequence contains a repeat: the same letters in two places.', 'La secuencia contiene un repetido: las mismas letras en dos sitios.'),
             seed=31, length=44, n=6, ov=4, trap=True, repeat=5,
             extra_explore=[('dna', B('Repeats', 'Repetidos'), B('The hard part of assembly', 'Lo difícil del ensamblaje'),
                             B('Genomes are full of repeated stretches. A fragment inside a repeat can match two different places, which is what makes assembly hard.',
                               'Los genomas están llenos de tramos repetidos. Un fragmento dentro de un repetido puede encajar en dos sitios distintos, y eso es lo que complica el ensamblaje.'))],
             hints_extra=B('If every join fits but the length is wrong, two fragments are swapped around a repeat. Compare the length of your sequence with the goal.',
                           'Si todas las uniones encajan pero la longitud no cuadra, dos fragmentos están cambiados alrededor de un repetido. Compara la longitud de tu secuencia con la meta.')),
    asm_spec('asm-4', B('Reading a small genome', 'Leer un genoma pequeño'), B('Seven pieces, one repeat', 'Siete trozos, un repetido'), 'intermediate', 9,
             B('Assemble a small genome from seven reads. Watch out for the repeat.',
               'Ensambla un genoma pequeño a partir de siete lecturas. Cuidado con el repetido.'),
             B('A tiny genome, read in seven pieces. Put it back together.', 'Un genoma diminuto, leído en siete trozos. Vuelve a montarlo.'),
             seed=47, length=52, n=7, ov=4, trap=True, repeat=5,
             extra_explore=[('bacterium', B('Genome', 'Genoma'), B('From reads to a genome', 'De lecturas a un genoma'),
                             B('Once every piece is in place, the whole genome can be read from start to end and its genes can be found.',
                               'Cuando cada trozo está en su sitio, el genoma entero se puede leer de principio a fin y encontrar sus genes.'))],
             hints_extra=B('Place the fragment that starts with ATG first, then keep chaining. At a repeat, check which neighbour fits the following fragment too.',
                           'Pon primero el fragmento que empieza por ATG y sigue encadenando. En un repetido, mira qué vecino encaja también con el fragmento siguiente.')),
]

# ───────── CRISPR levels ─────────

JINEK = {'authors': ['Jinek, M.', 'Chylinski, K.', 'Fonfara, I.', 'Hauer, M.', 'Doudna, J. A.', 'Charpentier, E.'], 'year': 2012,
         'title': 'A programmable dual-RNA–guided DNA endonuclease in adaptive bacterial immunity', 'journal': 'Science',
         'doi': '10.1126/science.1225829', 'type': 'paper'}
WANG = {'authors': ['Wang, Y.', 'Cheng, X.', 'Shan, Q.', 'Zhang, Y.', 'Liu, J.', 'Gao, C.', 'Qiu, J.-L.'], 'year': 2014,
        'title': 'Simultaneous editing of three homoeoalleles in hexaploid bread wheat confers heritable resistance to powdery mildew',
        'journal': 'Nature Biotechnology', 'doi': '10.1038/nbt.2969', 'type': 'paper'}

def hamming(a, b):
    return sum(1 for x, y in zip(a, b) if x != y)

def sites(genome, guide, mism):
    out = []
    for i in range(len(genome) - len(guide) + 1):
        mm = hamming(genome[i:i + len(guide)], guide)
        if mm <= mism:
            pam = genome[i + len(guide):i + len(guide) + 3]
            out.append((i, mm, len(pam) == 3 and pam[1:] == 'GG'))
    return out

def verdict(genome, guide, mism, start, end):
    s = sites(genome, guide, mism)
    cuts = [x for x in s if x[2]]
    inside = [x for x in cuts if x[0] >= start and x[0] + len(guide) <= end]
    if not s: return 'nomatch'
    if not cuts: return 'nopam'
    if not inside: return 'elsewhere'
    if len(cuts) > len(inside): return 'offtarget'
    return 'perfect'

def rnd(rng, n):
    return ''.join(rng.choice('ACGT') for _ in range(n))

def make_crispr(seed, glen, start, end, mism, design, L=8):
    """design: list of (id, kind). kinds: perfect, nomatch, nopam, elsewhere, offtarget.
    Plants sites in a random genome and checks every guide gets the planned verdict."""
    rng = random.Random(seed)
    for _ in range(3000):
        g = list(rnd(rng, glen))
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
            seq = rnd(rng, L)
            if kind == 'nomatch':
                guides.append((gid, seq)); continue
            if kind in ('perfect', 'offtarget'):
                p = free(start, end + 3)
                if p is None or p + L > end: ok = False; break
                pam = rng.choice('ACGT') + 'GG'
                plant(p, seq, pam); planted.append(p)
                if kind == 'offtarget':
                    q = free(0, glen)
                    if q is None or (start - L - 4 < q < end + 3): ok = False; break
                    near = list(seq); k = rng.randrange(L // 2); near[k] = rng.choice([c for c in 'ACGT' if c != near[k]])
                    plant(q, ''.join(near), rng.choice('ACGT') + 'GG'); planted.append(q)
            elif kind == 'nopam':
                p = free(start, end + 3)
                if p is None or p + L > end: ok = False; break
                bad = rng.choice('ACGT') + rng.choice(['AG', 'GA', 'CA', 'AC', 'TA'])
                plant(p, seq, bad); planted.append(p)
            elif kind == 'elsewhere':
                p = free(0, glen)
                if p is None or (start - L - 4 < p < end + 3): ok = False; break
                plant(p, seq, rng.choice('ACGT') + 'GG'); planted.append(p)
            guides.append((gid, seq))
        if not ok:
            continue
        genome = ''.join(g)
        if all(verdict(genome, seq, mism, start, end) == kind for (gid, seq), (_, kind) in zip(guides, design)):
            return genome, guides
    raise SystemExit(f'no CRISPR design for seed {seed}')

def crispr_spec(id_, title, subtitle, diff, minutes, objective, story, target_label, seed, glen, start, end, mism, design,
                explore, hints, case, ref, summary, done_title, impact):
    genome, guides = make_crispr(seed, glen, start, end, mism, design)
    return dict(
        id=id_, mode='crispr', kind='dna', title=title, subtitle=subtitle, difficulty=diff, minutes=minutes,
        objective=objective,
        description=B('CRISPR-Cas9 is a pair of molecular scissors steered by a short RNA, the guide. The guide pairs with DNA that has the same letters, and Cas9 cuts there, as long as a PAM follows.',
                      'CRISPR-Cas9 son unas tijeras moleculares dirigidas por un ARN corto, la guía. La guía se une al ADN que tiene sus mismas letras y Cas9 corta ahí, siempre que justo después haya un PAM.'),
        organism=dict(id='crispr-target', name=B('Gene to edit', 'Gen a editar'), sci=B('Cas9 target', 'Diana de Cas9'), taxonomy=['Method'],
                      tissue='nucleus', organelle='nucleus',
                      desc=B('A stretch of DNA with a gene that we want to change.', 'Un trozo de ADN con un gen que queremos cambiar.')),
        exploration=explore,
        crispr=dict(genome=genome, target=(target_label, start, end), guides=guides, mismatches=mism, story=story),
        product=B('Cut', 'Corte'),
        steps=[(B('Guide', 'Guía'), B('The guide leads Cas9 to a place in the DNA.', 'La guía lleva a Cas9 a un sitio del ADN.')),
               (B('Cut', 'Corte'), B('Cas9 cuts both strands next to the PAM.', 'Cas9 corta las dos hebras junto al PAM.')),
               (B('Repair', 'Reparación'), B('The cell repairs the cut, and the gene is changed.', 'La célula repara el corte y el gen queda cambiado.'))],
        hints=hints, done_title=done_title, summary=summary, impact=impact,
        case=case,
        context=B('Cas9 is guided by an RNA of about 20 letters. It cuts only where the DNA matches the guide and sits next to a short PAM sequence (NGG). Matches with a few differences can still be cut, which causes off-target changes.',
                  'Cas9 está guiada por un ARN de unas 20 letras. Solo corta donde el ADN coincide con la guía y está junto a una secuencia corta llamada PAM (NGG). Las coincidencias con algunas diferencias también pueden cortarse, lo que causa cambios fuera de objetivo.'),
        simplify=[B('Guides here have 8 letters so they fit on the screen; real ones have about 20.', 'Las guías de aquí tienen 8 letras para que quepan en pantalla; las reales tienen unas 20.'),
                  B('Real Cas9 also cuts depending on the strand and on how close the differences are to the PAM.', 'La Cas9 real también corta según la hebra y según lo cerca del PAM que estén las diferencias.')],
        refs=[ref],
    )

cr = [
    crispr_spec('crispr-1', B('A guide for Cas9', 'Una guía para Cas9'), B('Cut where you mean to', 'Cortar justo donde quieres'), 'beginner', 5,
        B('Choose the guide that lets Cas9 cut inside the gene to edit.', 'Elige la guía que hace que Cas9 corte dentro del gen que quieres editar.'),
        B('An apple turns brown when cut because of one gene. Switch it off.', 'Una manzana se pone marrón al cortarla por culpa de un gen. Apágalo.'),
        B('browning gene', 'gen del pardeamiento'), seed=5, glen=40, start=12, end=30, mism=0,
        design=[('a', 'perfect'), ('b', 'nomatch'), ('c', 'elsewhere')],
        explore=[('dna', B('The scissors', 'Las tijeras'), B('Cas9 cuts DNA', 'Cas9 corta ADN'),
                  B('Cas9 is a protein that cuts DNA. On its own it does not know where, so it needs a guide.',
                    'Cas9 es una proteína que corta ADN. Por sí sola no sabe dónde, así que necesita una guía.')),
                 ('dna', B('The guide', 'La guía'), B('A guide made of letters', 'Una guía hecha de letras'),
                  B('The guide is a short RNA that pairs with DNA that has matching letters. It takes Cas9 to the exact place we choose.',
                    'La guía es un ARN corto que se une al ADN con letras que coinciden. Lleva a Cas9 al sitio exacto que elegimos.'))],
        hints=[B('The guide must match letters inside the blue area, and a PAM (any letter and then GG) must follow its site.',
                 'La guía tiene que coincidir con letras de la zona azul, y justo después del sitio tiene que haber un PAM (una letra cualquiera y luego GG).'),
               B('Tap each guide: you will see where it sticks. Discard the ones that stick nowhere or outside the blue area.',
                 'Toca cada guía: verás dónde se pega. Descarta las que no se pegan o caen fuera de la zona azul.'),
               B('Choose guide A.', 'Elige la guía A.')],
        case=B('In 2012 Jennifer Doudna, Emmanuelle Charpentier and colleagues showed that Cas9 can be programmed with a guide RNA to cut any DNA sequence they choose.',
               'En 2012 Jennifer Doudna, Emmanuelle Charpentier y sus colegas demostraron que Cas9 se puede programar con un ARN guía para cortar la secuencia de ADN que se elija.'),
        ref=JINEK, done_title=B('Cut in the right place', 'Un corte en el sitio justo'),
        summary=B('You chose the guide that sticks inside the gene and has a PAM next to it, so Cas9 cuts there.',
                  'Has elegido la guía que se pega dentro del gen y que tiene un PAM al lado, así que Cas9 corta ahí.'),
        impact=B('Changing one gene at a time, on purpose, is what makes CRISPR so useful for crops, microbes and research.',
                 'Cambiar un gen cada vez, a propósito, es lo que hace tan útil a CRISPR para cultivos, microbios e investigación.')),
    crispr_spec('crispr-2', B('The PAM matters', 'El PAM importa'), B('A match is not enough', 'Coincidir no basta'), 'beginner', 6,
        B('Find the guide that makes Cas9 cut inside the gene. One guide sticks there but Cas9 will not cut.',
          'Encuentra la guía que hace cortar a Cas9 dentro del gen. Una guía se pega ahí pero Cas9 no cortará.'),
        B('A tomato gene that softens the fruit. Edit it so tomatoes last longer.', 'Un gen del tomate que ablanda el fruto. Edítalo para que los tomates duren más.'),
        B('softening gene', 'gen del ablandamiento'), seed=9, glen=48, start=14, end=36, mism=0,
        design=[('a', 'nopam'), ('b', 'perfect'), ('c', 'elsewhere'), ('d', 'nomatch')],
        explore=[('dna', B('The PAM', 'El PAM'), B('A short password', 'Una contraseña corta'),
                  B('Cas9 checks for a short sequence next to the target, the PAM (NGG). Without it, Cas9 does not cut, even if the guide matches perfectly.',
                    'Cas9 comprueba que junto al sitio haya una secuencia corta, el PAM (NGG). Sin ella, Cas9 no corta, aunque la guía coincida perfectamente.')),
                 ('dna', B('Why a PAM', 'Para qué un PAM'), B('Telling self from foreign', 'Distinguir lo propio de lo ajeno'),
                  B('Bacteria use CRISPR against viruses. The PAM lets them cut the virus without cutting their own stored copies of its DNA.',
                    'Las bacterias usan CRISPR contra los virus. El PAM les permite cortar el virus sin cortar las copias de su ADN que guardan.'))],
        hints=[B('Tap every guide and look at the three letters after its site: they must end in GG.',
                 'Toca cada guía y mira las tres letras que hay después de su sitio: tienen que acabar en GG.'),
               B('One guide sticks inside the gene but without a PAM. Another sticks outside. Only one does both things right.',
                 'Una guía se pega dentro del gen pero sin PAM. Otra se pega fuera. Solo una hace bien las dos cosas.'),
               B('Choose guide B.', 'Elige la guía B.')],
        case=B('Cas9 from Streptococcus pyogenes needs a PAM of the form NGG next to the target. Other Cas proteins need different PAMs, which lets scientists reach other places in the genome.',
               'La Cas9 de Streptococcus pyogenes necesita un PAM del tipo NGG junto al sitio. Otras proteínas Cas necesitan PAM distintos, lo que permite llegar a otros lugares del genoma.'),
        ref=JINEK, done_title=B('A guide with a password', 'Una guía con contraseña'),
        summary=B('You saw that a guide can match and still not work: Cas9 also needs the PAM right next to the site.',
                  'Has visto que una guía puede coincidir y aun así no funcionar: Cas9 también necesita el PAM justo al lado del sitio.'),
        impact=B('Choosing a guide means looking for a match and a PAM at the same time, which limits where Cas9 can cut.',
                 'Elegir una guía es buscar a la vez una coincidencia y un PAM, lo que limita dónde puede cortar Cas9.')),
    crispr_spec('crispr-3', B('Cutting only once', 'Cortar una sola vez'), B('The danger of look-alikes', 'El peligro de los parecidos'), 'intermediate', 7,
        B('Cas9 also cuts at sites that differ by one letter. Choose a guide that cuts inside the gene and nowhere else.',
          'Cas9 también corta en sitios que difieren en una letra. Elige una guía que corte dentro del gen y en ningún otro sitio.'),
        B('A mushroom that turns brown in the fridge. Edit its browning gene without touching the rest.', 'Una seta que se pone marrón en la nevera. Edita su gen del pardeamiento sin tocar el resto.'),
        B('mushroom browning gene', 'gen del pardeamiento de la seta'), seed=13, glen=72, start=18, end=54, mism=1,
        design=[('a', 'offtarget'), ('b', 'perfect'), ('c', 'elsewhere'), ('d', 'nopam')],
        explore=[('dna', B('Look-alikes', 'Parecidos'), B('Almost the same letters', 'Casi las mismas letras'),
                  B('Genomes contain places that look almost like the target. Cas9 can cut there too if only one or two letters differ.',
                    'Los genomas tienen lugares casi idénticos al sitio buscado. Cas9 también puede cortar ahí si solo se diferencian en una o dos letras.')),
                 ('dna', B('Off-target', 'Fuera de objetivo'), B('Unwanted cuts', 'Cortes no deseados'),
                  B('A cut in the wrong place can change another gene. Scientists design guides whose sequence is unique in the genome.',
                    'Un corte en el sitio equivocado puede cambiar otro gen. Los científicos diseñan guías cuya secuencia es única en el genoma.'))],
        hints=[B('In this level a site with one different letter still counts. Tap each guide to see all the places where it sticks.',
                 'En este nivel un sitio con una letra distinta también cuenta. Toca cada guía para ver todos los sitios donde se pega.'),
               B('A guide that cuts in the gene but also somewhere else is a bad choice. Look for the one with a single cut.',
                 'Una guía que corta en el gen y también en otro sitio es mala. Busca la que solo corta una vez.'),
               B('Choose guide B.', 'Elige la guía B.')],
        case=B('In 2016 a researcher edited a gene of the white button mushroom so that it browns more slowly. The change was a few letters of DNA, and no DNA from another species was added.',
               'En 2016 un investigador editó un gen del champiñón blanco para que se ponga marrón más despacio. El cambio fueron unas pocas letras de ADN y no se añadió ADN de otra especie.'),
        ref=JINEK, done_title=B('One cut, in the right place', 'Un corte, en el sitio justo'),
        summary=B('You avoided a guide with a look-alike site and chose one that cuts only inside the gene.',
                  'Has evitado una guía con un sitio parecido y has elegido la que corta solo dentro del gen.'),
        impact=B('Checking for off-target sites is a standard step before any gene-editing experiment.',
                 'Comprobar los sitios fuera de objetivo es un paso habitual antes de cualquier experimento de edición genética.')),
    crispr_spec('crispr-4', B('A guide for a big genome', 'Una guía para un genoma grande'), B('Many look-alikes', 'Muchos parecidos'), 'advanced', 9,
        B('Choose the one guide that cuts inside the gene and nowhere else, among five that are almost alike.',
          'Elige la única guía que corta dentro del gen y en ningún otro sitio, entre cinco casi iguales.'),
        B('Wheat can catch a fungus called powdery mildew. A gene makes it vulnerable. Edit it.', 'El trigo puede coger un hongo llamado oídio. Un gen lo hace vulnerable. Edítalo.'),
        B('susceptibility gene', 'gen de susceptibilidad'), seed=17, glen=104, start=22, end=76, mism=1,
        design=[('a', 'offtarget'), ('b', 'nopam'), ('c', 'perfect'), ('d', 'elsewhere'), ('e', 'offtarget')],
        explore=[('plant', B('Wheat', 'Trigo'), B('A crop with a huge genome', 'Un cultivo con un genoma enorme'),
                  B('Wheat has a genome about five times larger than the human one. Finding a guide that is unique in it takes care.',
                    'El trigo tiene un genoma unas cinco veces mayor que el humano. Encontrar una guía única en él exige cuidado.')),
                 ('dna', B('The edit', 'La edición'), B('Switching a gene off', 'Apagar un gen'),
                  B('Cas9 cuts, and the cell repairs the cut with small errors. If the gene is broken, the plant stops being vulnerable.',
                    'Cas9 corta y la célula repara el corte con pequeños errores. Si el gen queda roto, la planta deja de ser vulnerable.'))],
        hints=[B('Tap every guide and count where it sticks. Only one cuts exactly once, inside the blue area.',
                 'Toca cada guía y cuenta dónde se pega. Solo una corta exactamente una vez, dentro de la zona azul.'),
               B('Two guides cut inside the gene but also elsewhere, one sticks without a PAM and one cuts only outside.',
                 'Dos guías cortan dentro del gen pero también en otro sitio, una se pega sin PAM y otra corta solo fuera.'),
               B('Choose guide C.', 'Elige la guía C.')],
        case=B('In 2014 a team in China edited the three copies of a gene in bread wheat, giving plants that resist powdery mildew, a fungal disease.',
               'En 2014 un equipo en China editó las tres copias de un gen del trigo panadero y obtuvo plantas que resisten el oídio, una enfermedad causada por un hongo.'),
        ref=WANG, done_title=B('A clean edit', 'Una edición limpia'),
        summary=B('Out of five similar guides you found the only one that cuts inside the gene and nowhere else.',
                  'De cinco guías parecidas has encontrado la única que corta dentro del gen y en ningún otro sitio.'),
        impact=B('Designing specific guides is how gene editing can improve crops without unwanted changes elsewhere in the genome.',
                 'Diseñar guías específicas es lo que permite que la edición genética mejore cultivos sin cambios no deseados en otras partes del genoma.')),
]

write_levels(asm + cr)
