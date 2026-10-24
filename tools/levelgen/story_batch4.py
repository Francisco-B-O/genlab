"""Inserts the real-case scenes of batch 4 into the story chapters.

Each new scene is placed just before the LAST scene of its chapter, so the closing
transition of the chapter stays where it was. Run once; it refuses to add a scene twice.
"""
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
        ('peas-height', 'Tall and short peas', 'Guisantes altos y bajos', 'inh-pea-height',
         [(D, 'happy', 'The monk also counted tall plants and short ones. Cross two tall plants, and some children come out short.', 'El monje también contó plantas altas y bajas. Cruza dos plantas altas y algunos hijos salen bajos.'),
          (P, 'thinking', 'The short allele was only hiding. Sneaky.', 'El alelo bajo solo se escondía. Qué tramposo.')],
         [(D, 'happy', 'The ratio three to one appears again and again. That regularity is what convinced him.', 'La proporción tres a uno aparece una y otra vez. Esa regularidad fue lo que lo convenció.')]),
        ('peas-polled', 'Cattle without horns', 'Vacas sin cuernos', 'inh-polled',
         [(D, 'happy', 'Farmers use the same rules with cattle. Some breeds are born without horns, which is safer for everyone.', 'Los ganaderos usan las mismas reglas con el ganado. Algunas razas nacen sin cuernos, lo que es más seguro para todos.'),
          (P, 'neutral', 'A dominant allele that says no to horns. Polite.', 'Un alelo dominante que dice no a los cuernos. Educado.')],
         [(D, 'thinking', 'The allele was traced to a real stretch of DNA. Genetics became a tool for breeders.', 'Se localizó el alelo en un tramo real de ADN. La genética se volvió una herramienta para los criadores.')]),
        ('peas-tomato', 'Tomato colour', 'El color del tomate', 'inh-tomato',
         [(D, 'happy', 'Even the colour of a tomato follows these squares. Fruit breeders choose parents and predict the children.', 'Hasta el color de un tomate sigue estos cuadros. Quien mejora frutas elige los padres y predice los hijos.'),
          (P, 'happy', 'I vote for the red ones. Out of loyalty to ketchup.', 'Voto por los rojos. Por lealtad al kétchup.')],
         [(D, 'happy', 'Choose the cross, draw the square, save years of trial and error.', 'Elige el cruce, dibuja el cuadro y ahorra años de ensayo y error.')]),
    ],
    'helix': [
        ('helix-hershey', 'DNA or protein?', '¿ADN o proteína?', 'seq-hershey',
         [(D, 'thinking', 'Before the double helix, a question: is the genetic material DNA or protein? In 1952 two researchers used viruses to find out.', 'Antes de la doble hélice, una pregunta: ¿el material genético es ADN o proteína? En 1952 dos investigadores usaron virus para averiguarlo.'),
          (P, 'neutral', 'Put the steps of the experiment in order. Cleanly, please.', 'Pon en orden los pasos del experimento. Con limpieza, por favor.')],
         [(D, 'happy', 'Only the DNA went into the bacteria. That settled it.', 'Solo el ADN entró en las bacterias. Eso lo resolvió.')]),
        ('helix-meselson', 'How DNA copies itself', 'Cómo se copia el ADN', 'seq-meselson',
         [(D, 'happy', 'If DNA is the material, how does it copy itself? In 1958 an elegant experiment with heavy and light nitrogen gave the answer.', 'Si el ADN es el material, ¿cómo se copia? En 1958 un experimento elegante con nitrógeno pesado y ligero dio la respuesta.'),
          (P, 'surprised', 'Heavy nitrogen. Sounds like a gym for atoms.', 'Nitrógeno pesado. Suena a gimnasio para átomos.')],
         [(D, 'thinking', 'Each new molecule keeps one old strand. We call it semi-conservative copying.', 'Cada molécula nueva conserva una hebra vieja. Lo llamamos copia semiconservativa.')]),
    ],
    'typos': [
        ('typos-rice', 'A letter that makes rice shorter', 'Una letra que acorta el arroz', 'mut-rice',
         [(D, 'happy', 'A single change in a rice gene helped to create short varieties that did not fall over in the wind, and fed millions.', 'Un solo cambio en un gen del arroz ayudó a crear variedades bajas que no se tumbaban con el viento y alimentaron a millones.'),
          (P, 'thinking', 'One typo, a lot of dinners. I like that ratio.', 'Una errata, muchas cenas. Me gusta esa proporción.')],
         [(D, 'happy', 'Not every typo is bad. Some are the start of a good crop.', 'No toda errata es mala. Algunas son el comienzo de una buena cosecha.')]),
        ('typos-gfp65', 'A letter that changes the light', 'Una letra que cambia la luz', 'mut-gfp65',
         [(D, 'surprised', 'Remember the green protein? One typo in its gene made it glow much brighter, and it became a tool of every laboratory.', '¿Recuerdas la proteína verde? Una errata en su gen la hizo brillar mucho más, y se volvió una herramienta de todos los laboratorios.'),
          (P, 'happy', 'A typo with a bright future.', 'Una errata con un futuro brillante.')],
         [(D, 'thinking', 'Reading the effect of a change is the first step to designing one.', 'Leer el efecto de un cambio es el primer paso para diseñar uno.')]),
    ],
    'splice': [
        ('splice-sanger', 'Reading letters one by one', 'Leer letras una a una', 'seq-sanger',
         [(D, 'happy', 'Cutting and gluing needs one more skill: reading. In 1977 a method read DNA letter by letter.', 'Cortar y pegar necesita una habilidad más: leer. En 1977 un método leyó el ADN letra a letra.'),
          (P, 'neutral', 'Order the steps of the method. No skipping the gel.', 'Ordena los pasos del método. Sin saltarse el gel.')],
         [(D, 'happy', 'That chain-ending trick read genomes for three decades.', 'Aquel truco de cortar cadenas leyó genomas durante tres décadas.')]),
    ],
    'copies': [
        ('copies-lux', 'Bacteria that glow', 'Bacterias que brillan', 'build-lux',
         [(D, 'happy', 'A marine bacterium makes its own light. Its genes were moved into other organisms to build living lamps and sensors.', 'Una bacteria marina fabrica su propia luz. Sus genes se pasaron a otros organismos para construir lámparas y sensores vivos.'),
          (P, 'surprised', 'Genes that glow on their own. Finally, a night light that eats.', 'Genes que brillan solos. Por fin, una luz de noche que come.')],
         [(D, 'thinking', 'The light genes work in sets. You need all of them to light up.', 'Los genes de la luz funcionan en conjunto. Se necesitan todos para encender.')]),
        ('copies-quorum', 'Bacteria that count', 'Bacterias que se cuentan', 'quorum',
         [(D, 'thinking', 'Those bacteria glow only when they are many. How do they know? They talk with a signal.', 'Esas bacterias brillan solo cuando son muchas. ¿Cómo lo saben? Hablan con una señal.'),
          (P, 'happy', 'A tiny crowd that votes with light.', 'Una multitud diminuta que vota con luz.')],
         [(D, 'happy', 'Counting by chemistry. Many bacteria use it to decide when to act.', 'Contar con química. Muchas bacterias lo usan para decidir cuándo actuar.')]),
        ('copies-ice', 'Bacteria against frost', 'Bacterias contra la helada', 'ice-minus',
         [(D, 'happy', 'In the 1980s a bacterium without an ice-making gene was sprayed on a strawberry field. A first for outdoor tests.', 'En los años 80 se roció un campo de fresas con una bacteria sin el gen que forma hielo. Una primicia para las pruebas al aire libre.'),
          (P, 'worried', 'Do not think about the cold. Think about the pathway.', 'No pienses en el frío. Piensa en la ruta.')],
         [(D, 'thinking', 'Taking a gene away can be as useful as adding one.', 'Quitar un gen puede ser tan útil como añadir uno.')]),
        ('copies-flavr', 'The tomato that lasts', 'El tomate que dura', 'flavr-savr',
         [(D, 'happy', 'In 1994 the first whole food made with genetic engineering reached shops: a tomato that softened more slowly.', 'En 1994 llegó a las tiendas el primer alimento entero hecho con ingeniería genética: un tomate que se ablandaba más despacio.'),
          (P, 'neutral', 'It softened less. The tomato, not me.', 'Se ablandaba menos. El tomate, no yo.')],
         [(D, 'thinking', 'A gene read backwards lowers an enzyme. Fascinating, and reusable.', 'Un gen leído al revés baja una enzima. Fascinante, y reutilizable.')]),
    ],
    'editing': [
        ('crispr-rice', 'Rice that resists blight', 'Arroz que resiste el tizón', 'crispr-5',
         [(D, 'happy', 'A bacterium opens a door in rice to steal sugar. Editing the door closes it, with no genes added from another species.', 'Una bacteria abre una puerta en el arroz para robar azúcar. Editar la puerta la cierra, sin añadir genes de otra especie.'),
          (P, 'thinking', 'Five guides. One of them does the right thing.', 'Cinco guías. Una de ellas hace lo correcto.')],
         [(D, 'happy', 'Choosing the guide well is the whole art. You have it.', 'Elegir bien la guía es todo el arte. Lo tienes.')]),
    ],
    'materials': [
        ('mat-pha', 'Plastic made by bacteria', 'Plástico hecho por bacterias', 'build-pha',
         [(D, 'happy', 'Some bacteria store energy as a plastic that breaks down in nature. Their genes can be moved to build it on demand.', 'Algunas bacterias guardan energía en forma de un plástico que se degrada en la naturaleza. Sus genes se pueden mover para construirlo a demanda.'),
          (P, 'neutral', 'Plastic that decomposes. My cousins would be jealous.', 'Plástico que se descompone. Mis primos estarían celosos.')],
         [(D, 'happy', 'Three genes in a row, and a material from sugar.', 'Tres genes en fila y un material a partir de azúcar.')]),
    ],
    'energy': [
        ('energy-ethanol', 'Fuel from sugar cane', 'Combustible de caña de azúcar', 'tune-ethanol',
         [(D, 'happy', 'In Brazil, sugar cane has been fermented into fuel on a huge scale for decades. The settings matter.', 'En Brasil la caña de azúcar se fermenta para hacer combustible a gran escala desde hace décadas. Los ajustes importan.'),
          (P, 'thinking', 'Too hot, the yeast faints. Too cold, it naps.', 'Demasiado calor, la levadura se desmaya. Demasiado frío, se echa la siesta.')],
         [(D, 'happy', 'A fine balance, found by looking at what the yeast needs.', 'Un equilibrio fino, que se encuentra mirando lo que necesita la levadura.')]),
        ('energy-nitrogen', 'Living fertiliser', 'Abono vivo', 'nitrogen-fixation',
         [(D, 'happy', 'Energy is not only fuel. Plants need nitrogen too, and some bacteria make it from air.', 'La energía no es solo combustible. Las plantas también necesitan nitrógeno, y algunas bacterias lo fabrican a partir del aire.'),
          (P, 'surprised', 'Fertiliser out of thin air. Literally.', 'Abono de la nada. Literalmente.')],
         [(D, 'thinking', 'The price is a lot of energy, and no oxygen allowed.', 'El precio es mucha energía, y sin oxígeno.')]),
        ('energy-legume', 'The legume and its partner', 'La leguminosa y su socia', 'seq-legume',
         [(D, 'thinking', 'The plant and the bacteria talk before forming a nodule. Put the conversation in order.', 'La planta y las bacterias hablan antes de formar un nódulo. Pon la conversación en orden.')],
         [(D, 'happy', 'A partnership of millions of years.', 'Una sociedad de millones de años.')]),
        ('energy-nodule', 'Soybeans without nodules', 'Soja sin nódulos', 'fix-nodule',
         [(P, 'worried', 'A field of soybeans with no nodules. The bacteria are there, but nothing happens.', 'Un campo de soja sin nódulos. Las bacterias están ahí, pero no pasa nada.'),
          (D, 'thinking', 'Time for the diagnostic kit. What could be switching the partnership off?', 'Hora del kit de diagnóstico. ¿Qué puede estar apagando la sociedad?')],
         [(D, 'happy', 'Too much of a good thing. The fertiliser itself was the problem.', 'Demasiado de algo bueno. El propio abono era el problema.')]),
        ('energy-oil', 'Microbes that eat oil', 'Microbios que comen petróleo', 'oil-eaters',
         [(D, 'happy', 'After a spill at sea, bacteria that feed on oil multiply. Nature already has cleaners.', 'Tras un vertido en el mar se multiplican las bacterias que se alimentan de petróleo. La naturaleza ya tiene limpiadores.'),
          (P, 'happy', 'Tiny janitors. Underpaid.', 'Conserjes diminutos. Mal pagados.')],
         [(D, 'thinking', 'Two steps in a row. The first prepares what the second one burns.', 'Dos pasos seguidos. El primero prepara lo que quema el segundo.')]),
    ],
}

