"""Inserts the everyday-case scenes of batch 5 into the story chapters.

Each new scene is placed just before the LAST scene of its chapter, so the closing
transition of the chapter stays where it was. It refuses to add a scene twice.
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
    'ferment': [
        ('ferment-cheese', 'From milk to cheese', 'De la leche al queso', 'seq-cheese',
         [(D, 'happy', 'Back to the kitchen. Cheese is milk changed by bacteria and an enzyme, and the order of the steps matters.', 'De vuelta a la cocina. El queso es leche transformada por bacterias y una enzima, y el orden de los pasos importa.'),
          (P, 'neutral', 'Bacteria first, enzyme second. Like a polite party.', 'Primero las bacterias, después la enzima. Como una fiesta educada.')],
         [(D, 'happy', 'Calves used to supply the enzyme. We will soon meet the version made by microbes.', 'Antes la enzima la ponían los terneros. Pronto conoceremos la versión fabricada por microbios.')]),
        ('ferment-kimchi', 'Cabbage that keeps', 'La col que se conserva', 'kimchi',
         [(D, 'happy', 'All over the world people ferment vegetables with salt: kimchi in Korea, sauerkraut in Germany.', 'En todo el mundo se fermentan verduras con sal: kimchi en Corea, chucrut en Alemania.'),
          (P, 'happy', 'Cabbage that improves with time. Unlike my jokes.', 'Una col que mejora con el tiempo. A diferencia de mis chistes.')],
         [(D, 'thinking', 'The bacteria were already on the leaves. We only gave them the right conditions.', 'Las bacterias ya estaban en las hojas. Solo les dimos las condiciones adecuadas.')]),
    ],
    'peas': [
        ('peas-earwax', 'Wet or dry earwax', 'Cera húmeda o seca', 'inh-earwax',
         [(D, 'happy', 'Genes are not only for plants. Some people have sticky earwax and others have dry earwax, and one gene decides it.', 'Los genes no son solo de las plantas. Unas personas tienen la cera pegajosa y otras seca, y un gen lo decide.'),
          (P, 'neutral', 'I have no ears. I do have opinions.', 'No tengo orejas. Pero sí opiniones.')],
         [(D, 'thinking', 'Two parents with the common type can have a child with the rarer one. The hidden allele was there all along.', 'Dos progenitores con el tipo común pueden tener un hijo con el más raro. El alelo escondido estaba ahí desde siempre.')]),
        ('peas-palomino', 'Horses of gold', 'Caballos de oro', 'inh-palomino',
         [(D, 'happy', 'Not every allele hides another. In horses, one cream allele turns a chestnut coat into gold, and two make it almost white.', 'No todos los alelos ocultan a otro. En los caballos, un alelo crema convierte un pelaje alazán en dorado, y dos lo vuelven casi blanco.'),
          (P, 'surprised', 'A horse that is a mix of its parents. Very diplomatic.', 'Un caballo que es una mezcla de sus padres. Muy diplomático.')],
         [(D, 'thinking', 'Cross a chestnut with a cremello and every foal is palomino. Breeders use the squares like a recipe.', 'Cruza un alazán con un cremello y todos los potros son palominos. Quien cría usa los cuadros como una receta.')]),
        ('peas-rabbit', 'A ladder of alleles', 'Una escalera de alelos', 'inh-rabbit',
         [(D, 'thinking', 'So far each gene had two alleles. In a rabbit, one gene has three, in a ladder of dominance. Take your time.', 'Hasta ahora cada gen tenía dos alelos. En un conejo, un gen tiene tres, en una escalera de dominancia. Tómate tu tiempo.'),
          (P, 'worried', 'Three alleles, six genotypes. My circuits are sweating.', 'Tres alelos, seis genotipos. Mis circuitos sudan.')],
         [(D, 'happy', 'An albino can come from two parents that show no sign of it. The ladder hides the lowest step.', 'Un albino puede venir de dos progenitores que no muestran señal de serlo. La escalera esconde el peldaño más bajo.')]),
        ('peas-siamese', 'The cat with cold ears', 'El gato de orejas frías', 'inh-siamese',
         [(P, 'happy', 'A cat! At last, a level with whiskers.', '¡Un gato! Por fin un nivel con bigotes.'),
          (D, 'thinking', 'Siamese cats are dark where the body is cool: ears, paws, tail. One recessive allele and an enzyme that dislikes heat.', 'Los gatos siameses son oscuros donde el cuerpo está frío: orejas, patas, cola. Un alelo recesivo y una enzima a la que no le gusta el calor.')],
         [(D, 'happy', 'An enzyme that reads the temperature of the body. Genes and surroundings working together.', 'Una enzima que lee la temperatura del cuerpo. Los genes y el entorno trabajando juntos.')]),
    ],
    'helix': [
        ('helix-insulin', 'The words of a medicine', 'Las palabras de un medicamento', 'pair-insulin',
         [(D, 'happy', 'A longer message now: the beginning of human insulin, written for a bacterium to read.', 'Ahora un mensaje más largo: el comienzo de la insulina humana, escrito para que lo lea una bacteria.'),
          (P, 'neutral', 'Thirteen codons and a stop. Keep your finger on the table.', 'Trece codones y una parada. No pierdas el dedo de la tabla.')],
         [(D, 'happy', 'The same code in a human and in a bacterium: that is what makes the medicine possible.', 'El mismo código en una persona y en una bacteria: eso es lo que hace posible el medicamento.')]),
        ('helix-gfp', 'The words of a glowing protein', 'Las palabras de una proteína que brilla', 'pair-gfp',
         [(D, 'happy', 'Remember the green protein? Its message starts with a few simple words. Read them with the genetic code.', '¿Recuerdas la proteína verde? Su mensaje empieza con unas pocas palabras sencillas. Léelas con el código genético.'),
          (P, 'neutral', 'Three letters, one amino acid. The jellyfish never asks for a schedule.', 'Tres letras, un aminoácido. La medusa nunca pide un horario.')],
         [(D, 'happy', 'The code is shared by all of life. That is why a jellyfish gene works in a bacterium.', 'El código lo comparte toda la vida. Por eso un gen de medusa funciona en una bacteria.')]),
    ],
    'typos': [
        ('typos-bitter', 'Why broccoli is bitter', 'Por qué el brócoli es amargo', 'mut-bitter',
         [(D, 'happy', 'Some people find broccoli very bitter and others do not. Part of the reason is a swap in a taste receptor.', 'A unas personas el brócoli les parece muy amargo y a otras no. Parte de la razón es un cambio en un receptor del gusto.'),
          (P, 'thinking', 'So when I say I hate broccoli, it is genetics. Noted.', 'O sea, que cuando digo que odio el brócoli es genética. Anotado.')],
         [(D, 'thinking', 'One swap can change how a food tastes. Remember it when someone refuses the sprouts.', 'Un solo cambio puede alterar cómo sabe un alimento. Acuérdate cuando alguien rechace las coles de Bruselas.')]),
        ('typos-mc1r', 'A letter you can see', 'Una letra que se ve', 'mut-mc1r',
         [(D, 'thinking', 'Another typo that is visible from far away: red hair. A receptor that controls the pigment works less.', 'Otra errata que se ve desde lejos: el pelo rojo. Un receptor que controla el pigmento trabaja menos.'),
          (P, 'surprised', 'A typo you can spot in a crowd.', 'Una errata que se localiza entre la multitud.')],
         [(D, 'happy', 'Red hair is recessive: it needs two copies with reduced function. That is why it can skip generations.', 'El pelo rojo es recesivo: necesita dos copias con la función reducida. Por eso puede saltarse generaciones.')]),
    ],
    'splice': [
        ('splice-chymosin', 'Cutting out the rennet gene', 'Sacar el gen del cuajo', 'cut-chymosin',
         [(D, 'thinking', 'Remember the enzyme that curdles milk? Its gene can be moved to a microbe. First, cut it out of the calf DNA.', '¿Recuerdas la enzima que cuaja la leche? Su gen se puede pasar a un microbio. Primero hay que sacarlo del ADN del ternero.'),
          (P, 'neutral', 'No single pair of scissors will do. Find the pair of enzymes.', 'Unas tijeras solas no bastan. Busca la pareja de enzimas.')],
         [(D, 'happy', 'Two different ends, two different enzymes. That also lets the gene go in the right way round.', 'Dos extremos distintos, dos enzimas distintas. Así el gen también entra en el sentido correcto.')]),
        ('splice-rennet', 'Rennet from a tank', 'Cuajo de un tanque', 'build-rennet',
         [(D, 'happy', 'The gene is free. Now build the circuit so that a bacterium can make the enzyme.', 'El gen está libre. Ahora construye el circuito para que una bacteria pueda fabricar la enzima.'),
          (P, 'happy', 'Promoter, landing strip, gene, terminator. I could recite it in my sleep, if I slept.', 'Promotor, pista de aterrizaje, gen, terminador. Podría recitarlo dormido, si durmiera.')],
         [(D, 'happy', 'Since 1990 most of the rennet in cheese has been made this way. A food ingredient from a tank.', 'Desde 1990 la mayor parte del cuajo del queso se fabrica así. Un ingrediente alimentario salido de un tanque.')]),
        ('splice-heme', 'The red protein of the burger', 'La proteína roja de la hamburguesa', 'cut-heme',
         [(D, 'happy', 'Another gene to cut out: leghemoglobin, the red protein of soybean roots. Plant-based burgers use it.', 'Otro gen que sacar: la leghemoglobina, la proteína roja de las raíces de la soja. Las hamburguesas vegetales la usan.'),
          (P, 'worried', 'Five enzymes. One of them lies with its band.', 'Cinco enzimas. Una de ellas miente con su banda.')],
         [(D, 'thinking', 'That red belongs to the same kind of molecule that colours blood. The cooking does the rest.', 'Ese rojo es de la misma clase de molécula que da color a la sangre. La cocción hace el resto.')]),
    ],
    'genomes': [
        ('genomes-barcode-pair', 'A barcode in DNA', 'Un código de barras en el ADN', 'pair-barcode',
         [(D, 'happy', 'Genomes can also work as barcodes. A short stretch of one gene tells which animal a sample comes from.', 'Los genomas también funcionan como códigos de barras. Un trozo corto de un gen dice de qué animal procede una muestra.'),
          (P, 'thinking', 'Warm-up first: copy a piece of that barcode.', 'Primero, calentamiento: copia un trozo de ese código.')],
         [(D, 'happy', 'Same pairing rules, a new use.', 'Las mismas reglas de emparejamiento, un uso nuevo.')]),
        ('genomes-barcode', 'Is it the fish on the label?', '¿Es el pescado de la etiqueta?', 'seq-barcode',
         [(P, 'worried', 'A fillet sold as one fish. Is it really that fish? A laboratory can check.', 'Un filete vendido como un pescado. ¿Es de verdad ese pescado? Un laboratorio puede comprobarlo.'),
          (D, 'thinking', 'Put the steps of the test in order.', 'Pon en orden los pasos de la prueba.')],
         [(D, 'happy', 'A name from a few milligrams of fish. It also helps with wildlife and museum specimens.', 'Un nombre a partir de unos miligramos de pescado. También sirve para la fauna y para ejemplares de museo.')]),
        ('genomes-swab', 'A test for your cat', 'Un test para tu gato', 'seq-swab',
         [(P, 'happy', 'A cheek swab, a cat and a gel. It is a detective story with whiskers.', 'Un frotis de mejilla, un gato y un gel. Una historia de detectives con bigotes.'),
          (D, 'thinking', 'Combine PCR, an enzyme and a gel, and put the steps in order.', 'Combina PCR, una enzima y un gel, y pon los pasos en orden.')],
         [(D, 'happy', 'Three techniques you know, in one real test.', 'Tres técnicas que ya conoces, en una prueba real.')]),
        ('genomes-mammoth', 'DNA from the ice age', 'ADN de la edad de hielo', 'asm-mammoth',
         [(D, 'surprised', 'DNA lasts longer in the cold. In the northern ice, scientists found mammoth hair with DNA still inside.', 'El ADN dura más con el frío. En los hielos del norte los científicos encontraron pelo de mamut con ADN todavía dentro.'),
          (P, 'worried', 'It comes in very short pieces. Be gentle.', 'Viene en trozos muy cortos. Con delicadeza.')],
         [(D, 'happy', 'A genome from the ice age. The same trick reads the DNA of any animal.', 'Un genoma de la edad de hielo. El mismo truco lee el ADN de cualquier animal.')]),
        ('genomes-yeast', 'The yeast genome', 'El genoma de la levadura', 'asm-yeast',
         [(D, 'happy', 'The yeast of bread and beer was the first organism with a nucleus to be read from end to end.', 'La levadura del pan y la cerveza fue el primer organismo con núcleo leído de principio a fin.'),
          (P, 'thinking', 'My friend the yeast, famous at last.', 'Mi amiga la levadura, famosa por fin.')],
         [(D, 'happy', 'Knowing a model genome helped us to understand ours. Humble yeast, big lessons.', 'Conocer un genoma modelo nos ayudó a entender el nuestro. Una levadura humilde, grandes lecciones.')]),
    ],
    'editing': [
        ('editing-mushroom', 'The mushroom that stays white', 'La seta que sigue blanca', 'crispr-6',
         [(D, 'happy', 'A mushroom that stays white for longer. CRISPR can turn down the browning enzyme.', 'Una seta que se mantiene blanca más tiempo. CRISPR puede bajar la enzima del pardeamiento.'),
          (P, 'thinking', 'Five guides, one answer. I will not tell.', 'Cinco guías, una respuesta. No lo diré.')],
         [(D, 'happy', 'No foreign genes added: only a small change in the mushroom\'s own gene.', 'Sin genes ajenos: solo un cambio pequeño en un gen propio de la seta.')]),
        ('editing-corn', 'Corn with a better starch', 'Maíz con un almidón mejor', 'crispr-7',
         [(D, 'thinking', 'Corn starch has straight and branched chains. Switch off the gene of the straight ones and you get a new starch.', 'El almidón del maíz tiene cadenas rectas y ramificadas. Apaga el gen de las rectas y tendrás un almidón nuevo.'),
          (P, 'neutral', 'Pick the guide. Be precise.', 'Elige la guía. Sé preciso.')],
         [(D, 'happy', 'Getting this by crossing plants could take many years. Editing is a shortcut, not a magic wand.', 'Conseguir esto cruzando plantas podría llevar muchos años. Editar es un atajo, no una varita mágica.')]),
    ],
    'food': [
        ('food-browning', 'The apple that turns brown', 'La manzana que se pone marrón', 'browning',
         [(D, 'happy', 'A cut apple turns brown in minutes. An enzyme meets oxygen, and the phenols change colour.', 'Una manzana cortada se pone marrón en minutos. Una enzima se encuentra con el oxígeno y los fenoles cambian de color.'),
          (P, 'surprised', 'I am afraid of apples now.', 'Ahora les tengo miedo a las manzanas.')],
         [(D, 'thinking', 'Lemon juice slows it. Some apples have the enzyme turned down. Same pathway, different brakes.', 'El zumo de limón lo frena. En algunas manzanas se ha bajado la enzima. La misma ruta, distintos frenos.')]),
    ],
    'materials': [
        ('materials-denim', 'Jeans washed by a fungus', 'Vaqueros lavados por un hongo', 'denim',
         [(D, 'happy', 'Jeans are soft because they were washed with an enzyme from a fungus.', 'Los vaqueros son suaves porque se lavaron con una enzima de un hongo.'),
          (P, 'neutral', 'A fungus does the laundry. I am being replaced.', 'Un hongo hace la colada. Me están sustituyendo.')],
         [(D, 'happy', 'In many laundries enzymes took over part of the work of pumice stones. Gentler on the fabric.', 'En muchas lavanderías las enzimas se encargaron de parte del trabajo de las piedras pómez. Más suave con la tela.')]),
    ],
    'energy': [
        ('energy-compost', 'A heap that warms itself', 'Un montón que se calienta solo', 'tune-compost',
         [(D, 'happy', 'Waste can be energy too: a compost heap is a city of microbes that warms itself.', 'Los residuos también pueden ser energía: un montón de compost es una ciudad de microbios que se calienta sola.'),
          (P, 'thinking', 'A heap with a temperature dial. My favourite kind of heap.', 'Un montón con dial de temperatura. Mi tipo de montón favorito.')],
         [(D, 'happy', 'Hot enough to kill weed seeds and germs. Then the waste becomes soil.', 'Lo bastante caliente para matar semillas de malas hierbas y gérmenes. Después los restos se vuelven tierra.')]),
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
