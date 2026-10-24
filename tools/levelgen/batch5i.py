import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from specs5 import *

# Two-gene inheritance: a square for each gene, and the answer is the product of the two chances.

def sc2(p1, p2, p1b, p2b, l1, l2, q, target, targetB, why):
    d = sc(p1, p2, l1, l2, q, target, why)
    d.update(p1b=p1b, p2b=p2b, targetB=targetB)
    return d

TWO_HINTS = lambda a, b: [
    B('Fill in one square for each gene. Then work out the chance of each trait on its own.', 'Rellena un cuadro por cada gen. Luego calcula la probabilidad de cada rasgo por separado.'),
    B('For each square, count the cells with the trait asked about and say it as a fraction of four. ' + a, 'En cada cuadro, cuenta las casillas con el rasgo por el que preguntan y dilo como fracción de cuatro. ' + b),
    B('Multiply the two fractions. For example, 3/4 × 1/4 = 3/16.', 'Multiplica las dos fracciones. Por ejemplo, 3/4 × 1/4 = 3/16.')]

TWO_SIMPLIFY = B('The two genes are on different chromosomes, so they are inherited separately. Genes that sit close together on the same chromosome are inherited together more often than this rule predicts.', 'Los dos genes están en cromosomas distintos, así que se heredan por separado. Los genes que están muy juntos en el mismo cromosoma se heredan juntos más a menudo de lo que predice esta regla.')

