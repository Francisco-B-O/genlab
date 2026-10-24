import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from specs5 import *

# ═════════════════════════ CUT: two genes from the kitchen and the shop ═════════════════════════

cut_chymosin = cut_spec('cut-chymosin', B('Taking the rennet gene out', 'Sacar el gen del cuajo'), B('Two enzymes for one gene', 'Dos enzimas para un gen'), 'intermediate', 7, 'cheese',
    B('Cut the prochymosin gene out of its DNA. No single enzyme does it cleanly here: look for the pair.', 'Saca el gen de la proquimosina de su ADN. Aquí ninguna enzima lo hace limpiamente sola: busca la pareja.'),
    B('A stretch of DNA from a calf carries the gene for prochymosin. To move it into a microbe, it has to be cut out whole, with nothing missing and nothing extra.', 'Un trozo de ADN de un ternero lleva el gen de la proquimosina. Para pasarlo a un microbio hay que sacarlo entero, sin que falte nada y sin nada de más.'),
    (B('Prochymosin gene', 'Gen de la proquimosina'), 4, 9), 13,
    [ENZ('eco', 'EcoRI', 'GAATTC', [4, 12]), ENZ('bam', 'BamHI', 'GGATCC', [2, 9]), ENZ('hind', 'HindIII', 'AAGCTT', [6.5]), ENZ('sal', 'SalI', 'GTCGAC', [1, 6])],
    [B('The gene needs a cut at each end and none inside. Look at the map: which enzymes cut exactly at the start and at the end?', 'El gen necesita un corte en cada extremo y ninguno dentro. Mira el mapa: ¿qué enzimas cortan justo al principio y al final?'),
     B('Neither EcoRI nor BamHI frees the gene alone, because each one cuts only one end of it. HindIII cuts inside it. SalI gives a band of the right size that is not the gene.', 'Ni EcoRI ni BamHI sueltan el gen solas, porque cada una corta solo un extremo. HindIII corta dentro. SalI da una banda del tamaño correcto que no es el gen.'),
     B('Use EcoRI and BamHI together.', 'Usa EcoRI y BamHI juntas.')],
    [ex('dna', B('Two ends', 'Dos extremos'), B('Each enzyme has its sites', 'Cada enzima tiene sus sitios'), B('One enzyme may cut only at one end of the gene. Then a second enzyme, with its own sequence, is needed for the other end.', 'Una enzima puede cortar solo en un extremo del gen. Entonces hace falta una segunda enzima, con su propia secuencia, para el otro extremo.')),
     ex('milk', B('The goal', 'El objetivo'), B('A gene for cheese', 'Un gen para el queso'), B('The gene will be joined to a plasmid so that bacteria or fungi can make rennet in a tank.', 'El gen se unirá a un plásmido para que bacterias u hongos fabriquen cuajo en un tanque.'))],
    org('chymosin-dna', 'DNA with the prochymosin gene', 'ADN con el gen de la proquimosina', 'Bos taurus', B('A stretch of DNA that contains the gene for the enzyme of rennet.', 'Un trozo de ADN que contiene el gen de la enzima del cuajo.'), MAMMAL + ['Artiodactyla', 'Bovidae', 'Bos'], tissue='nucleus', organelle='nucleus'),
    **closing(B('A gene cut out whole', 'Un gen sacado entero'),
              B('You found that a gene may need two different enzymes, one for each end, and that a band of the right size can be a different piece.', 'Has descubierto que un gen puede necesitar dos enzimas distintas, una para cada extremo, y que una banda del tamaño correcto puede ser otro trozo.'),
              B('Choosing the pair of enzymes is the first step of moving a gene to a microbe, the way many food ingredients and medicines are made today.', 'Elegir la pareja de enzimas es el primer paso para pasar un gen a un microbio, la forma en que se fabrican hoy muchos ingredientes alimentarios y medicamentos.'),
              B('Restriction enzymes were discovered in bacteria, which use them to cut the DNA of viruses. Werner Arber, Daniel Nathans and Hamilton Smith received the 1978 Nobel Prize in Physiology or Medicine for their discovery and use.', 'Las enzimas de restricción se descubrieron en bacterias, que las usan para cortar el ADN de virus. Werner Arber, Daniel Nathans y Hamilton Smith recibieron el Premio Nobel de Fisiología o Medicina de 1978 por su descubrimiento y su aplicación.'),
              B('Each enzyme recognises a short sequence, usually 4 to 8 letters, and cuts there. Using two different enzymes also makes the ends of the gene different, so it joins to the plasmid the right way round.', 'Cada enzima reconoce una secuencia corta, normalmente de 4 a 8 letras, y corta ahí. Usar dos enzimas distintas hace además que los extremos del gen sean diferentes, así que se une al plásmido en el sentido correcto.'),
              [B('The DNA is drawn as a straight stretch and the cutting positions are invented.', 'El ADN se dibuja como un trozo recto y las posiciones de corte son inventadas.'),
               B('Sizes are in kilobases (kb), thousands of letters.', 'Los tamaños están en kilobases (kb), miles de letras.')],
              []))