CHAPTER_PASTEUR = '''import { doc, robot, type Chapter } from '../dsl';

export const pasteur: Chapter = {
  id: 'pasteur',
  kind: 'flask',
  era: '1860s',
  era_es: 'Década de 1860',
  title: 'The invisible workers',
  title_es: 'Los obreros invisibles',
  scenes: [
SCENES  ],
};
'''

PASTEUR_SCENES = [
    ('pasteur-flask', 'Who makes the wine sour?', '¿Quién agria el vino?', 'seq-pasteur',
     [(D, 'happy', 'A French chemist was asked why wine and beer turned sour. His answer: living things too small to see.', 'A un químico francés le preguntaron por qué el vino y la cerveza se agriaban. Su respuesta: seres vivos demasiado pequeños para verse.'),
      (P, 'thinking', 'Put his experiment in order. The famous flask has a long, curved neck.', 'Pon su experimento en orden. El famoso matraz tiene un cuello largo y curvo.')],
     [(D, 'happy', 'Air could come in, but the microbes stayed in the bend. Life does not appear from nothing.', 'El aire podía entrar, pero los microbios se quedaban en la curva. La vida no aparece de la nada.')]),
    ('pasteur-beer', 'Studying beer', 'Estudiando la cerveza', 'seq-beer',
     [(D, 'happy', 'Brewing is a chain of steps that decide what you get. In what order do they go?', 'Elaborar cerveza es una cadena de pasos que decide lo que obtienes. ¿En qué orden van?')],
     [(P, 'happy', 'Order restored. The beer is relieved.', 'Orden restaurado. La cerveza está aliviada.')]),
    ('pasteur-pathway', 'From barley to beer', 'De la cebada a la cerveza', 'beer',
     [(D, 'thinking', 'Two chains of enzymes in two organisms: the barley makes sugar and the yeast turns it into alcohol.', 'Dos cadenas de enzimas en dos organismos: la cebada fabrica el azúcar y la levadura lo convierte en alcohol.')],
     [(D, 'happy', 'He did not know about enzymes, but he saw that yeast was alive and did the work.', 'Él no conocía las enzimas, pero vio que la levadura estaba viva y hacía el trabajo.')]),
    ('pasteur-tune', 'The temperature of the beer', 'La temperatura de la cerveza', 'tune-beer',
     [(P, 'neutral', 'Yeast has preferences. Too warm and the flavour goes strange, too cold and it sleeps.', 'La levadura tiene preferencias. Con demasiado calor el sabor se vuelve raro, con demasiado frío duerme.')],
     [(D, 'happy', 'Controlling the temperature was one of the first uses of microbiology.', 'Controlar la temperatura fue uno de los primeros usos de la microbiología.')]),
    ('pasteur-stuck', 'The fermentation that stopped', 'La fermentación que se paró', 'fix-beer',
     [(P, 'worried', 'A beer that stopped halfway with sugar still left. Use the kit.', 'Una cerveza que se paró a medias con azúcar todavía dentro. Usa el kit.')],
     [(D, 'happy', 'The yeast needed more than sugar. Like all of us.', 'La levadura necesitaba algo más que azúcar. Como todos.')]),
    ('pasteur-sourdough', 'Sourdough starter', 'La masa madre', 'tune-sourdough',
     [(D, 'happy', 'A sourdough starter is a living community of yeasts and bacteria. It keeps going if you tune it well.', 'Una masa madre es una comunidad viva de levaduras y bacterias. Sigue adelante si la ajustas bien.')],
     [(P, 'happy', 'The sourdough has a better personality than most people.', 'La masa madre tiene mejor carácter que la mayoría de las personas.')]),
    ('pasteur-hungry', 'The starter that does not rise', 'La masa madre que no sube', 'fix-sourdough',
     [(P, 'worried', 'A forgotten jar, a grey liquid and no bubbles. Find the broken piece.', 'Un tarro olvidado, un líquido gris y ninguna burbuja. Encuentra la pieza rota.')],
     [(D, 'happy', 'Feed it and it wakes up. Even here, the clock is shaking: next stop, a monk and his peas.', 'Aliméntala y despierta. Incluso aquí el reloj tiembla: próxima parada, un monje y sus guisantes.')]),
]


def pyscenes(lst):
    return ''.join(scene(*s) for s in lst)


def main():
    # new chapter
    path = os.path.join(ROOT, 'pasteur.ts')
    if not os.path.exists(path):
        with open(path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(CHAPTER_PASTEUR.replace('SCENES', pyscenes(PASTEUR_SCENES)))
    # existing chapters: insert before the last scene
    for ch, scenes in NEW.items():
        p = os.path.join(ROOT, ch + '.ts')
        with open(p, encoding='utf-8') as f:
            src = f.read()
        todo = [s for s in scenes if f'id: "{s[0]}"' not in src and f"id: '{s[0]}'" not in src]
        if not todo:
            continue
        idx = [m.start() for m in re.finditer(r'\n      \{\n        id:', src)]
        pos = idx[-1] + 1
        src = src[:pos] + pyscenes(todo) + src[pos:]
        with open(p, 'w', encoding='utf-8', newline='\n') as f:
            f.write(src)
    print('story updated')


main()