inh_peas2 = inh_spec('inh-dihybrid-peas', B('Round and yellow: the 9:3:3:1 peas', 'Redondo y amarillo: los guisantes 9:3:3:1'), B('Two genes at once, as Mendel did', 'Dos genes a la vez, como hizo Mendel'), 'advanced', 9, 'plant',
    B('Fill in two Punnett squares, one for the shape and one for the colour of the pea, and find the chance of two traits at the same time.', 'Rellena dos cuadros de Punnett, uno para la forma y otro para el color del guisante, y halla la probabilidad de dos rasgos a la vez.'),
    B('Mendel did not only follow one trait. He crossed peas that differed in shape and in colour, and counted how many of each kind appeared. The numbers were close to nine, three, three and one.', 'Mendel no siguió solo un rasgo. Cruzó guisantes que se diferenciaban en la forma y en el color, y contó cuántos de cada tipo aparecían. Los números se acercaron a nueve, tres, tres y uno.'),
    org('pisum-two', 'Garden pea', 'Guisante', 'Pisum sativum', B('The plant of Mendel\'s experiments.', 'La planta de los experimentos de Mendel.'), PLANT + ['Magnoliopsida', 'Fabales', 'Fabaceae', 'Pisum'], tissue='seed'),
    [ex('plant', B('Two traits', 'Dos rasgos'), B('Shape and colour', 'Forma y color'), B('A pea can be round or wrinkled, and yellow or green. Round and yellow are dominant. The two traits are decided by two different genes.', 'Un guisante puede ser redondo o arrugado, y amarillo o verde. Redondo y amarillo son dominantes. Los dos rasgos los deciden dos genes distintos.')),
     ex('dna', B('The rule', 'La regla'), B('Chances multiply', 'Las probabilidades se multiplican'), B('If the genes are inherited separately, the chance of both traits at once is the product of the chances of each: 3/4 round × 3/4 yellow = 9/16.', 'Si los genes se heredan por separado, la probabilidad de los dos rasgos a la vez es el producto de las de cada uno: 3/4 redondo × 3/4 amarillo = 9/16.'))],
    dict(trait=B('Shape', 'Forma'), alleles=['R', 'r'], phenotypes={'RR': 'round', 'Rr': 'round', 'rr': 'wrinkled'},
         labels={'round': B('Round', 'Redondo'), 'wrinkled': B('Wrinkled', 'Arrugado')},
         second=dict(trait=B('Colour', 'Color'), alleles=['Y', 'y'], phenotypes={'YY': 'yellow', 'Yy': 'yellow', 'yy': 'green'},
                     labels={'yellow': B('Yellow', 'Amarillo'), 'green': B('Green', 'Verde')}),
         scenarios=[
             sc2('Rr', 'Rr', 'Yy', 'Yy', B('Round and yellow, carries both recessives', 'Redondo y amarillo, lleva los dos recesivos'), B('Round and yellow, carries both recessives', 'Redondo y amarillo, lleva los dos recesivos'),
                 B('Two peas that are round and yellow but carry both recessive alleles (RrYy) are crossed. What is the probability of a seed that is round AND yellow?', 'Se cruzan dos guisantes redondos y amarillos que llevan los dos alelos recesivos (RrYy). ¿Qué probabilidad hay de una semilla redonda Y amarilla?'), 'round', 'yellow',
                 B('Round: 3 cells of 4 in the first square. Yellow: 3 cells of 4 in the second. 3/4 × 3/4 = 9/16.', 'Redondo: 3 casillas de 4 en el primer cuadro. Amarillo: 3 casillas de 4 en el segundo. 3/4 × 3/4 = 9/16.')),
             sc2('Rr', 'Rr', 'Yy', 'Yy', B('Round and yellow, carries both recessives', 'Redondo y amarillo, lleva los dos recesivos'), B('Round and yellow, carries both recessives', 'Redondo y amarillo, lleva los dos recesivos'),
                 B('The same two peas are crossed. What is the probability of a seed that is wrinkled AND green?', 'Se cruzan los mismos dos guisantes. ¿Qué probabilidad hay de una semilla arrugada Y verde?'), 'wrinkled', 'green',
                 B('Wrinkled: 1 cell of 4. Green: 1 cell of 4. 1/4 × 1/4 = 1/16. It is the rarest kind, the one in the 9:3:3:1.', 'Arrugado: 1 casilla de 4. Verde: 1 casilla de 4. 1/4 × 1/4 = 1/16. Es el tipo más raro, el del 9:3:3:1.')),
             sc2('Rr', 'rr', 'Yy', 'yy', B('Round and yellow, carries both recessives', 'Redondo y amarillo, lleva los dos recesivos'), B('Wrinkled and green', 'Arrugado y verde'),
                 B('A pea RrYy is crossed with a wrinkled, green one (rryy). What is the probability of a seed that is round AND green?', 'Un guisante RrYy se cruza con uno arrugado y verde (rryy). ¿Qué probabilidad hay de una semilla redonda Y verde?'), 'round', 'green',
                 B('Round: 2 cells of 4. Green: 2 cells of 4. 1/2 × 1/2 = 1/4. This kind of cross is used to find out what a plant carries.', 'Redondo: 2 casillas de 4. Verde: 2 casillas de 4. 1/2 × 1/2 = 1/4. Este tipo de cruce sirve para averiguar qué lleva una planta.'))]),
    TWO_HINTS('Round needs an R; yellow needs a Y.', 'Redondo necesita una R; amarillo necesita una Y.'),
    **closing(B('Nine, three, three and one', 'Nueve, tres, tres y uno'),
              B('You saw that two traits inherited separately follow the same rules as one, and that their chances multiply.', 'Has visto que dos rasgos que se heredan por separado siguen las mismas reglas que uno, y que sus probabilidades se multiplican.'),
              B('The multiplication rule is used by breeders to know how many plants they must grow to find the one with the combination they want.', 'La regla de la multiplicación la usa quien mejora plantas para saber cuántas tiene que cultivar para encontrar la que tiene la combinación que busca.'),
              B('In 1866 Gregor Mendel reported that, in his crosses of peas that differed in shape and colour, the second generation had about 9 round yellow, 3 round green, 3 wrinkled yellow and 1 wrinkled green for each 16 seeds.', 'En 1866 Gregor Mendel describió que, en sus cruces de guisantes que se diferenciaban en forma y color, la segunda generación tenía unos 9 redondos amarillos, 3 redondos verdes, 3 arrugados amarillos y 1 arrugado verde por cada 16 semillas.'),
              B('The 9:3:3:1 ratio appears when each gene follows the 3:1 ratio of its own and the two genes are inherited independently. It led Mendel to his law of independent assortment.', 'La proporción 9:3:3:1 aparece cuando cada gen sigue su propia proporción 3:1 y los dos genes se heredan de forma independiente. Llevó a Mendel a su ley de la herencia independiente.'),
              [TWO_SIMPLIFY],
              [ref(['Mendel, G.'], 1866, 'Versuche über Pflanzen-Hybriden', 'Verhandlungen des naturforschenden Vereines in Brünn', None, 'paper')]))