cut_heme = cut_spec('cut-heme', B('The gene of a red protein', 'El gen de una proteína roja'), B('Five enzymes and a band that lies', 'Cinco enzimas y una banda que miente'), 'advanced', 8, 'burger',
    B('Cut the leghemoglobin gene out of its DNA. One enzyme gives a band of the right size that is not the gene.', 'Saca el gen de la leghemoglobina de su ADN. Una enzima da una banda del tamaño correcto que no es el gen.'),
    B('Soybean roots make leghemoglobin, a red protein that carries oxygen. It gives plant-based burgers their meaty colour and taste once a microbe makes it. First the gene has to be cut out.', 'Las raíces de la soja fabrican leghemoglobina, una proteína roja que lleva oxígeno. Cuando la fabrica un microbio, da a las hamburguesas vegetales su color y su sabor de carne. Primero hay que sacar el gen.'),
    (B('Leghemoglobin gene', 'Gen de la leghemoglobina'), 5, 11), 16,
    [ENZ('eco', 'EcoRI', 'GAATTC', [5, 13.5]), ENZ('bam', 'BamHI', 'GGATCC', [2.5, 11]), ENZ('hind', 'HindIII', 'AAGCTT', [8]), ENZ('xho', 'XhoI', 'CTCGAG', [2, 5, 11.5]), ENZ('not', 'NotI', 'GCGGCCGC', [1, 7])],
    [B('Same rule as always: one cut at each end of the gene and none inside. The gel can fool you.', 'La misma regla de siempre: un corte en cada extremo del gen y ninguno dentro. El gel puede engañarte.'),
     B('One enzyme gives a band the same size as the gene, but its cuts are not at the ends of the gene. Another cuts inside, and another cuts close to the end but not exactly on it.', 'Una enzima da una banda del mismo tamaño que el gen, pero sus cortes no están en los extremos del gen. Otra corta dentro, y otra corta cerca del final pero no justo en él.'),
     B('EcoRI cuts at the start and BamHI at the end. Together they free the gene.', 'EcoRI corta al principio y BamHI al final. Juntas liberan el gen.')],
    [ex('dna', B('The map', 'El mapa'), B('Several enzymes, many sites', 'Varias enzimas, muchos sitios'), B('Real maps are crowded. A site close to the end of the gene is not the same as a site at the end, and a cut inside the gene breaks it.', 'Los mapas reales están llenos. Un sitio cerca del final del gen no es lo mismo que un sitio en el final, y un corte dentro del gen lo rompe.')),
     ex('burger', B('The goal', 'El objetivo'), B('A meaty colour without meat', 'Un color de carne sin carne'), B('The isolated gene goes into a yeast that makes the red protein in large tanks.', 'El gen aislado se introduce en una levadura que fabrica la proteína roja en grandes tanques.'))],
    org('heme-dna', 'DNA with the leghemoglobin gene', 'ADN con el gen de la leghemoglobina', 'Glycine max', B('A stretch of soybean DNA with the gene of a red protein.', 'Un trozo de ADN de soja con el gen de una proteína roja.'), PLANT + ['Magnoliopsida', 'Fabales', 'Fabaceae', 'Glycine'], tissue='nucleus', organelle='nucleus'),
    **closing(B('The right pair of scissors', 'La pareja de tijeras adecuada'),
              B('You chose the pair of enzymes that frees the gene and avoided the band that only looked right.', 'Has elegido la pareja de enzimas que libera el gen y has evitado la banda que solo lo parecía.'),
              B('Plant-based burgers use a protein made by yeast in tanks, so they can have the colour and flavour of meat without using animals.', 'Las hamburguesas vegetales usan una proteína fabricada por levaduras en tanques, así que pueden tener el color y el sabor de la carne sin usar animales.'),
              B('Leghemoglobin is found in the root nodules of legumes, where it keeps oxygen away from the bacteria that fix nitrogen. A yeast called Pichia pastoris has been used to make the soy version for food.', 'La leghemoglobina se encuentra en los nódulos de las raíces de las leguminosas, donde mantiene el oxígeno lejos de las bacterias que fijan nitrógeno. Se ha usado una levadura llamada Pichia pastoris para fabricar la versión de soja destinada a alimentación.'),
              B('Leghemoglobin binds a heme group, the same kind of molecule that makes blood red. The protein carries the heme, and the heme gives the red colour and part of the meaty taste when cooked.', 'La leghemoglobina une un grupo hemo, la misma clase de molécula que da color rojo a la sangre. La proteína lleva el hemo, y el hemo da el color rojo y parte del sabor a carne al cocinar.'),
              [B('The DNA is drawn as a straight stretch and the cutting positions are invented.', 'El ADN se dibuja como un trozo recto y las posiciones de corte son inventadas.'),
               B('Sizes are in kilobases (kb), thousands of letters.', 'Los tamaños están en kilobases (kb), miles de letras.')],
              [ref(['Reyes, T. F.', 'Agrawal, A.', 'Chan, T.', 'et al.'], 2023, 'The safety of soy leghemoglobin protein preparation derived from Pichia pastoris expressing the soybean leghemoglobin gene', 'Journal of Toxicology', '10.1155/2023/7398724')]))

