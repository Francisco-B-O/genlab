import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from specs5 import *

# Frameshift levels: the patient's strand has one letter more (insertion) or one letter less (deletion).

OBJECTIVE_INS = B('Find the extra letter in the changed gene and say what it does to the protein.', 'Encuentra la letra que sobra en el gen cambiado y di qué le hace a la proteína.')
OBJECTIVE_DEL = B('Find the letter that is missing in the changed gene and say what it does to the protein.', 'Encuentra la letra que falta en el gen cambiado y di qué le hace a la proteína.')
DESCRIPTION = B('A letter added or lost does not change one amino acid: it moves the place where the letters are cut into groups of three, so everything after it is read differently. Compare the two sequences from the start.',
                'Una letra añadida o perdida no cambia un solo aminoácido: mueve el sitio donde las letras se cortan en grupos de tres, así que todo lo que viene después se lee de otra manera. Compara las dos secuencias desde el principio.')
SIMPLIFY = B('The real change is the one described, but the sequence is an invented short example, and the real change can be of more than one letter.', 'El cambio real es el que se describe, pero la secuencia es un ejemplo corto inventado, y el cambio real puede ser de más de una letra.')
NOT = lambda en, es: B(en, es)

mut_crispr_edit = mut_spec('mut-crispr-edit', B('What a CRISPR cut leaves behind', 'Lo que deja un corte de CRISPR'), B('One extra letter, and the gene is off', 'Una letra de más y el gen se apaga'), 'intermediate', 6, 'dna',
    B('Gene of a plant after a CRISPR cut (illustrative)', 'Gen de una planta tras un corte de CRISPR (ilustrativo)'), 'ATGAAGCAGGACTGGGAATTC', 'ATGAAGCAGTGACTGGGAATTC',
    B('A real way of switching a gene off, with an invented sequence. After Cas9 cuts the DNA, the cell glues the ends back together and often adds or loses a single letter. That shifts the reading of everything that follows. Look at the edited plant.', 'Una forma real de apagar un gen, con una secuencia inventada. Después de que Cas9 corte el ADN, la célula vuelve a pegar los extremos y a menudo añade o pierde una sola letra. Eso desplaza la lectura de todo lo que viene después. Mira la planta editada.'),
    {'silent': B('Not here: the reading itself moves.', 'Aquí no: la propia lectura se desplaza.'),
     'missense': B('Not here: more than one amino acid is affected.', 'Aquí no: se ve afectado más de un aminoácido.'),
     'nonsense': B('Not quite: the stop comes because the reading moved, and what moved is the whole message.', 'No exactamente: la parada llega porque la lectura se movió, y lo que se movió es todo el mensaje.'),
     'frameshift': B('An extra T after the third codon moved the reading frame. GAC became TGA, a stop, and the rest of the message is read in the wrong groups. That is how a single-letter repair after a CRISPR cut can switch a gene off.', 'Una T de más después del tercer codón movió la pauta de lectura. GAC pasó a TGA, una parada, y el resto del mensaje se lee en grupos equivocados. Así es como una reparación de una sola letra tras un corte de CRISPR puede apagar un gen.')},
    [ex('dna', B('The cut', 'El corte'), B('Cas9 cuts, the cell repairs', 'Cas9 corta, la célula repara'), B('The cell repairs the cut quickly and not always perfectly. Most often it adds or removes a few letters at the cut.', 'La célula repara el corte deprisa y no siempre de forma perfecta. Lo más habitual es que añada o quite unas pocas letras en el corte.')),
     ex('plant', B('The effect', 'El efecto'), B('A gene that no longer works', 'Un gen que ya no funciona'), B('If the number of letters added or lost is not a multiple of three, the reading shifts and the protein is lost. This is how researchers switch genes off.', 'Si el número de letras añadidas o perdidas no es múltiplo de tres, la lectura se desplaza y se pierde la proteína. Así es como los investigadores apagan genes.'))],
    [B('Read both rows from the start and stop where they stop agreeing.', 'Lee las dos filas desde el principio y detente donde dejan de coincidir.'),
     B('The changed gene is one letter longer than the original. The extra letter is in the fourth group of the changed gene.', 'El gen cambiado es una letra más largo que el original. La letra de más está en el cuarto grupo del gen cambiado.'),
     B('Tap the T of the fourth group. The effect is a frameshift.', 'Toca la T del cuarto grupo. El efecto es un cambio de pauta de lectura.')],
    org('crispr-indel', 'A gene edited with CRISPR', 'Un gen editado con CRISPR', 'Genome editing', B('A stretch of a plant gene after a Cas9 cut and its repair.', 'Un trozo de un gen de planta después de un corte de Cas9 y de su reparación.'), ['Method'], tissue='nucleus', organelle='nucleus'),
    **closing(B('A shifted message', 'Un mensaje desplazado'),
              B('You found an extra letter and saw how it shifts the groups of three after it, until a stop codon cuts the protein short.', 'Has encontrado una letra de más y has visto cómo desplaza los grupos de tres que vienen detrás, hasta que un codón de fin corta la proteína.'),
              B('Switching genes off this way is the basis of many gene-edited crops and animals, and also of the research that learns what each gene does.', 'Apagar genes de esta manera es la base de muchos cultivos y animales editados, y también de la investigación que averigua qué hace cada gen.'),
              B('In 2018 a study of thousands of CRISPR cuts in human cells showed that the repair is not random: for each place that is cut, a particular kind of repair, very often a one-letter insertion, is the most frequent.', 'En 2018 un estudio de miles de cortes de CRISPR en células humanas mostró que la reparación no es aleatoria: para cada sitio cortado, un tipo concreto de reparación, muy a menudo una inserción de una letra, es el más frecuente.'),
              B('A frameshift changes every codon after the change. Most often the new reading soon meets a stop codon, so the protein is short and useless.', 'Un cambio de pauta modifica todos los codones que vienen después. Lo más habitual es que la nueva lectura se encuentre pronto con un codón de fin, así que la proteína es corta e inútil.'),
              [SIMPLIFY],
              [ref(['Shen, M. W.', 'Arbab, M.', 'Hsu, J. Y.', 'et al.'], 2018, 'Predictable and precise template-free CRISPR editing of pathogenic variants', 'Nature', '10.1038/s41586-018-0686-x')]))
