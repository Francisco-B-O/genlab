"""Level generator for Genlab: compact bilingual specs -> level JSON + registry entries."""
import json, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
os.chdir(ROOT)

def B(en, es):
    return (en, es)

RULES = {
    'encodes': (['gene'], ['protein', 'enzyme']),
    'catalyzes': (['enzyme', 'protein'], ['reaction']),
    'consumes': (['reaction'], ['metabolite', 'protein']),
    'produces': (['reaction'], ['metabolite', 'protein', 'phenotype']),
    'influences': (['metabolite', 'protein', 'enzyme', 'phenotype'], ['phenotype', 'metabolite', 'gene']),
    'regulates': (['gene', 'protein', 'metabolite'], ['gene', 'protein', 'reaction']),
    'represses': (['gene', 'protein', 'metabolite', 'reaction'], ['gene', 'protein', 'reaction']),
    'localizes_to': (['gene', 'protein', 'enzyme', 'metabolite', 'reaction'], ['organelle', 'tissue']),
}

def bi(d, key, pair):
    """Writes a bilingual pair into d as key / key_es."""
    d[key] = pair[0]
    d[key + '_es'] = pair[1]

def with_es(pair_key_map):
    return pair_key_map

def lattice(col, row):
    """Positions that never overlap on the 2D board, in landscape or portrait."""
    return {'x': round(col * 3.0, 1), 'y': round(row * 2.4, 1), 'z': 0}

def node(n):
    nid, ntype, label, desc, col, row = n[:6]
    sci = n[6] if len(n) > 6 else None
    d = {'id': nid, 'type': ntype}
    bi(d, 'label', label)
    bi(d, 'description', desc)
    if sci:
        d['scientificName'] = sci
    d['position'] = lattice(col, row)
    d['metadata'] = {}
    return d

def common(spec):
    d = {'id': spec['id']}
    if spec['mode'] != 'pathway':
        d['mode'] = spec['mode']
    bi(d, 'title', spec['title'])
    bi(d, 'subtitle', spec['subtitle'])
    d['difficulty'] = spec['difficulty']
    d['estimatedDuration'] = spec['minutes']
    bi(d, 'objective', spec['objective'])
    bi(d, 'description', spec['description'])
    o = spec['organism']
    org = {'id': o['id']}
    bi(org, 'commonName', o['name'])
    sci = o['sci']
    if isinstance(sci, tuple):
        bi(org, 'scientificName', sci)
    else:
        org['scientificName'] = sci
    org['taxonomy'] = o.get('taxonomy', ['Eukaryota'])
    org['targetTissue'] = o.get('tissue', 'whole organism')
    org['targetOrganelle'] = o.get('organelle', 'cytoplasm')
    bi(org, 'description', o['desc'])
    d['organism'] = org
    assert len(spec['exploration']) >= 2, spec['id']
    d['exploration'] = []
    for kind, label, title, desc in spec['exploration']:
        e = {'kind': kind}
        bi(e, 'label', label); bi(e, 'title', title); bi(e, 'description', desc)
        d['exploration'].append(e)
    return d

def tail(spec, d):
    """simulation, hints, completion, science."""
    d['simulation'] = {}
    bi(d['simulation'], 'productLabel', spec['product'])
    d['simulation']['steps'] = []
    for i, (label, desc) in enumerate(spec['steps']):
        s = {'id': f's{i+1}'}
        bi(s, 'label', label); bi(s, 'description', desc)
        s['order'] = i + 1
        d['simulation']['steps'].append(s)
    d['hints'] = []
    names = [B('Big picture', 'Idea general'), B('Next step', 'Siguiente paso'), B('Solution', 'Solución')]
    assert len(spec['hints']) == 3, spec['id']
    for i, (title, content, cost) in enumerate(zip(names, spec['hints'], [50, 100, 150])):
        h = {'level': i + 1}
        bi(h, 'title', title); bi(h, 'content', content)
        h['pointCost'] = cost
        d['hints'].append(h)
    c = {}
    bi(c, 'title', spec['done_title']); bi(c, 'summary', spec['summary']); bi(c, 'realWorldImpact', spec['impact'])
    d['completion'] = c
    sci = spec['organism']['sci']
    s = {'organism': sci[0] if isinstance(sci, tuple) else sci}
    bi(s, 'realWorldCase', spec['case'])
    bi(s, 'scientificContext', spec['context'])
    s['gameplaySimplifications'] = [x[0] for x in spec['simplify']]
    s['gameplaySimplifications_es'] = [x[1] for x in spec['simplify']]
    s['references'] = spec.get('refs', [])
    d['science'] = s