for spec in (cut_chymosin, cut_heme):
    good, impostors = cut_check(spec)
    print(spec['id'], 'frees the gene:', good, '| tempting but wrong:', impostors)
assert ('eco', 'bam') in cut_check(cut_chymosin)[0] and not any(len(g) == 1 for g in cut_check(cut_chymosin)[0])
assert ('eco', 'bam') in cut_check(cut_heme)[0] and not any(len(g) == 1 for g in cut_check(cut_heme)[0])
assert cut_check(cut_heme)[1], 'cut-heme needs an impostor band'

# ═════════════════════════ ASSEMBLE ═════════════════════════

MAMMOTH = ['Animalia', 'Chordata', 'Mammalia', 'Proboscidea', 'Elephantidae', 'Mammuthus']

asm_mammoth = asm_spec('asm-mammoth', B('DNA from the ice age', 'ADN de la edad de hielo'), B('A mammoth, in very short pieces', 'Un mamut, en trozos muy cortos'), 'intermediate', 6, 'dna',
    B('Rebuild a stretch of mammoth DNA from six short, overlapping pieces.', 'Reconstruye un trozo de ADN de mamut a partir de seis fragmentos cortos que se solapan.'),
    B('DNA from the hair of a woolly mammoth that lived thousands of years ago was broken into pieces so short that no single piece says much. Put them back in order.', 'El ADN del pelo de un mamut lanudo que vivió hace miles de años estaba roto en trozos tan cortos que ninguno dice gran cosa. Ponlos de nuevo en orden.'),
    61, 44, 6, 4, False,
    org('mammoth-dna', 'Mammoth hair', 'Pelo de mamut', 'Mammuthus primigenius', B('An extinct elephant relative of the cold steppes.', 'Un pariente extinto de los elefantes de las estepas frías.'), MAMMOTH, tissue='hair'),
    [ex('dna', B('Ancient DNA', 'ADN antiguo'), B('Old and broken', 'Viejo y roto'), B('After an animal dies its DNA breaks into shorter and shorter pieces. In cold places, like the permafrost, some survives for tens of thousands of years.', 'Cuando un animal muere, su ADN se rompe en trozos cada vez más cortos. En lugares fríos, como el permafrost, algo sobrevive decenas de miles de años.')),
     ex('dna', B('Overlaps', 'Solapes'), B('Neighbours share letters', 'Los vecinos comparten letras'), B('Short pieces are read many times, from different places. Where the end of one matches the start of another, they must be neighbours.', 'Los trozos cortos se leen muchas veces, desde sitios distintos. Donde el final de uno coincide con el principio de otro, son vecinos.'))],
    B('Start with the piece that begins with ATG, then look for the one that starts with the last letters of the previous one.', 'Empieza por el trozo que comienza con ATG y busca el que arranca con las últimas letras del anterior.'),
    **closing(B('A genome from the ice age', 'Un genoma de la edad de hielo'),
              B('You rebuilt a sequence from very short pieces, as scientists do with the DNA of extinct animals.', 'Has reconstruido una secuencia a partir de trozos muy cortos, como hacen los científicos con el ADN de animales extintos.'),
              B('Ancient DNA lets us compare extinct animals with living ones, follow how species changed and study how past climates affected them.', 'El ADN antiguo permite comparar animales extintos con los vivos, seguir cómo cambiaron las especies y estudiar cómo les afectaron los climas del pasado.'),
              B('In 2008 a team sequenced a large part of the nuclear genome of the woolly mammoth from the hair of animals preserved in the permafrost. They compared it with the genome of the African elephant.', 'En 2008 un equipo secuenció una gran parte del genoma nuclear del mamut lanudo a partir de pelos de animales conservados en el permafrost. Lo compararon con el genoma del elefante africano.'),
              B('Ancient DNA is short, damaged and mixed with the DNA of microbes from the soil. Software filters the reads and chains the ones that overlap.', 'El ADN antiguo es corto, está dañado y mezclado con ADN de microbios del suelo. Un programa filtra las lecturas y encadena las que se solapan.'),
              [B('The fragments here have 8 to 14 letters; real ancient reads have around 50 to 100.', 'Los fragmentos de aquí tienen de 8 a 14 letras; las lecturas antiguas reales rondan las 50 a 100.'),
               B('The sequence is invented; only the way of rebuilding it is real.', 'La secuencia es inventada; solo es real la forma de reconstruirla.')],
              [ref(['Miller, W.', 'Drautz, D. I.', 'Ratan, A.', 'et al.'], 2008, 'Sequencing the nuclear genome of the extinct woolly mammoth', 'Nature', '10.1038/nature07446')]))

