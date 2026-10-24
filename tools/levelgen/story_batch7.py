"""Scenes of the frameshift levels (batch 5h), inserted before the last scene of their chapter."""
import json, os, re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'story', 'chapters')
q = lambda s: json.dumps(s, ensure_ascii=False)


def line(who, mood, en, es):
    return f"          {who}({q(mood)},\n            {q(en)},\n            {q(es)}),\n"


def scene(id_, title, title_es, level, before, after):
    out = f"      {{\n        id: {q(id_)},\n        title: {q(title)},\n        title_es: {q(title_es)},\n        level: {q(level)},\n        before: [\n"
    out += ''.join(line(*l) for l in before) + "        ],\n        after: [\n"
    out += ''.join(line(*l) for l in after) + "        ],\n      },\n"
    return out


D, P = 'doc', 'robot'

NEW = {
    'peas': [
        ('peas-two-genes', 'Two traits at once', 'Dos rasgos a la vez', 'inh-dihybrid-peas',
         [(D, 'thinking', 'The monk did not stop at one trait. He crossed peas that differed in shape and in colour, and counted thousands of seeds.', 'El monje no se quedó en un solo rasgo. Cruzó guisantes que se diferenciaban en la forma y en el color, y contó miles de semillas.'),
          (P, 'worried', 'Two squares now. I am putting on my multiplication glasses.', 'Ahora son dos cuadros. Me pongo las gafas de multiplicar.')],
         [(D, 'happy', 'Nine, three, three and one. The numbers that told him that genes travel separately.', 'Nueve, tres, tres y uno. Los números que le dijeron que los genes viajan por separado.')]),
        ('peas-two-tomato', 'A tomato for the balcony', 'Un tomate para el balcón', 'inh-dihybrid-tomato',
         [(D, 'happy', 'Now use the rule like a breeder: a tomato plant that is small enough for a pot and has red fruit.', 'Ahora usa la regla como quien mejora plantas: un tomatero lo bastante pequeño para una maceta y con frutos rojos.'),
          (P, 'happy', 'Tomatoes on the balcony. I volunteer as taster.', 'Tomates en el balcón. Me ofrezco como catador.')],
         [(D, 'thinking', 'A chance of three in sixteen tells you how many seedlings to grow. Genetics also helps with the gardening.', 'Una probabilidad de tres entre dieciséis te dice cuántas plántulas cultivar. La genética también ayuda con la jardinería.')]),
        ('peas-two-cat', 'The cat with two rare traits', 'El gato de dos rasgos raros', 'inh-dihybrid-cat',
         [(P, 'surprised', 'A cat with the dark paws of a Siamese and the long hair of a Persian. Where do I order one?', 'Un gato con las patas oscuras de un siamés y el pelo largo de un persa. ¿Dónde pido uno?'),
          (D, 'thinking', 'You do not order it. You calculate how many kittens you will need. Both traits are recessive.', 'No se pide. Se calcula cuántos gatitos harán falta. Los dos rasgos son recesivos.')],
         [(D, 'happy', 'One kitten in sixteen, when both parents carry both. That is why the breed took patience.', 'Un gatito de cada dieciséis, cuando los dos progenitores llevan los dos. Por eso la raza necesitó paciencia.')]),
    ],
    'typos': [
        ('typos-belgian', 'A letter that goes missing', 'Una letra que se pierde', 'mut-belgian',
         [(D, 'thinking', 'So far every change swapped one letter for another. A letter can also be lost, and then the whole message is read in the wrong groups.', 'Hasta ahora cada cambio sustituía una letra por otra. Una letra también se puede perder, y entonces todo el mensaje se lee en los grupos equivocados.'),
          (P, 'worried', 'Like missing a button on a shirt: everything after it is buttoned wrong.', 'Como saltarse un botón de la camisa: todo lo demás queda mal abrochado.')],
         [(D, 'happy', 'That is a frameshift. In the cattle it takes away the brake of the muscles.', 'Eso es un cambio de pauta de lectura. En el ganado quita el freno de los músculos.')]),
    ],
    'editing': [
        ('editing-indel', 'What the cut leaves behind', 'Lo que deja el corte', 'mut-crispr-edit',
         [(D, 'thinking', 'When Cas9 cuts, the cell repairs the DNA in a hurry. It often adds or loses one letter. You will now see what that does.', 'Cuando Cas9 corta, la célula repara el ADN con prisa. A menudo añade o pierde una letra. Ahora verás lo que eso provoca.'),
          (P, 'surprised', 'So the cut is only the first half of the trick.', 'O sea, que el corte es solo la mitad del truco.')],
         [(D, 'happy', 'A frameshift switches the gene off. That is how many gene-edited plants and animals are made.', 'Un cambio de pauta apaga el gen. Así se hacen muchas plantas y animales editados.')]),
    ],
}


def pyscenes(lst):
    return ''.join(scene(*s) for s in lst)


def main():
    for ch, scenes in NEW.items():
        p = os.path.join(ROOT, ch + '.ts')
        with open(p, encoding='utf-8', newline='') as f:
            raw = f.read()
        src = raw.replace('\r\n', '\n')
        todo = [s for s in scenes if f'id: "{s[0]}"' not in src and f"id: '{s[0]}'" not in src]
        if not todo:
            continue
        idx = [m.start() for m in re.finditer(r'\n      \{\n        id:', src)]
        pos = idx[-1] + 1
        src = src[:pos] + pyscenes(todo) + src[pos:]
        if '\r\n' in raw:
            src = src.replace('\n', '\r\n')
        with open(p, 'w', encoding='utf-8', newline='') as f:
            f.write(src)
    print('story updated')


main()