def empty_graph(d):
    d['biologicalContext'] = {'nodes': [], 'edges': []}
    d['puzzle'] = {
        'availableNodes': [], 'distractorNodes': [], 'requiredConnections': [],
        'optionalConnections': [], 'invalidConnections': [],
        'winCondition': {'type': 'connections_complete', 'requiredConnectionIds': [],
                         'description': 'Solve the level.', 'description_es': 'Resuelve el nivel.'},
    }

def check_edge(types, src, tgt, et, where):
    assert src in types and tgt in types, f'{where}: unknown node {src}/{tgt}'
    srcs, tgts = RULES[et]
    assert types[src] in srcs, f'{where}: {src}({types[src]}) cannot be the source of {et}'
    assert types[tgt] in tgts, f'{where}: {tgt}({types[tgt]}) cannot be the target of {et}'

# ───────────────────────── per mode ─────────────────────────

def build_pathway(spec):
    d = common(spec)
    p = spec['pathway']
    nodes = [node(n) for n in p['nodes']]
    types = {n['id']: n['type'] for n in nodes}
    cells = [(n[4], n[5]) for n in p['nodes']]
    assert len(set(cells)) == len(cells), f"{spec['id']}: two nodes share a cell"
    d['biologicalContext'] = {'nodes': nodes, 'edges': []}
    req = []
    for rid, src, tgt, et, desc in p['required']:
        check_edge(types, src, tgt, et, spec['id'] + ' required ' + rid)
        r = {'id': rid, 'sourceId': src, 'targetId': tgt, 'edgeType': et}
        bi(r, 'description', desc)
        req.append(r)
    opt = []
    for oid, src, tgt, et, desc, bonus in p.get('optional', []):
        check_edge(types, src, tgt, et, spec['id'] + ' optional ' + oid)
        o = {'id': oid, 'sourceId': src, 'targetId': tgt, 'edgeType': et}
        bi(o, 'description', desc)
        o['bonusPoints'] = bonus
        opt.append(o)
    inv = []
    for src, tgt, reason in p.get('invalid', []):
        assert src in types and tgt in types, spec['id'] + ' invalid ' + src + tgt
        i = {'sourceId': src, 'targetId': tgt}
        bi(i, 'reason', reason)
        inv.append(i)
    d['puzzle'] = {
        'availableNodes': [n['id'] for n in nodes],
        'distractorNodes': p.get('distractors', []),
        'requiredConnections': req, 'optionalConnections': opt, 'invalidConnections': inv,
        'winCondition': {'type': 'pathway_complete', 'targetNodeId': p['target'],
                         'requiredConnectionIds': [r['id'] for r in req]},
    }
    bi(d['puzzle']['winCondition'], 'description', p['win'])
    tail(spec, d)
    return d

def build_diagnose(spec):
    d = common(spec)
    g = spec['diagnose']
    nodes = [node(n) for n in g['nodes']]
    types = {n['id']: n['type'] for n in nodes}
    cells = [(n[4], n[5]) for n in g['nodes']]
    assert len(set(cells)) == len(cells), f"{spec['id']}: two nodes share a cell"
    edges = []
    for src, tgt, et in g['edges']:
        check_edge(types, src, tgt, et, spec['id'] + ' edge')
        edges.append({'id': f'ref_{src}_{et}_{tgt}', 'source': src, 'target': tgt, 'type': et, 'isRequired': True})
    d['biologicalContext'] = {'nodes': nodes, 'edges': edges}
    d['puzzle'] = {
        'availableNodes': [n['id'] for n in nodes], 'distractorNodes': [], 'requiredConnections': [],
        'optionalConnections': [], 'invalidConnections': [],
        'winCondition': {'type': 'connections_complete', 'requiredConnectionIds': [],
                         'description': 'Solve the level.', 'description_es': 'Resuelve el nivel.'},
    }
    dg = {}
    bi(dg, 'symptom', g['symptom'])
    dg['clues'] = []
    for c in g['clues']:
        cl = {}; bi(cl, 'text', c); dg['clues'].append(cl)
    dg['faultyIds'] = g['faulty']
    for f in g['faulty']:
        assert f in types, spec['id'] + ' faulty ' + f
    dg['notes'] = {}
    for nid in types:
        assert nid in g['notes'], f"{spec['id']}: note missing for {nid}"
        t = {}; bi(t, 'text', g['notes'][nid]); dg['notes'][nid] = t
    dg['fixes'] = []
    assert sum(1 for f in g['fixes'] if f[1]) == 1, spec['id'] + ' needs exactly one right fix'
    for i, (text, ok, reason) in enumerate(g['fixes']):
        fx = {'id': f'f{i+1}'}
        bi(fx, 'text', text)
        fx['correct'] = ok
        bi(fx, 'reason', reason)
        dg['fixes'].append(fx)
    d['diagnose'] = dg
    tail(spec, d)
    return d