asm_yeast = asm_spec('asm-yeast', B('The genome of bread yeast', 'El genoma de la levadura del pan'), B('The first genome of a cell with a nucleus', 'El primer genoma de una célula con núcleo'), 'advanced', 9, 'yeast',
    B('Assemble a stretch of yeast DNA from seven reads. A repeat can make two joins look right: check the length.', 'Ensambla un trozo de ADN de levadura a partir de siete lecturas. Un repetido puede hacer que dos uniones parezcan correctas: comprueba la longitud.'),
    B('The yeast that makes bread and beer was the first organism with a nucleus to have its whole genome read. Many teams read different parts and software had to put the parts together.', 'La levadura que hace pan y cerveza fue el primer organismo con núcleo cuyo genoma entero se leyó. Muchos equipos leyeron partes distintas y un programa tuvo que unir las partes.'),
    53, 54, 7, 4, True,
    org('yeast-genome', 'Baker\'s yeast', 'Levadura del pan', 'Saccharomyces cerevisiae', B('The yeast of bread, beer and wine.', 'La levadura del pan, la cerveza y el vino.'), FUNGI + ['Saccharomyces'], tissue='single cell', organelle='nucleus'),
    [ex('yeast', B('The genome', 'El genoma'), B('Twelve million letters', 'Doce millones de letras'), B('Yeast has 16 chromosomes and about 6,000 genes in some 12 million letters, small enough to be read first among organisms with a nucleus.', 'La levadura tiene 16 cromosomas y unos 6 000 genes en unos 12 millones de letras, lo bastante pequeño para ser el primero leído entre los organismos con núcleo.')),
     ex('dna', B('Repeats', 'Repetidos'), B('The hard part of assembly', 'Lo difícil del ensamblaje'), B('Genomes are full of repeated stretches. A fragment inside a repeat can match two different places, which is what makes assembly hard.', 'Los genomas están llenos de tramos repetidos. Un fragmento dentro de un repetido puede encajar en dos sitios distintos, y eso es lo que complica el ensamblaje.'))],
    B('Place the fragment that starts with ATG first. At the repeat, check which neighbour fits the following fragment too.', 'Pon primero el fragmento que empieza por ATG. En el repetido, mira qué vecino encaja también con el fragmento siguiente.'),
    repeat=5,
    **closing(B('A first for cells with a nucleus', 'Una primicia para células con núcleo'),
              B('You rebuilt a stretch of the genome of a yeast, avoiding the trick of a repeat.', 'Has reconstruido un trozo del genoma de una levadura, evitando la trampa de un repetido.'),
              B('Knowing the whole genome of yeast made it a model for human cells, and helps to improve the yeasts used in bread, beer, wine, medicines and fuel.', 'Conocer el genoma completo de la levadura la convirtió en un modelo para las células humanas, y ayuda a mejorar las levaduras que se usan en pan, cerveza, vino, medicinas y combustible.'),
              B('In 1996 an international team of hundreds of scientists published the sequence of the genome of baker\'s yeast, the first complete genome of an organism with a nucleus.', 'En 1996 un equipo internacional de cientos de científicos publicó la secuencia del genoma de la levadura del pan, el primer genoma completo de un organismo con núcleo.'),
              B('Software looks for overlaps between reads and chains them into longer stretches. Repeats are hard because a read inside a repeat could belong to more than one place.', 'Un programa busca solapes entre lecturas y las encadena en tramos más largos. Los repetidos son difíciles porque una lectura dentro de un repetido podría pertenecer a más de un sitio.'),
              [B('The fragments here have 8 to 14 letters; real reads have hundreds.', 'Los fragmentos de aquí tienen de 8 a 14 letras; las lecturas reales tienen cientos.'),
               B('The sequence is invented; only the way of rebuilding it is real.', 'La secuencia es inventada; solo es real la forma de reconstruirla.')],
              [ref(['Goffeau, A.', 'Barrell, B. G.', 'Bussey, H.', 'et al.'], 1996, 'Life with 6000 genes', 'Science', '10.1126/science.274.5287.546')]))

