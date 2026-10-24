"""Adds the 'medicine' chapter (the levels that were only in free play) to the story."""
import os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'story', 'chapters')


def q(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"


D, P = 'doc', 'robot'


def line(who, mood, en, es):
    return f"          {who}({q(mood)},\n            {q(en)},\n            {q(es)}),\n"


def scene(id_, title, title_es, level, before, after):
    out = f"      {{\n        id: {q(id_)},\n        title: {q(title)},\n        title_es: {q(title_es)},\n        level: {q(level)},\n        before: [\n"
    out += ''.join(line(*l) for l in before) + "        ],\n        after: [\n"
    out += ''.join(line(*l) for l in after) + "        ],\n      },\n"
    return out


S = [
    ('med-blood', 'Blood groups', 'Grupos sanguíneos', 'blood-groups',
     [(D, 'happy', 'Biotechnology also looks after people. Start with something everyone has: a blood group, decided by one enzyme.', 'La biotecnología también cuida de las personas. Empecemos por algo que todos tenemos: un grupo sanguíneo, decidido por una enzima.'),
      (P, 'neutral', 'A tiny difference in a sugar, a big difference for a transfusion.', 'Una pequeña diferencia en un azúcar, una gran diferencia en una transfusión.')],
     [(D, 'thinking', 'Knowing the pathway explains why some groups can be mixed and others cannot.', 'Conocer la ruta explica por qué unos grupos se pueden mezclar y otros no.')]),
    ('med-pku-inherit', 'A trait in the family', 'Un rasgo en la familia', 'inh-pku',
     [(D, 'thinking', 'Some conditions come from a recessive allele that two healthy carriers can pass on. The Punnett square tells the odds.', 'Algunas condiciones vienen de un alelo recesivo que dos portadores sanos pueden transmitir. El cuadro de Punnett dice las probabilidades.')],
     [(P, 'happy', 'Odds, not destiny. A very good lesson.', 'Probabilidades, no destino. Una muy buena lección.')]),
    ('med-pku-fix', 'A missing enzyme', 'Una enzima que falta', 'fix-pku',
     [(P, 'worried', 'In this pathway one enzyme does not work. Use the kit to find which piece fails and what helps.', 'En esta ruta una enzima no funciona. Usa el kit para encontrar qué pieza falla y qué ayuda.')],
     [(D, 'happy', 'Finding the cause early lets people manage it with diet. That is why newborns are tested.', 'Encontrar la causa pronto permite manejarla con la dieta. Por eso se analiza a los recién nacidos.')]),
    ('med-glucose', 'Measuring sugar', 'Medir el azúcar', 'glucose-strip',
     [(D, 'happy', 'A test strip uses an enzyme to turn sugar into a signal you can read. Biotechnology in a pocket.', 'Una tira de análisis usa una enzima para convertir el azúcar en una señal que se puede leer. Biotecnología de bolsillo.')],
     [(P, 'neutral', 'An enzyme, a colour and a number. Simple and useful.', 'Una enzima, un color y un número. Sencillo y útil.')]),
    ('med-antibiotic', 'A treatment that stopped working', 'Un tratamiento que dejó de funcionar', 'fix-antibiotic',
     [(P, 'worried', 'Bacteria change over time, and a drug that worked can stop working. Use the kit to see which piece changed.', 'Las bacterias cambian con el tiempo, y un fármaco que funcionaba puede dejar de hacerlo. Usa el kit para ver qué pieza cambió.')],
     [(D, 'thinking', 'Evolution happens on a small scale and fast. That is why drugs must be used with care.', 'La evolución ocurre a pequeña escala y rápido. Por eso los fármacos hay que usarlos con cuidado.')]),
    ('med-artemisinin', 'Medicine made by yeast', 'Medicina hecha por levadura', 'artemisinin',
     [(D, 'happy', 'A plant makes a useful compound in tiny amounts. Moving its pathway into yeast made it possible to produce it in tanks.', 'Una planta fabrica un compuesto útil en cantidades pequeñas. Pasar su ruta a una levadura permitió producirlo en cubas.')],
     [(P, 'happy', 'A garden inside a tank. Very efficient.', 'Un huerto dentro de una cuba. Muy eficiente.')]),
    ('med-mrna', 'Instructions on loan', 'Instrucciones prestadas', 'mrna-vaccine',
     [(D, 'thinking', 'A message of RNA can tell cells to build one harmless piece of a germ, so the body learns to recognise it. The message then disappears.', 'Un mensaje de ARN puede decir a las células que fabriquen una pieza inofensiva de un germen, para que el cuerpo aprenda a reconocerlo. Después el mensaje desaparece.')],
     [(P, 'neutral', 'You already know transcription and translation. This is the same idea, used on purpose.', 'Ya conoces la transcripción y la traducción. Es la misma idea, usada a propósito.')]),
    ('med-sickle', 'Editing a single letter', 'Editar una sola letra', 'crispr-sickle',
     [(D, 'happy', 'Remember the typo that changes a protein? With CRISPR, researchers have learned to correct a letter like that in cells.', '¿Recuerdas la errata que cambia una proteína? Con CRISPR, los investigadores han aprendido a corregir una letra así en células.'),
      (P, 'surprised', 'From reading typos to fixing them. Promotion.', 'De leer erratas a corregirlas. Ascenso.')],
     [(D, 'happy', 'Careful science, slow and tested. The clock is shaking again: we go to the kitchen of today.', 'Ciencia cuidadosa, lenta y comprobada. El reloj vuelve a temblar: vamos a la cocina de hoy.')]),
]

HEAD = """import { doc, robot, type Chapter } from '../dsl';

export const medicine: Chapter = {
  id: 'medicine',
  kind: 'blood',
  era: 'Today',
  era_es: 'Hoy',
  title: 'Biotechnology for health',
  title_es: 'Biotecnología para la salud',
  scenes: [
"""
with open(os.path.join(ROOT, 'medicine.ts'), 'w', encoding='utf-8', newline='\n') as f:
    f.write(HEAD + ''.join(scene(*s) for s in S) + "  ],\n};\n")
print('medicine written')