def build_sequence(spec):
    d = common(spec)
    steps = []
    for sid, label, desc, needs in spec['sequence']:
        s = {'id': sid}
        bi(s, 'label', label); bi(s, 'description', desc); bi(s, 'needs', needs)
        steps.append(s)
    d['sequence'] = {'steps': steps}
    empty_graph(d)
    tail(spec, d)
    return d

def build_inherit(spec):
    d = common(spec)
    h = spec['inherit']
    inh = {}
    bi(inh, 'trait', h['trait'])
    inh['alleles'] = h['alleles']
    if h.get('genotypes'):
        inh['genotypes'] = h['genotypes']
    inh['phenotypes'] = h['phenotypes']
    labels = {}
    for key, pair in h['labels'].items():
        labels[key] = pair[0]; labels[key + '_es'] = pair[1]
    inh['phenotypeLabels'] = labels
    inh['scenarios'] = []
    for i, sc in enumerate(h['scenarios']):
        s = {'id': f's{i+1}', 'parent1': sc['p1'], 'parent2': sc['p2']}
        bi(s, 'parent1Label', sc['l1']); bi(s, 'parent2Label', sc['l2'])
        bi(s, 'question', sc['q'])
        s['target'] = sc['target']
        if sc.get('p1b'):
            s['parent1b'] = sc['p1b']; s['parent2b'] = sc['p2b']; s['targetB'] = sc['targetB']
        bi(s, 'explanation', sc['why'])
        inh['scenarios'].append(s)
    if h.get('second'):
        g = h['second']
        sec = {}
        bi(sec, 'trait', g['trait'])
        sec['alleles'] = g['alleles']
        sec['phenotypes'] = g['phenotypes']
        sec['phenotypeLabels'] = {}
        for key, pair in g['labels'].items():
            sec['phenotypeLabels'][key] = pair[0]; sec['phenotypeLabels'][key + '_es'] = pair[1]
        inh['second'] = sec
    d['inherit'] = inh
    empty_graph(d)
    tail(spec, d)
    return d

def build_mutation(spec):
    d = common(spec)
    m = spec['mutation']
    mu = {}
    bi(mu, 'geneLabel', m['gene'])
    mu['reference'] = m['reference']; mu['mutant'] = m['mutant']
    bi(mu, 'story', m['story'])
    ex = {}
    for k in ('silent', 'missense', 'nonsense', 'frameshift'):
        if k in m['explanations']:
            ex[k] = m['explanations'][k][0]; ex[k + '_es'] = m['explanations'][k][1]
    mu['explanations'] = ex
    d['mutation'] = mu
    empty_graph(d)
    tail(spec, d)
    return d

def build_tune(spec):
    d = common(spec)
    t = spec['tune']
    tu = {}
    bi(tu, 'metricLabel', t['metric'])
    tu['unit'] = t['unit']; tu['unit_es'] = t.get('unit_es', t['unit'])
    tu['base'] = t['base']; tu['target'] = t['target']; tu['budget'] = t['budget']
    tu['labels'] = {}
    bi(tu['labels'], 'perCell', t['perCell']); bi(tu['labels'], 'growth', t['growth'])
    tu['messages'] = {}
    bi(tu['messages'], 'lowGrowth', t['lowGrowth']); bi(tu['messages'], 'lowPerCell', t['lowPerCell'])
    tu['knobs'] = []
    for kid, label, options in t['knobs']:
        k = {'id': kid}
        bi(k, 'label', label)
        k['options'] = []
        for oid, olabel, odesc, cost, per, growth in options:
            o = {'id': oid}
            bi(o, 'label', olabel); bi(o, 'description', odesc)
            o['cost'] = cost; o['perCell'] = per; o['growth'] = growth
            k['options'].append(o)
        tu['knobs'].append(k)
    d['tune'] = tu
    empty_graph(d)
    tail(spec, d)
    return d

def build_construct(spec):
    d = common(spec)
    c = spec['construct']
    parts = []
    for pid, kind, label, desc, wrong in c['parts']:
        p = {'id': pid, 'kind': kind}
        bi(p, 'label', label); bi(p, 'description', desc)
        if wrong:
            bi(p, 'wrongReason', wrong)
            p['isDistractor'] = True
        parts.append(p)
    d['construct'] = {'solution': c['solution'], 'parts': parts}
    empty_graph(d)
    tail(spec, d)
    return d