# ═════════════════════════ CRISPR ═════════════════════════

crispr_mushroom = crispr_spec('crispr-6', B('A mushroom that stays white', 'Una seta que sigue blanca'), B('Turning down the browning enzyme', 'Bajar la enzima del pardeamiento'), 'advanced', 9, 'plant',
    B('Choose the guide that cuts inside a gene for the browning enzyme of a mushroom, and only there.', 'Elige la guía que corta dentro de un gen de la enzima del pardeamiento de una seta, y solo ahí.'),
    B('White button mushrooms turn brown when they are bruised or stored, because of an enzyme. Cutting the gene of the enzyme in a few letters can lower the browning.', 'Los champiñones se ponen marrones cuando se golpean o se guardan, por culpa de una enzima. Cortar el gen de la enzima y cambiarle unas pocas letras puede bajar el pardeamiento.'),
    org('mushroom-ppo', 'Button mushroom', 'Champiñón', 'Agaricus bisporus', B('The most eaten mushroom in the world.', 'La seta más consumida del mundo.'), ['Fungi', 'Basidiomycota', 'Agaricomycetes', 'Agaricales', 'Agaricaceae', 'Agaricus'], tissue='cap', organelle='nucleus'),
    [ex('plant', B('The problem', 'El problema'), B('Brown caps in the shop', 'Sombreros marrones en la tienda'), B('Browning does not make a mushroom unsafe, but shoppers choose white ones, so a lot of food is thrown away.', 'El pardeamiento no hace a una seta insegura, pero quien compra elige las blancas, así que se tira mucha comida.')),
     ex('dna', B('The edit', 'La edición'), B('A small change in a gene', 'Un cambio pequeño en un gen'), B('The mushroom has several genes for polyphenol oxidase. Editing one of them with Cas9, and changing a few letters, lowers the activity of the enzyme.', 'La seta tiene varios genes de polifenol oxidasa. Editar uno de ellos con Cas9, cambiando unas pocas letras, baja la actividad de la enzima.')),
     ex('cell', B('A rule', 'Una norma'), B('Edits with no foreign genes', 'Ediciones sin genes ajenos'), B('The edit adds no DNA from another species, which is why some regulators have treated this kind of change as similar to one that could appear by chance.', 'La edición no añade ADN de otra especie, por eso algunos reguladores han tratado este tipo de cambio como parecido a uno que podría aparecer por azar.'))],
    B('the gene of polyphenol oxidase', 'el gen de la polifenol oxidasa'), 31, 108, 28, 70, 1,
    [('a', 'nopam'), ('b', 'offtarget'), ('c', 'nomatch'), ('d', 'perfect'), ('e', 'elsewhere')],
    B('A stretch of DNA of a button mushroom with the gene for the browning enzyme. Edit the gene, and nothing else.', 'Un trozo de ADN de un champiñón con el gen de la enzima del pardeamiento. Edita el gen, y nada más.'),
    [B('Tap each guide and count where it sticks. Only one cuts exactly once, inside the blue area.', 'Toca cada guía y cuenta dónde se pega. Solo una corta exactamente una vez, dentro de la zona azul.'),
     B('Look for the PAM, a letter and then GG, right after the place where the guide sticks. Watch out for look-alike sites in other places.', 'Busca el PAM, una letra y luego GG, justo después del sitio donde se pega la guía. Cuidado con los sitios parecidos de otros lugares.'),
     B('Choose guide D.', 'Elige la guía D.')],
    **closing(B('A mushroom with less brown', 'Una seta con menos marrón'),
              B('You chose a guide that cuts only inside the gene of the browning enzyme.', 'Has elegido una guía que corta solo dentro del gen de la enzima del pardeamiento.'),
              B('Less browning means fewer mushrooms thrown away, because the ones that look good last longer on the shelf.', 'Menos pardeamiento significa menos setas tiradas, porque las que tienen buen aspecto duran más en el estante.'),
              B('In 2016 the United States Department of Agriculture said that a button mushroom edited with CRISPR to reduce browning did not need the review that applies to many genetically modified organisms.', 'En 2016 el Departamento de Agricultura de Estados Unidos dijo que un champiñón editado con CRISPR para reducir el pardeamiento no necesitaba la revisión que se aplica a muchos organismos modificados genéticamente.'),
              B('Cas9 cuts where the guide sticks if a PAM follows. The cell repairs the cut in a way that often adds or removes letters, and that can switch a gene off or turn it down.', 'Cas9 corta donde se pega la guía si le sigue un PAM. La célula repara el corte de una forma que a menudo añade o quita letras, y eso puede apagar o bajar un gen.'),
              [B('Guides here have 8 letters so they fit on the screen; real ones have about 20.', 'Las guías de aquí tienen 8 letras para que quepan en pantalla; las reales tienen unas 20.'),
               B('The sequence is invented; the real mushroom has several copies of the gene.', 'La secuencia es inventada; la seta real tiene varias copias del gen.')],
              [ref(['Waltz, E.'], 2016, 'Gene-edited CRISPR mushroom escapes US regulation', 'Nature', '10.1038/nature.2016.19754', 'news')]))

