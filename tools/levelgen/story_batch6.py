"""Inserts the second round of everyday-case scenes (batch 5e to 5g) into the story chapters.

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
    'peas': [
        ('peas-calico', 'The cat with two colours', 'El gato de dos colores', 'inh-calico',
         [(D, 'happy', 'Tortoiseshell and calico cats are almost always female. The reason is on the X chromosome.', 'Los gatos carey y calicó casi siempre son hembras. El motivo está en el cromosoma X.'),
          (P, 'thinking', 'A gene with a gender. I have never been so curious.', 'Un gen con género. Nunca había sentido tanta curiosidad.')],
         [(D, 'happy', 'A male has one X, so he shows one colour. A female with two different X chromosomes becomes a patchwork.', 'Un macho tiene un X, así que muestra un color. Una hembra con dos X distintos se convierte en un mosaico.')]),
        ('peas-flies', 'The fly with white eyes', 'La mosca de ojos blancos', 'inh-flies',
         [(D, 'surprised', 'In 1910 a researcher saw a white-eyed fly among thousands of red-eyed ones. Following its children changed genetics.', 'En 1910 un investigador vio una mosca de ojos blancos entre miles de ojos rojos. Seguir a sus hijos cambió la genética.'),
          (P, 'neutral', 'One fly, and a whole field of science grew out of it.', 'Una mosca, y de ella salió todo un campo de la ciencia.')],
         [(D, 'thinking', 'The white eyes were mostly in males. A trait that depends on sex pointed to a sex chromosome.', 'Los ojos blancos aparecían sobre todo en machos. Un rasgo que depende del sexo apuntaba a un cromosoma sexual.')]),
    ],
    'typos': [
        ('typos-tiger', 'The white tiger', 'El tigre blanco', 'mut-tiger',
         [(D, 'happy', 'White tigers have blue eyes and dark stripes. They are not albino. Their secret is one swapped amino acid.', 'Los tigres blancos tienen los ojos azules y rayas oscuras. No son albinos. Su secreto es un aminoácido cambiado.'),
          (P, 'surprised', 'A white coat from one letter. Even my paint job needs more.', 'Un pelaje blanco con una letra. Hasta mi pintura necesita más.')],
         [(D, 'thinking', 'Two copies of a recessive change. Relatives bred together made it common in zoos.', 'Dos copias de un cambio recesivo. Cruzar parientes lo hizo común en los zoos.')]),
        ('typos-dog', 'Long hair on a dog', 'Pelo largo en un perro', 'mut-dogfur',
         [(D, 'happy', 'Remember the dogs with long and short hair? Here is a letter behind them, in a gene that tells hair when to stop.', '¿Recuerdas los perros de pelo largo y corto? Aquí hay una letra detrás de ellos, en un gen que dice al pelo cuándo parar.'),
          (P, 'happy', 'A weaker stop signal: that explains my uncle\'s mop.', 'Una señal de parada más débil: eso explica la melena de mi tío.')],
         [(D, 'happy', 'A small change in a gene, and a new look. Breeders have used it for centuries without knowing.', 'Un cambio pequeño en un gen, y un aspecto nuevo. Quien cría perros lo ha usado durante siglos sin saberlo.')]),
        ('typos-muscle', 'The brake of the muscles', 'El freno de los músculos', 'mut-muscle',
         [(D, 'thinking', 'Every mammal makes a protein that tells muscles to stop growing. In some cattle it does not work.', 'Todos los mamíferos fabrican una proteína que dice a los músculos que dejen de crecer. En algunas vacas no funciona.'),
          (P, 'worried', 'A brake that fails. Let us hope not on a bicycle.', 'Un freno que falla. Esperemos que no en una bicicleta.')],
         [(D, 'happy', 'Different breeds, different changes, the same effect. Nature finds several ways to the same result.', 'Razas distintas, cambios distintos, el mismo efecto. La naturaleza encuentra varios caminos al mismo resultado.')]),
        ('typos-wheat', 'The wheat of the Green Revolution', 'El trigo de la Revolución Verde', 'mut-wheat',
         [(D, 'happy', 'Here is a case where a stop codon helped to feed the world: short wheat that did not fall over.', 'Aquí hay un caso en el que un codón de fin ayudó a alimentar al mundo: un trigo bajo que no se tumbaba.'),
          (P, 'surprised', 'A stop that makes something go. I need a moment.', 'Una parada que hace que algo funcione. Necesito un momento.')],
         [(D, 'thinking', 'The cell restarts reading later and makes a changed protein that cannot be switched off. Biology loves surprises.', 'La célula reanuda la lectura más tarde y fabrica una proteína cambiada que no se puede apagar. A la biología le encantan las sorpresas.')]),
    ],
    'pasteur': [
        ('pasteur-wine', 'From grapes to wine', 'De la uva al vino', 'seq-wine',
         [(D, 'happy', 'The French chemist was first asked about wine. Here is the process he studied, in order.', 'Al químico francés le preguntaron primero por el vino. Este es el proceso que estudió, en orden.'),
          (P, 'happy', 'The yeast in the middle gets all the credit. I approve.', 'La levadura del medio se lleva todo el mérito. Lo apruebo.')],
         [(D, 'happy', 'Yeast ferments, and other microbes spoil. He saw the difference, and that is the root of food safety.', 'La levadura fermenta, y otros microbios estropean. Él vio la diferencia, y esa es la raíz de la seguridad alimentaria.')]),
    ],
    'ferment': [
        ('ferment-cocoa', 'Chocolate starts in a heap', 'El chocolate empieza en un montón', 'cocoa',
         [(D, 'happy', 'Before chocolate, cocoa beans sit for days in a heap of sticky pulp, and microbes work in shifts.', 'Antes del chocolate, los granos de cacao pasan días en un montón de pulpa pegajosa, y los microbios trabajan por turnos.'),
          (P, 'thinking', 'Yeast first, vinegar bacteria second. Like a relay race with smells.', 'Primero la levadura, después las bacterias del vinagre. Como una carrera de relevos con olores.')],
         [(D, 'happy', 'The acid seeps into the bean, and the flavour that we love is prepared. The roasting finishes it.', 'El ácido penetra en el grano y se prepara el sabor que nos gusta. El tostado lo termina.')]),
        ('ferment-kimchi-tune', 'The perfect jar of kimchi', 'El tarro de kimchi perfecto', 'tune-kimchi',
         [(D, 'thinking', 'You know the pathway. Now tune it: salt, warmth, time and brine have to be in balance.', 'Ya conoces la ruta. Ahora ajústala: la sal, el calor, el tiempo y la salmuera tienen que estar en equilibrio.'),
          (P, 'neutral', 'My recipe: patience and a very large jar.', 'Mi receta: paciencia y un tarro muy grande.')],
         [(D, 'happy', 'Every home has its own balance. A factory only writes it down in numbers.', 'Cada casa tiene su equilibrio. Una fábrica solo lo escribe con números.')]),
        ('ferment-dairy', 'Tuning the dairy', 'Ajustando la quesería', 'tune-cheese',
         [(P, 'happy', 'Now we run the dairy. Temperature, rennet, waiting and cutting.', 'Ahora dirigimos la quesería. Temperatura, cuajo, espera y corte.'),
          (D, 'thinking', 'More cheese from the same milk is a matter of small, careful choices.', 'Más queso de la misma leche es cuestión de decisiones pequeñas y cuidadosas.')],
         [(D, 'happy', 'A steady rennet made by microbes means a steady curd. That is what dairies like.', 'Un cuajo constante fabricado por microbios significa una cuajada constante. Eso es lo que quieren las queserías.')]),
    ],
    'copies': [
        ('copies-primer', 'The primer that finds its place', 'El cebador que encuentra su sitio', 'pair-primer',
         [(D, 'happy', 'Remember PCR? It all starts with a short piece of DNA, the primer, that pairs with the place to copy.', '¿Recuerdas la PCR? Todo empieza con un trozo corto de ADN, el cebador, que se empareja con el lugar que se quiere copiar.'),
          (P, 'neutral', 'Twenty letters that find one place among billions. That is aim.', 'Veinte letras que encuentran un sitio entre miles de millones. Eso es puntería.')],
         [(D, 'happy', 'Pairing rules again, doing a different job. Biology is thrifty with its ideas.', 'Las reglas de emparejamiento otra vez, con otro trabajo. La biología es ahorradora con sus ideas.')]),
        ('copies-crop', 'The road of a new crop', 'El camino de un cultivo nuevo', 'seq-crop',
         [(D, 'thinking', 'We have copied and moved genes. How does a gene end up in a crop that farmers can buy? It takes years.', 'Hemos copiado y movido genes. ¿Cómo llega un gen a un cultivo que se puede comprar? Lleva años.'),
          (P, 'worried', 'Eight steps and one very patient scientist.', 'Ocho pasos y un científico muy paciente.')],
         [(D, 'happy', 'From a gene to a field, with tests at every step. Knowing the road helps to talk about it with facts.', 'De un gen a un campo, con pruebas en cada paso. Conocer el camino ayuda a hablar de ello con datos.')]),
    ],
    'genomes': [
        ('genomes-neandertal', 'DNA of a cousin', 'ADN de un primo', 'asm-neandertal',
         [(D, 'surprised', 'We have read the DNA of people who died forty thousand years ago. Their bones were in a cool cave.', 'Hemos leído el ADN de personas que murieron hace cuarenta mil años. Sus huesos estaban en una cueva fresca.'),
          (P, 'worried', 'Tiny broken pieces. Be as gentle as with the mammoth.', 'Trocitos rotos. Con tanta delicadeza como con el mamut.')],
         [(D, 'happy', 'Many people today carry a little of their DNA. Our family tree has more branches than we thought.', 'Muchas personas de hoy llevan un poco de su ADN. Nuestro árbol familiar tiene más ramas de las que pensábamos.')]),
    ],
    'editing': [
        ('editing-tomato', 'The tomato that makes more GABA', 'El tomate que fabrica más GABA', 'crispr-8',
         [(D, 'happy', 'An enzyme with a built-in brake. Cut the brake, and the tomato makes much more of a natural molecule.', 'Una enzima con un freno incorporado. Corta el freno y el tomate fabrica mucho más de una molécula natural.'),
          (P, 'thinking', 'Four guides, one cut. Aim carefully.', 'Cuatro guías, un corte. Apunta bien.')],
         [(D, 'happy', 'One of the first gene-edited foods sold in the shops. A small cut, a new tomato.', 'Uno de los primeros alimentos editados genéticamente que se vendieron en las tiendas. Un corte pequeño, un tomate nuevo.')]),
        ('editing-pig', 'A pig the virus cannot enter', 'Un cerdo en el que el virus no entra', 'crispr-9',
         [(D, 'thinking', 'A virus that only affects pigs gets in through one receptor. Edit the receptor, and the door closes.', 'Un virus que solo afecta a los cerdos entra por un receptor. Edita el receptor y la puerta se cierra.'),
          (P, 'worried', 'Five guides. One of them also cuts somewhere else. Careful.', 'Cinco guías. Una de ellas corta también en otro sitio. Cuidado.')],
         [(D, 'happy', 'Resistance in the animal itself, with no genes from another species. A different way to protect a farm.', 'Resistencia en el propio animal, sin genes de otra especie. Una forma distinta de proteger una granja.')]),
    ],
    'food': [
        ('food-stevia', 'The sweet leaf', 'La hoja dulce', 'stevia',
         [(D, 'happy', 'A leaf sweeter than sugar, with no calories. Its secret is how many sugar units are stuck to a core molecule.', 'Una hoja más dulce que el azúcar, sin calorías. Su secreto es cuántas unidades de azúcar están pegadas a una molécula central.'),
          (P, 'happy', 'A sweetener that adds up its own sugar. I like the accounting.', 'Un edulcorante que suma su propio azúcar. Me gusta la contabilidad.')],
         [(D, 'thinking', 'The best-tasting molecules are rare in the leaf. That is where yeast comes in, next.', 'Las moléculas de mejor sabor son raras en la hoja. Ahí es donde entra después la levadura.')]),
        ('food-sweet', 'A sweet protein from yeast', 'Una proteína dulce hecha por levadura', 'build-sweet',
         [(D, 'happy', 'Some fruits make proteins that are hundreds of times sweeter than sugar. A yeast can make them in a tank.', 'Algunas frutas fabrican proteínas cientos de veces más dulces que el azúcar. Una levadura puede fabricarlas en un tanque.'),
          (P, 'neutral', 'Yeast circuit: no bacterial parts, please.', 'Circuito de levadura: sin piezas bacterianas, por favor.')],
         [(D, 'happy', 'The tag sends the protein out of the cell, so it can be collected from the liquid. Smart and simple.', 'La etiqueta envía la proteína fuera de la célula, así que se puede recoger del líquido. Inteligente y sencillo.')]),
    ],
    'materials': [
        ('materials-cellulase', 'The gene of the jeans enzyme', 'El gen de la enzima de los vaqueros', 'cut-cellulase',
         [(D, 'thinking', 'The enzyme that washes jeans comes from a gene of a fungus. To make it in a tank, we first cut the gene out.', 'La enzima que lava los vaqueros viene de un gen de un hongo. Para fabricarla en un tanque, primero sacamos el gen.'),
          (P, 'worried', 'One band in the gel is the same size as the gene. It is a liar.', 'Una banda del gel tiene el mismo tamaño que el gen. Es una mentirosa.')],
         [(D, 'happy', 'A band says how long a piece is, not which piece it is. The map says the rest.', 'Una banda dice cuánto mide un trozo, no qué trozo es. El mapa dice lo demás.')]),
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