mut_crispr_edit['objective'] = OBJECTIVE_INS
mut_crispr_edit['description'] = DESCRIPTION

mut_belgian = mut_spec('mut-belgian', B('The lost letter of the Belgian Blue', 'La letra perdida de la vaca azul belga'), B('A deletion that doubles the muscle', 'Una deleción que duplica el músculo'), 'advanced', 7, 'cell',
    B('Myostatin gene of cattle (illustrative)', 'Gen de la miostatina del ganado (ilustrativo)'), 'ATGGCTAAGCTGGAGCAGTAC', 'ATGGCTAGCTGGAGCAGTAC',
    B('A real kind of change, with an invented sequence. Belgian Blue cattle lack a few letters in the gene of myostatin, the brake of muscle growth. The real deletion has 11 letters; here a single missing letter does the same job. Find it in the original gene.', 'Un tipo real de cambio, con una secuencia inventada. Al ganado azul belga le faltan unas letras en el gen de la miostatina, el freno del crecimiento muscular. La deleción real tiene 11 letras; aquí una sola letra que falta hace el mismo trabajo. Búscala en el gen original.'),
    {'silent': B('Not here: the reading itself moves.', 'Aquí no: la propia lectura se desplaza.'),
     'missense': B('Not here: more than one amino acid is affected.', 'Aquí no: se ve afectado más de un aminoácido.'),
     'nonsense': B('Not here: the message does not simply stop.', 'Aquí no: el mensaje no se limita a parar.'),
     'frameshift': B('Losing an A moved the reading frame. AAG became AGC and every amino acid after it changed. The real protein ends up short and useless, so the brake of the muscles is gone.', 'Perder una A movió la pauta de lectura. AAG pasó a AGC y todos los aminoácidos que le siguen cambiaron. La proteína real queda corta e inútil, así que el freno de los músculos desaparece.')},
    [ex('cell', B('The brake', 'El freno'), B('Myostatin', 'La miostatina'), B('Myostatin tells muscles to stop growing. In Belgian Blue cattle the protein is not made properly, and the muscles grow far more.', 'La miostatina dice a los músculos que dejen de crecer. En el ganado azul belga la proteína no se fabrica bien, y los músculos crecen mucho más.')),
     ex('dna', B('A deletion', 'Una deleción'), B('Eleven letters, not a multiple of three', 'Once letras, que no es múltiplo de tres'), B('A deletion of a multiple of three removes whole amino acids; one that is not a multiple of three shifts the reading. Eleven is not, so the gene is broken.', 'Una deleción de un múltiplo de tres quita aminoácidos enteros; una que no es múltiplo de tres desplaza la lectura. Once no lo es, así que el gen se rompe.'))],
    [B('Read both rows from the start. The changed gene is one letter shorter than the original.', 'Lee las dos filas desde el principio. El gen cambiado es una letra más corto que el original.'),
     B('The rows agree until the third group of the original gene, where two A letters follow each other. Either of them can be the missing one.', 'Las filas coinciden hasta el tercer grupo del gen original, donde dos letras A van seguidas. Cualquiera de ellas puede ser la que falta.'),
     B('Tap one of the two A letters of the third group of the original gene. The effect is a frameshift.', 'Toca una de las dos letras A del tercer grupo del gen original. El efecto es un cambio de pauta de lectura.')],
    org('cattle-mstn-del', 'Myostatin', 'Miostatina', 'Bos taurus', B('A protein that limits the growth of muscles.', 'Una proteína que limita el crecimiento de los músculos.'), MAMMAL + ['Artiodactyla', 'Bovidae', 'Bos'], tissue='muscle'),
    **closing(B('A letter less, a protein less', 'Una letra menos, una proteína menos'),
              B('You found a missing letter and saw that a deletion that is not a multiple of three scrambles everything that follows.', 'Has encontrado una letra que falta y has visto que una deleción que no es múltiplo de tres revuelve todo lo que viene después.'),
              B('Double-muscled cattle give lean meat, but calving is harder, so breeders weigh the benefit and the cost of the allele.', 'El ganado de doble músculo da carne magra, pero los partos son más difíciles, así que quien cría sopesa el beneficio y el coste del alelo.'),
              B('In 1997 a team showed that the Belgian Blue breed carries an 11-letter deletion in the myostatin gene, which causes the double-muscled look.', 'En 1997 un equipo mostró que la raza azul belga lleva una deleción de 11 letras en el gen de la miostatina, que causa el aspecto de doble músculo.'),
              B('The deletion removes 11 letters of the coding sequence, so the reading frame shifts and a premature stop codon soon appears. The cell then makes a short protein that cannot work.', 'La deleción quita 11 letras de la secuencia codificante, así que la pauta de lectura se desplaza y pronto aparece un codón de fin prematuro. La célula fabrica entonces una proteína corta que no puede funcionar.'),
              [SIMPLIFY],
              [ref(['Grobet, L.', 'Royo Martin, L. J.', 'Poncelet, D.', 'et al.'], 1997, 'A deletion in the bovine myostatin gene causes the double-muscled phenotype in cattle', 'Nature Genetics', '10.1038/ng0997-71')]))
mut_belgian['objective'] = OBJECTIVE_DEL
mut_belgian['description'] = DESCRIPTION

write_levels([mut_crispr_edit, mut_belgian])