crispr_corn = crispr_spec('crispr-7', B('Corn for a better starch', 'Maíz para un almidón mejor'), B('Switching off one gene of the starch', 'Apagar un gen del almidón'), 'intermediate', 7, 'grain',
    B('Choose the guide that cuts inside the waxy gene of corn, and only there.', 'Elige la guía que corta dentro del gen waxy del maíz, y solo ahí.'),
    B('Starch is made of two kinds of chains. One gene is needed for the straight ones. Switching that gene off gives a corn whose starch is all branched, which is better for thickening foods.', 'El almidón está hecho de dos tipos de cadenas. Hace falta un gen para las rectas. Apagar ese gen da un maíz cuyo almidón es todo ramificado, mejor para espesar alimentos.'),
    org('corn-waxy', 'Corn', 'Maíz', 'Zea mays', B('A cereal whose starch is used in food and industry.', 'Un cereal cuyo almidón se usa en alimentación y en la industria.'), PLANT + ['Liliopsida', 'Poales', 'Poaceae', 'Zea'], tissue='kernel', organelle='nucleus'),
    [ex('grain', B('The starch', 'El almidón'), B('Straight and branched chains', 'Cadenas rectas y ramificadas'), B('Ordinary corn starch is a mix of straight chains and branched ones. Waxy corn has only branched ones, so its starch makes smoother pastes and gels.', 'El almidón del maíz normal es una mezcla de cadenas rectas y ramificadas. El maíz ceroso solo tiene ramificadas, así que su almidón hace pastas y geles más suaves.')),
     ex('dna', B('The edit', 'La edición'), B('Cut the waxy gene', 'Cortar el gen waxy'), B('The waxy gene makes the enzyme that builds the straight chains. A cut in the middle of it breaks the enzyme.', 'El gen waxy fabrica la enzima que construye las cadenas rectas. Un corte en medio la rompe.'))],
    B('the waxy gene', 'el gen waxy'), 7, 96, 20, 60, 0,
    [('a', 'elsewhere'), ('b', 'perfect'), ('c', 'nomatch'), ('d', 'nopam')],
    B('A stretch of DNA of corn with the waxy gene. Edit the gene, and nothing else.', 'Un trozo de ADN de maíz con el gen waxy. Edita el gen, y nada más.'),
    [B('Tap each guide and see where it sticks. Only one sticks inside the blue area with a PAM next to it.', 'Toca cada guía y mira dónde se pega. Solo una se pega dentro de la zona azul con un PAM al lado.'),
     B('One guide sticks inside the gene but has no PAM next to it, and another sticks elsewhere. One finds nothing.', 'Una guía se pega dentro del gen pero no tiene un PAM al lado, y otra se pega en otro sitio. Una no encuentra nada.'),
     B('Choose guide B.', 'Elige la guía B.')],
    **closing(B('A switch-off for a starch', 'Un apagado para un almidón'),
              B('You chose the guide that switches off the waxy gene without touching other places.', 'Has elegido la guía que apaga el gen waxy sin tocar otros lugares.'),
              B('Waxy corn starch is used to thicken sauces and puddings and to make glues and paper. Editing the gene directly saves years of crossing plants.', 'El almidón del maíz ceroso se usa para espesar salsas y postres, y para hacer pegamentos y papel. Editar el gen directamente ahorra años de cruzar plantas.'),
              B('In 2020 a team edited the waxy gene in corn with CRISPR–Cas9 and tested the plants in field trials, where they performed as well as the best conventional hybrids.', 'En 2020 un equipo editó el gen waxy del maíz con CRISPR–Cas9 y probó las plantas en ensayos de campo, donde rindieron igual que los mejores híbridos convencionales.'),
              B('A cut in the middle of the gene, repaired by the cell with the loss or gain of some letters, breaks the reading frame and makes the enzyme useless.', 'Un corte en medio del gen, que la célula repara perdiendo o ganando algunas letras, rompe la pauta de lectura y deja inútil a la enzima.'),
              [B('Guides here have 8 letters so they fit on the screen; real ones have about 20.', 'Las guías de aquí tienen 8 letras para que quepan en pantalla; las reales tienen unas 20.'),
               B('The sequence is invented; only the idea is real.', 'La secuencia es inventada; solo la idea es real.')],
              [ref(['Gao, H.', 'Gadlage, M. J.', 'Lafitte, H. R.', 'et al.'], 2020, 'Superior field performance of waxy corn engineered using CRISPR–Cas9', 'Nature Biotechnology', '10.1038/s41587-020-0444-0')]))

write_levels([cut_chymosin, cut_heme, asm_mammoth, asm_yeast, crispr_mushroom, crispr_corn])