inh_tomato2 = inh_spec('inh-dihybrid-tomato', B('Red tomatoes for a small garden', 'Tomates rojos para un huerto pequeño'), B('Colour and height, planned together', 'Color y altura, planificados juntos'), 'advanced', 8, 'tomato',
    B('Fill in two Punnett squares, one for the colour of the fruit and one for the height of the plant, and find the chance of the combination you want.', 'Rellena dos cuadros de Punnett, uno para el color del fruto y otro para la altura de la planta, y halla la probabilidad de la combinación que quieres.'),
    B('A breeder wants a tomato plant that is dwarf, to grow in a pot, and has red fruit. Colour and height are two different genes, so the plan needs two squares.', 'Quien mejora plantas quiere un tomatero enano, para cultivarlo en maceta, y con frutos rojos. El color y la altura son dos genes distintos, así que el plan necesita dos cuadros.'),
    org('tomato-two', 'Tomato', 'Tomate', 'Solanum lycopersicum', B('A plant whose colour and size depend on separate genes.', 'Una planta cuyo color y tamaño dependen de genes distintos.'), PLANT + ['Magnoliopsida', 'Solanales', 'Solanaceae', 'Solanum'], tissue='fruit'),
    [ex('tomato', B('Two traits', 'Dos rasgos'), B('Colour and height', 'Color y altura'), B('Red fruit is dominant over yellow, and a tall plant is dominant over a dwarf one. Dwarf plants are compact and are grown in pots.', 'El fruto rojo es dominante sobre el amarillo, y una planta alta es dominante sobre una enana. Las plantas enanas son compactas y se cultivan en macetas.')),
     ex('dna', B('The plan', 'El plan'), B('How many plants to grow?', '¿Cuántas plantas cultivar?'), B('If the chance of the plant you want is 3/16, about three of every sixteen seedlings will be right. That tells you how many to sow.', 'Si la probabilidad de la planta que quieres es 3/16, unas tres de cada dieciséis plántulas serán las correctas. Eso te dice cuántas sembrar.'))],
    dict(trait=B('Fruit colour', 'Color del fruto'), alleles=['R', 'r'], phenotypes={'RR': 'red', 'Rr': 'red', 'rr': 'yellow'},
         labels={'red': B('Red fruit', 'Fruto rojo'), 'yellow': B('Yellow fruit', 'Fruto amarillo')},
         second=dict(trait=B('Plant height', 'Altura de la planta'), alleles=['D', 'd'], phenotypes={'DD': 'tall', 'Dd': 'tall', 'dd': 'dwarf'},
                     labels={'tall': B('Tall plant', 'Planta alta'), 'dwarf': B('Dwarf plant', 'Planta enana')}),
         scenarios=[
             sc2('Rr', 'Rr', 'Dd', 'Dd', B('Red and tall, carries yellow and dwarf', 'Roja y alta, lleva amarillo y enano'), B('Red and tall, carries yellow and dwarf', 'Roja y alta, lleva amarillo y enano'),
                 B('Two red, tall plants that carry the recessive alleles (RrDd) are crossed. What is the probability of a plant with red fruit AND dwarf?', 'Se cruzan dos plantas rojas y altas que llevan los alelos recesivos (RrDd). ¿Qué probabilidad hay de una planta de fruto rojo Y enana?'), 'red', 'dwarf',
                 B('Red: 3 cells of 4. Dwarf: 1 cell of 4. 3/4 × 1/4 = 3/16.', 'Rojo: 3 casillas de 4. Enana: 1 casilla de 4. 3/4 × 1/4 = 3/16.')),
             sc2('Rr', 'Rr', 'Dd', 'DD', B('Red and tall, carries yellow and dwarf', 'Roja y alta, lleva amarillo y enano'), B('Red and tall, carries yellow', 'Roja y alta, lleva amarillo'),
                 B('A plant RrDd is crossed with a plant RrDD. What is the probability of a plant with red fruit AND tall?', 'Una planta RrDd se cruza con una planta RrDD. ¿Qué probabilidad hay de una planta de fruto rojo Y alta?'), 'red', 'tall',
                 B('Red: 3 cells of 4. Tall: all 4 cells of the second square have a D. 3/4 × 1 = 3/4.', 'Rojo: 3 casillas de 4. Alta: las 4 casillas del segundo cuadro tienen una D. 3/4 × 1 = 3/4.')),
             sc2('Rr', 'rr', 'Dd', 'dd', B('Red and tall, carries yellow and dwarf', 'Roja y alta, lleva amarillo y enano'), B('Yellow and dwarf', 'Amarilla y enana'),
                 B('A plant RrDd is crossed with a yellow, dwarf plant (rrdd). What is the probability of a plant with yellow fruit AND dwarf?', 'Una planta RrDd se cruza con una amarilla y enana (rrdd). ¿Qué probabilidad hay de una planta de fruto amarillo Y enana?'), 'yellow', 'dwarf',
                 B('Yellow: 2 cells of 4. Dwarf: 2 cells of 4. 1/2 × 1/2 = 1/4.', 'Amarillo: 2 casillas de 4. Enana: 2 casillas de 4. 1/2 × 1/2 = 1/4.'))]),
    TWO_HINTS('Red needs an R; tall needs a D.', 'Rojo necesita una R; alta necesita una D.'),
    **closing(B('A plan with fractions', 'Un plan con fracciones'),
              B('You planned a cross with two genes and found the chance of the combination that you wanted.', 'Has planificado un cruce con dos genes y has hallado la probabilidad de la combinación que querías.'),
              B('Breeders use these fractions every season to decide how many seeds to sow to be sure of finding the plants they want.', 'Quien mejora plantas usa estas fracciones cada temporada para decidir cuántas semillas sembrar y estar seguro de encontrar las plantas que busca.'),
              B('Compact tomato plants for pots and balconies were bred by crossing, selecting and crossing again, using the same rules that Mendel found with peas.', 'Los tomateros compactos para macetas y balcones se lograron cruzando, seleccionando y volviendo a cruzar, con las mismas reglas que Mendel halló con los guisantes.'),
              B('When two genes sit on different chromosomes, the two squares are independent, and their chances multiply. The approach is called the product rule or the forked-line method.', 'Cuando dos genes están en cromosomas distintos, los dos cuadros son independientes y sus probabilidades se multiplican. El método se llama regla del producto o método de las ramas.'),
              [TWO_SIMPLIFY],
              []))