def build_pairing(spec):
    d = common(spec)
    p = spec['pairing']
    pr = {'kind': p['kind'], 'template': p['template']}
    bi(pr, 'story', p['story'])
    d['pairing'] = pr
    empty_graph(d)
    tail(spec, d)
    return d

def build_cut(spec):
    d = common(spec)
    c = spec['cut']
    cu = {'length': c['length'], 'gene': {}}
    bi(cu['gene'], 'label', c['gene'][0])
    cu['gene']['start'] = c['gene'][1]; cu['gene']['end'] = c['gene'][2]
    cu['enzymes'] = []
    for eid, label, desc, sites in c['enzymes']:
        e = {'id': eid, 'label': label, 'label_es': label}
        bi(e, 'description', desc)
        e['sites'] = sites
        cu['enzymes'].append(e)
    bi(cu, 'story', c['story'])
    d['cut'] = cu
    empty_graph(d)
    tail(spec, d)
    return d

def build_assemble(spec):
    d = common(spec)
    a = spec['assemble']
    seq = a['sequence']
    frags = a['fragments']
    ar = {'sequence': seq, 'fragments': frags, 'minOverlap': a['minOverlap']}
    bi(ar, 'story', a['story'])
    d['assemble'] = ar
    empty_graph(d)
    tail(spec, d)
    return d

def build_crispr(spec):
    d = common(spec)
    c = spec['crispr']
    cr = {'genome': c['genome'], 'target': {}}
    bi(cr['target'], 'label', c['target'][0])
    cr['target']['start'] = c['target'][1]; cr['target']['end'] = c['target'][2]
    cr['guides'] = [{'id': gid, 'sequence': seq} for gid, seq in c['guides']]
    cr['mismatches'] = c.get('mismatches', 0)
    bi(cr, 'story', c['story'])
    d['crispr'] = cr
    empty_graph(d)
    tail(spec, d)
    return d

BUILDERS = {
    'pathway': build_pathway, 'diagnose': build_diagnose, 'sequence': build_sequence, 'inherit': build_inherit,
    'mutation': build_mutation, 'tune': build_tune, 'construct': build_construct, 'pairing': build_pairing,
    'cut': build_cut, 'assemble': build_assemble, 'crispr': build_crispr,
}

def connections_of(spec):
    m = spec['mode']
    if m == 'pathway':
        return len(spec['pathway']['required'])
    if m == 'construct':
        return len(spec['construct']['solution'])
    if m == 'sequence':
        return len(spec['sequence'])
    if m == 'inherit':
        return len(spec['inherit']['scenarios'])
    if m == 'pairing':
        p = spec['pairing']
        return len(p['template']) // 3 if p['kind'] == 'protein' else len(p['template'])
    return 0

def esc(s):
    return s.replace('\\', '\\\\').replace("'", "\\'")

def registry_entry(spec):
    sci = spec['organism']['sci']
    organism = sci[0] if isinstance(sci, tuple) else sci
    mode = '' if spec['mode'] == 'pathway' else f", mode: '{spec['mode']}'"
    return f"""  {{
    id: '{spec['id']}',
    loader: () => import('../data/levels/{spec['id']}.json'),
    summary: {{
      title: '{esc(spec['title'][0])}', title_es: '{esc(spec['title'][1])}',
      subtitle: '{esc(spec['subtitle'][0])}',
      subtitle_es: '{esc(spec['subtitle'][1])}',
      organism: '{esc(organism)}',
      difficulty: '{spec['difficulty']}', isTutorial: false{mode}, estimatedDuration: {spec['minutes']}, connections: {connections_of(spec)}, kind: '{spec['kind']}',
    }},
  }},
"""

def write_levels(specs):
    path = 'src/levels/LevelLoader.ts'
    s = open(path, encoding='utf8', newline='').read()
    nl = '\r\n' if '\r\n' in s else '\n'
    s = s.replace('\r\n', '\n')
    for spec in specs:
        d = BUILDERS[spec['mode']](spec)
        with open(f"src/data/levels/{spec['id']}.json", 'w', encoding='utf8', newline='\n') as f:
            json.dump(d, f, ensure_ascii=False, indent=2)
            f.write('\n')
        if f"id: '{spec['id']}'," not in s:
            marker = "];\n\n/** Level ids in play order. */"
            assert marker in s
            s = s.replace(marker, registry_entry(spec) + marker, 1)
    open(path, 'w', encoding='utf8', newline='').write(s.replace('\n', nl))
    print('wrote', len(specs), 'levels:', ', '.join(sp['id'] for sp in specs))