inh_cat2 = inh_spec('inh-dihybrid-cat', B('The Himalayan cat', 'El gato himalayo'), B('Siamese colour and long hair together', 'Color siamés y pelo largo juntos'), 'advanced', 8, 'cell',
    B('Fill in two Punnett squares, one for the colour pattern and one for the length of the hair, and find the chance of a cat with both rare traits.', 'Rellena dos cuadros de Punnett, uno para el patrón de color y otro para la longitud del pelo, y halla la probabilidad de un gato con los dos rasgos raros.'),
    B('The Himalayan cat has the dark points of a Siamese and the long coat of a Persian. Both traits are recessive, so a Himalayan kitten needs two copies of each recessive allele.', 'El gato himalayo tiene las puntas oscuras de un siamés y el pelo largo de un persa. Los dos rasgos son recesivos, así que un gatito himalayo necesita dos copias de cada alelo recesivo.'),
    org('cat-two', 'Domestic cat', 'Gato doméstico', 'Felis catus', B('A pet whose breeds combine traits from separate genes.', 'Una mascota cuyas razas combinan rasgos de genes distintos.'), MAMMAL + ['Carnivora', 'Felidae', 'Felis'], tissue='skin'),
    [ex('cell', B('Two breeds', 'Dos razas'), B('Siamese and Persian', 'Siamés y persa'), B('Himalayan cats were created in the twentieth century by crossing Persians with Siamese and keeping the kittens that had both traits.', 'Los gatos himalayos se crearon en el siglo XX cruzando persas con siameses y quedándose con los gatitos que tenían los dos rasgos.')),
     ex('dna', B('Two recessives', 'Dos recesivos'), B('Only 1 in 16', 'Solo 1 de cada 16'), B('If two cats that carry both recessive alleles are crossed, only one kitten in sixteen shows both traits: 1/4 × 1/4.', 'Si se cruzan dos gatos que llevan los dos alelos recesivos, solo un gatito de cada dieciséis muestra los dos rasgos: 1/4 × 1/4.'))],
    dict(trait=B('Colour pattern', 'Patrón de color'), alleles=['C', 'c'], phenotypes={'CC': 'full', 'Cc': 'full', 'cc': 'pointed'},
         labels={'full': B('Full colour', 'Color completo'), 'pointed': B('Siamese pattern', 'Patrón siamés')},
         second=dict(trait=B('Hair length', 'Longitud del pelo'), alleles=['F', 'f'], phenotypes={'FF': 'short', 'Ff': 'short', 'ff': 'long'},
                     labels={'short': B('Short hair', 'Pelo corto'), 'long': B('Long hair', 'Pelo largo')}),
         scenarios=[
             sc2('Cc', 'Cc', 'Ff', 'Ff', B('Full colour, short hair, carries both', 'Color completo, pelo corto, lleva los dos'), B('Full colour, short hair, carries both', 'Color completo, pelo corto, lleva los dos'),
                 B('Two cats with full colour and short hair that carry both recessive alleles (CcFf) have kittens. What is the probability of a kitten with full colour AND short hair?', 'Dos gatos de color completo y pelo corto que llevan los dos alelos recesivos (CcFf) tienen gatitos. ¿Qué probabilidad hay de un gatito de color completo Y pelo corto?'), 'full', 'short',
                 B('Full colour: 3 cells of 4. Short hair: 3 cells of 4. 3/4 × 3/4 = 9/16.', 'Color completo: 3 casillas de 4. Pelo corto: 3 casillas de 4. 3/4 × 3/4 = 9/16.')),
             sc2('Cc', 'Cc', 'Ff', 'Ff', B('Full colour, short hair, carries both', 'Color completo, pelo corto, lleva los dos'), B('Full colour, short hair, carries both', 'Color completo, pelo corto, lleva los dos'),
                 B('The same two cats have kittens. What is the probability of a Himalayan kitten, with the Siamese pattern AND long hair?', 'Los mismos dos gatos tienen gatitos. ¿Qué probabilidad hay de un gatito himalayo, con el patrón siamés Y pelo largo?'), 'pointed', 'long',
                 B('Siamese pattern: 1 cell of 4. Long hair: 1 cell of 4. 1/4 × 1/4 = 1/16.', 'Patrón siamés: 1 casilla de 4. Pelo largo: 1 casilla de 4. 1/4 × 1/4 = 1/16.')),
             sc2('Cc', 'cc', 'ff', 'Ff', B('Full colour, long hair, carries Siamese', 'Color completo, pelo largo, lleva siamés'), B('Siamese pattern, short hair, carries long', 'Patrón siamés, pelo corto, lleva largo'),
                 B('A cat Ccff and a cat ccFf have kittens. What is the probability of a kitten with the Siamese pattern AND short hair?', 'Un gato Ccff y un gato ccFf tienen gatitos. ¿Qué probabilidad hay de un gatito con el patrón siamés Y pelo corto?'), 'pointed', 'short',
                 B('Siamese pattern: 2 cells of 4. Short hair: 2 cells of 4. 1/2 × 1/2 = 1/4.', 'Patrón siamés: 2 casillas de 4. Pelo corto: 2 casillas de 4. 1/2 × 1/2 = 1/4.'))]),
    TWO_HINTS('Full colour needs a C; short hair needs an F.', 'Color completo necesita una C; pelo corto necesita una F.'),
    **closing(B('Two rare traits in one cat', 'Dos rasgos raros en un gato'),
              B('You saw why a cat with two recessive traits is rare, even when both parents carry the alleles.', 'Has visto por qué un gato con dos rasgos recesivos es raro, incluso cuando los dos progenitores llevan los alelos.'),
              B('Breeders who want two recessive traits at once need patience and sometimes several generations.', 'Quien cría animales y quiere dos rasgos recesivos a la vez necesita paciencia y, a veces, varias generaciones.'),
              B('The Himalayan cat is the result of crossing the Siamese and the Persian. In cats, long hair comes from a recessive change in a gene called FGF5, and the Siamese pattern from a recessive change in tyrosinase.', 'El gato himalayo es el resultado de cruzar el siamés y el persa. En los gatos, el pelo largo viene de un cambio recesivo en un gen llamado FGF5, y el patrón siamés, de un cambio recesivo en la tirosinasa.'),
              B('The genes of the colour pattern and the hair length are on different chromosomes, so they are inherited independently, and the chances of each can be multiplied.', 'Los genes del patrón de color y de la longitud del pelo están en cromosomas distintos, así que se heredan de forma independiente y las probabilidades de cada uno se pueden multiplicar.'),
              [TWO_SIMPLIFY],
              []))

write_levels([inh_peas2, inh_tomato2, inh_cat2])
