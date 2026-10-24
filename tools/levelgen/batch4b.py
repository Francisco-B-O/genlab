import os, sys, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from levelgen import *

def org(id_, en, es, sci, desc, taxonomy=None, tissue='whole organism', organelle='cytoplasm'):
    return dict(id=id_, name=B(en, es), sci=sci, desc=desc, taxonomy=taxonomy or ['Eukaryota'], tissue=tissue, organelle=organelle)

def ref(authors, year, title, journal, doi=None, kind='paper'):
    r = {'authors': authors, 'year': year, 'title': title, 'journal': journal, 'type': kind}
    if doi:
        r['doi'] = doi
    return r

ECOLI = ['Bacteria', 'Pseudomonadota', 'Gammaproteobacteria', 'Enterobacterales', 'Enterobacteriaceae', 'Escherichia']
N = lambda i, t, label, desc, c, r: (i, t, label, desc, c, r)
R = lambda i, s, t, e, d: (i, s, t, e, d)

def path_spec(id_, title, subtitle, diff, minutes, kind, objective, description, organism, explore, pathway, product, steps, hints, done_title, summary, impact, case, context, simplify, refs):
    return dict(id=id_, mode='pathway', kind=kind, title=title, subtitle=subtitle, difficulty=diff, minutes=minutes, objective=objective, description=description,
                organism=organism, exploration=explore, pathway=pathway, product=product, steps=steps, hints=hints,
                done_title=done_title, summary=summary, impact=impact, case=case, context=context, simplify=simplify, refs=refs)

# ═════════════════════════ PATHWAYS ═════════════════════════

nitrogen = path_spec('nitrogen-fixation', B('Living fertiliser: nitrogen fixation', 'Abono vivo: la fijación de nitrógeno'), B('Making ammonia from air', 'Fabricar amoníaco a partir del aire'), 'intermediate', 7, 'plant',
    B('Show how a bacterium in a root nodule turns nitrogen gas from the air into ammonia that the plant can use.', 'Muestra cómo una bacteria de un nódulo de la raíz convierte el nitrógeno gaseoso del aire en amoníaco que la planta puede usar.'),
    B('Air is almost four fifths nitrogen, but plants cannot use it as gas. Some bacteria can break its strong bond with an enzyme called nitrogenase.', 'El aire es casi cuatro quintas partes nitrógeno, pero las plantas no pueden usarlo en forma de gas. Algunas bacterias pueden romper su fuerte enlace con una enzima llamada nitrogenasa.'),
    org('rhizobium-fix', 'Rhizobium in a nodule', 'Rhizobium en un nódulo', 'Rhizobium leguminosarum', B('A bacterium that fixes nitrogen inside legume roots.', 'Una bacteria que fija nitrógeno dentro de las raíces de las leguminosas.'), ['Bacteria', 'Pseudomonadota', 'Alphaproteobacteria', 'Hyphomicrobiales', 'Rhizobiaceae', 'Rhizobium'], tissue='root nodule'),
    [('plant', B('The need', 'La necesidad'), B('Plants need nitrogen', 'Las plantas necesitan nitrógeno'), B('Nitrogen is part of proteins and DNA. Farmers add fertiliser because soils run short of the forms of nitrogen that plants can take up.', 'El nitrógeno forma parte de las proteínas y del ADN. Los agricultores añaden abono porque los suelos se quedan cortos de las formas de nitrógeno que las plantas pueden absorber.')),
     ('bacterium', B('The enzyme', 'La enzima'), B('Nitrogenase', 'La nitrogenasa'), B('Nitrogenase breaks the triple bond of N₂ and adds hydrogen to make ammonia. It needs a lot of energy and is destroyed by oxygen.', 'La nitrogenasa rompe el triple enlace del N₂ y le añade hidrógeno para fabricar amoníaco. Necesita mucha energía y la destruye el oxígeno.')),
     ('cell', B('The nodule', 'El nódulo'), B('A home without oxygen', 'Un hogar sin oxígeno'), B('The plant protects the bacteria with a red protein, leghaemoglobin, that binds oxygen and keeps it away from nitrogenase.', 'La planta protege a las bacterias con una proteína roja, la leghemoglobina, que se une al oxígeno y lo mantiene lejos de la nitrogenasa.'))],
    dict(nodes=[
        N('gene_nif', 'gene', B('nif genes', 'Genes nif'), B('The recipe of nitrogenase, from the bacterium.', 'La receta de la nitrogenasa, de la bacteria.'), 0, 0),
        N('protein_nitrogenase', 'protein', B('Nitrogenase', 'Nitrogenasa'), B('The enzyme that fixes nitrogen.', 'La enzima que fija el nitrógeno.'), 1, 0),
        N('rxn_fix', 'reaction', B('Fixing nitrogen', 'Fijar nitrógeno'), B('N₂ becomes ammonia, NH₃.', 'El N₂ se convierte en amoníaco, NH₃.'), 2, 0),
        N('met_n2', 'metabolite', B('Nitrogen gas', 'Nitrógeno gaseoso'), B('N₂, the gas of the air.', 'N₂, el gas del aire.'), 3, 1),
        N('met_atp', 'metabolite', B('ATP (energy)', 'ATP (energía)'), B('Fixing nitrogen costs a lot of energy.', 'Fijar nitrógeno cuesta mucha energía.'), 3, 2),
        N('met_ammonia', 'metabolite', B('Ammonia', 'Amoníaco'), B('A form of nitrogen that the plant can use.', 'Una forma de nitrógeno que la planta puede usar.'), 3, 0),
        N('phenotype_growth', 'phenotype', B('A growing plant', 'Una planta que crece'), B('With nitrogen, the plant makes proteins and grows.', 'Con nitrógeno, la planta fabrica proteínas y crece.'), 4, 0),
        N('protein_leghb', 'protein', B('Leghaemoglobin', 'Leghemoglobina'), B('A red protein of the nodule that holds oxygen.', 'Una proteína roja del nódulo que retiene oxígeno.'), 1, 2),
        N('met_o2', 'metabolite', B('Oxygen', 'Oxígeno'), B('Needed by cells to breathe, but it destroys nitrogenase.', 'Las células lo necesitan para respirar, pero destruye la nitrogenasa.'), 2, 2)],
        required=[
            R('req_encodes', 'gene_nif', 'protein_nitrogenase', 'encodes', B('The bacterium reads the nif genes and builds nitrogenase.', 'La bacteria lee los genes nif y construye la nitrogenasa.')),
            R('req_catalyzes', 'protein_nitrogenase', 'rxn_fix', 'catalyzes', B('Nitrogenase runs the fixing of nitrogen.', 'La nitrogenasa hace funcionar la fijación del nitrógeno.')),
            R('req_n2', 'rxn_fix', 'met_n2', 'consumes', B('The reaction uses nitrogen gas.', 'La reacción gasta nitrógeno gaseoso.')),
            R('req_atp', 'rxn_fix', 'met_atp', 'consumes', B('It also uses a lot of ATP: the plant pays with sugar.', 'También gasta mucho ATP: la planta lo paga con azúcar.')),
            R('req_nh3', 'rxn_fix', 'met_ammonia', 'produces', B('The result is ammonia.', 'El resultado es amoníaco.')),
            R('req_growth', 'met_ammonia', 'phenotype_growth', 'influences', B('The plant builds its proteins with that nitrogen and grows.', 'La planta construye sus proteínas con ese nitrógeno y crece.'))],
        optional=[('opt_leghb', 'protein_leghb', 'protein_nitrogenase', 'regulates', B('Leghaemoglobin keeps oxygen away and protects nitrogenase.', 'La leghemoglobina mantiene lejos el oxígeno y protege a la nitrogenasa.'), 50)],
        invalid=[('met_o2', 'protein_nitrogenase', B('Oxygen does not help nitrogenase: it destroys it. That is why the nodule keeps it out.', 'El oxígeno no ayuda a la nitrogenasa: la destruye. Por eso el nódulo lo mantiene fuera.')),
                 ('met_n2', 'phenotype_growth', B('Plants cannot use nitrogen gas. It has to be turned into ammonia first.', 'Las plantas no pueden usar el nitrógeno gaseoso. Primero tiene que convertirse en amoníaco.'))],
        distractors=['met_o2'], target='phenotype_growth',
        win=B('Turn nitrogen gas into ammonia so that the plant can grow.', 'Convierte el nitrógeno gaseoso en amoníaco para que la planta pueda crecer.')),
    B('Nitrogen', 'Nitrógeno'),
    [(B('Gene read', 'Gen leído'), B('Nitrogenase is built.', 'Se construye la nitrogenasa.')), (B('Energy and gas', 'Energía y gas'), B('ATP and N₂ arrive.', 'Llegan ATP y N₂.')), (B('Ammonia', 'Amoníaco'), B('The nitrogen is fixed.', 'El nitrógeno queda fijado.')), (B('Growth', 'Crecimiento'), B('The plant uses it.', 'La planta lo usa.'))],
    [B('Nitrogenase needs two things to run: the gas and plenty of energy. Its product is what the plant uses.', 'La nitrogenasa necesita dos cosas para funcionar: el gas y mucha energía. Su producto es lo que usa la planta.'),
     B('Gene → nitrogenase → fixing nitrogen. The reaction uses N₂ and ATP and makes ammonia; ammonia feeds the plant.', 'Gen → nitrogenasa → fijar nitrógeno. La reacción gasta N₂ y ATP y fabrica amoníaco; el amoníaco alimenta a la planta.'),
     B('Connect: nif genes–nitrogenase, nitrogenase–reaction, reaction–N₂, reaction–ATP, reaction–ammonia and ammonia–plant.', 'Conecta: genes nif–nitrogenasa, nitrogenasa–reacción, reacción–N₂, reacción–ATP, reacción–amoníaco y amoníaco–planta.')],
    B('Fertiliser made on the spot', 'Abono fabricado en el sitio'),
    B('You followed the reaction that feeds the plants of the world: the bacterial fixing of nitrogen.', 'Has seguido la reacción que alimenta a las plantas del mundo: la fijación bacteriana del nitrógeno.'),
    B('Legumes in crop rotation add nitrogen to soils without industrial fertiliser, which saves energy and avoids pollution of water.', 'Las leguminosas en la rotación de cultivos añaden nitrógeno a los suelos sin abono industrial, lo que ahorra energía y evita la contaminación del agua.'),
    B('Industrial fertiliser needs a process that uses a great amount of energy and high temperatures. Nitrogenase does the same at normal temperatures, which makes it a model for greener chemistry.', 'El abono industrial necesita un proceso que usa muchísima energía y altas temperaturas. La nitrogenasa hace lo mismo a temperatura normal, lo que la convierte en un modelo para una química más verde.'),
    B('Nitrogenase uses 16 ATP per N₂ in a reaction that also releases hydrogen. Its active site contains iron and molybdenum, and oxygen irreversibly damages it.', 'La nitrogenasa gasta 16 ATP por cada N₂ en una reacción que también libera hidrógeno. Su sitio activo contiene hierro y molibdeno, y el oxígeno la daña de forma irreversible.'),
    [B('Nitrogenase is a complex of two proteins; here it is shown as one piece. The plant-side steps are left out.', 'La nitrogenasa es un complejo de dos proteínas; aquí se muestra como una sola pieza. Los pasos del lado de la planta se omiten.')],
    [ref(['Hoffman, B. M.', 'Lukoyanov, D.', 'Yang, Z.-Y.', 'Dean, D. R.', 'Seefeldt, L. C.'], 2014, 'Mechanism of nitrogen fixation by nitrogenase: the next stage', 'Chemical Reviews', '10.1021/cr400641x', 'review')])

beer_path = path_spec('beer', B('From barley to beer', 'De la cebada a la cerveza'), B('Two chains of enzymes in a row', 'Dos cadenas de enzimas seguidas'), 'intermediate', 8, 'wheat',
    B('Show how barley enzymes turn starch into sugar and how yeast turns that sugar into alcohol and bubbles.', 'Muestra cómo las enzimas de la cebada convierten el almidón en azúcar y cómo la levadura convierte ese azúcar en alcohol y burbujas.'),
    B('Beer needs two chains of enzymes, from two different organisms: the barley that makes sugar, and the yeast that ferments it.', 'La cerveza necesita dos cadenas de enzimas, de dos organismos distintos: la cebada que fabrica el azúcar y la levadura que lo fermenta.'),
    org('beer-pathway', 'Barley and yeast', 'Cebada y levadura', 'Saccharomyces cerevisiae', B('A cereal and a fungus working one after the other.', 'Un cereal y un hongo que trabajan uno detrás del otro.'), ['Fungi', 'Ascomycota', 'Saccharomycetes', 'Saccharomycetales', 'Saccharomycetaceae', 'Saccharomyces']),
    [('wheat', B('The grain', 'El grano'), B('Starch to sugar', 'De almidón a azúcar'), B('Barley stores starch. Its amylase enzymes cut it into maltose, a sugar made of two glucoses.', 'La cebada guarda almidón. Sus enzimas, las amilasas, lo cortan en maltosa, un azúcar formado por dos glucosas.')),
     ('yeast', B('The yeast', 'La levadura'), B('Sugar to alcohol', 'De azúcar a alcohol'), B('Yeast cannot eat starch, but it can ferment maltose into alcohol and carbon dioxide.', 'La levadura no puede comer almidón, pero sí fermentar la maltosa en alcohol y dióxido de carbono.')),
     ('bottle', B('The result', 'El resultado'), B('Alcohol and bubbles', 'Alcohol y burbujas'), B('The alcohol gives beer its strength and the gas gives it its fizz.', 'El alcohol da a la cerveza su fuerza y el gas le da sus burbujas.'))],
    dict(nodes=[
        N('gene_amy', 'gene', B('Amylase gene', 'Gen de la amilasa'), B('The recipe of the barley enzyme that cuts starch.', 'La receta de la enzima de la cebada que corta el almidón.'), 0, 1),
        N('enzyme_amylase', 'enzyme', B('Amylase', 'Amilasa'), B('Cuts starch into sugars.', 'Corta el almidón en azúcares.'), 1, 1),
        N('rxn_mash', 'reaction', B('Mashing', 'Macerar'), B('Starch → maltose, in the hot mash.', 'Almidón → maltosa, en la maceración caliente.'), 2, 1),
        N('met_starch', 'metabolite', B('Starch', 'Almidón'), B('The reserve of the barley grain.', 'La reserva del grano de cebada.'), 2, 2),
        N('met_maltose', 'metabolite', B('Maltose', 'Maltosa'), B('The sugar of the wort.', 'El azúcar del mosto.'), 3, 1),
        N('gene_adh', 'gene', B('Yeast gene', 'Gen de levadura'), B('The recipe of the yeast enzymes of fermentation.', 'La receta de las enzimas de fermentación de la levadura.'), 0, -1),
        N('enzyme_adh', 'enzyme', B('Yeast enzyme', 'Enzima de levadura'), B('Runs the fermentation of sugar.', 'Hace funcionar la fermentación del azúcar.'), 1, -1),
        N('rxn_ferment', 'reaction', B('Fermenting', 'Fermentar'), B('Sugar → alcohol + carbon dioxide.', 'Azúcar → alcohol + dióxido de carbono.'), 4, 0),
        N('met_ethanol', 'metabolite', B('Alcohol', 'Alcohol'), B('Ethanol, the alcohol of beer.', 'Etanol, el alcohol de la cerveza.'), 5, 0),
        N('met_co2', 'metabolite', B('Carbon dioxide', 'Dióxido de carbono'), B('The gas that makes the bubbles.', 'El gas que forma las burbujas.'), 5, 1),
        N('phenotype_beer', 'phenotype', B('Beer', 'Cerveza'), B('A drink with alcohol and fizz.', 'Una bebida con alcohol y burbujas.'), 6, 0),
        N('met_oxygen', 'metabolite', B('Oxygen', 'Oxígeno'), B('Air. Fermentation happens without it.', 'Aire. La fermentación ocurre sin él.'), 3, -1)],
        required=[
            R('req_amy_enc', 'gene_amy', 'enzyme_amylase', 'encodes', B('The barley grain reads the gene and makes amylase.', 'El grano de cebada lee el gen y fabrica amilasa.')),
            R('req_amy_cat', 'enzyme_amylase', 'rxn_mash', 'catalyzes', B('Amylase runs the cutting of starch.', 'La amilasa hace funcionar el corte del almidón.')),
            R('req_starch', 'rxn_mash', 'met_starch', 'consumes', B('The reaction uses up starch.', 'La reacción gasta almidón.')),
            R('req_maltose', 'rxn_mash', 'met_maltose', 'produces', B('And makes maltose, a sugar yeast can eat.', 'Y fabrica maltosa, un azúcar que la levadura puede comer.')),
            R('req_adh_enc', 'gene_adh', 'enzyme_adh', 'encodes', B('The yeast reads its own gene and builds its enzyme.', 'La levadura lee su propio gen y construye su enzima.')),
            R('req_adh_cat', 'enzyme_adh', 'rxn_ferment', 'catalyzes', B('The yeast enzyme runs the fermentation.', 'La enzima de la levadura hace funcionar la fermentación.')),
            R('req_ferm_use', 'rxn_ferment', 'met_maltose', 'consumes', B('Fermentation uses up maltose.', 'La fermentación gasta maltosa.')),
            R('req_ferm_alc', 'rxn_ferment', 'met_ethanol', 'produces', B('And makes alcohol.', 'Y fabrica alcohol.')),
            R('req_beer', 'met_ethanol', 'phenotype_beer', 'influences', B('The alcohol is what turns wort into beer.', 'El alcohol es lo que convierte el mosto en cerveza.'))],
        optional=[('opt_co2', 'rxn_ferment', 'met_co2', 'produces', B('Carbon dioxide appears too, and gives the fizz.', 'También aparece dióxido de carbono, que da las burbujas.'), 50)],
        invalid=[('met_starch', 'rxn_ferment', B('Yeast cannot ferment starch directly. The enzymes of the grain must cut it into sugars first.', 'La levadura no puede fermentar el almidón directamente. Antes las enzimas del grano tienen que cortarlo en azúcares.')),
                 ('met_oxygen', 'rxn_ferment', B('Fermentation happens without air. Oxygen is only needed by the yeast at the very beginning, to build its membranes.', 'La fermentación ocurre sin aire. La levadura solo necesita oxígeno al principio, para construir sus membranas.'))],
        distractors=['met_oxygen'], target='phenotype_beer',
        win=B('Turn starch into sugar and then sugar into alcohol.', 'Convierte el almidón en azúcar y luego el azúcar en alcohol.')),
    B('Beer', 'Cerveza'),
    [(B('Mash', 'Maceración'), B('Starch becomes maltose.', 'El almidón se convierte en maltosa.')), (B('Yeast', 'Levadura'), B('It reads its genes.', 'Lee sus genes.')), (B('Fermentation', 'Fermentación'), B('Maltose becomes alcohol.', 'La maltosa se convierte en alcohol.')), (B('Beer', 'Cerveza'), B('Alcohol and fizz.', 'Alcohol y burbujas.'))],
    [B('There are two chains: one in the barley and one in the yeast. They meet at maltose.', 'Hay dos cadenas: una en la cebada y otra en la levadura. Se encuentran en la maltosa.'),
     B('Gene → enzyme → reaction, twice. The first reaction makes maltose; the second one uses it.', 'Gen → enzima → reacción, dos veces. La primera reacción fabrica maltosa; la segunda la gasta.'),
     B('Connect both gene–enzyme–reaction chains, then starch, maltose, alcohol and beer.', 'Conecta las dos cadenas gen–enzima–reacción y luego almidón, maltosa, alcohol y cerveza.')],
    B('Barley and yeast, in relay', 'Cebada y levadura, en relevo'),
    B('You connected two chains of enzymes of two organisms: one makes sugar and the other turns it into alcohol.', 'Has conectado dos cadenas de enzimas de dos organismos: una fabrica el azúcar y la otra lo convierte en alcohol.'),
    B('Brewers choose barley and yeast strains, and control temperature, to get the flavour they want.', 'Quienes elaboran cerveza eligen variedades de cebada y de levadura, y controlan la temperatura, para conseguir el sabor que quieren.'),
    B('The yeast of lager beer, used in most beers of the world, is a hybrid of two species. Its DNA shows that one parent is a wild yeast from Patagonia.', 'La levadura de la cerveza lager, usada en la mayoría de las cervezas del mundo, es un híbrido de dos especies. Su ADN muestra que uno de los padres es una levadura silvestre de la Patagonia.'),
    B('Malt amylases degrade starch to maltose and dextrins. Yeast transports maltose into the cell and ferments it through glycolysis to ethanol and CO₂.', 'Las amilasas de la malta degradan el almidón a maltosa y dextrinas. La levadura transporta la maltosa al interior de la célula y la fermenta por la glucólisis hasta etanol y CO₂.'),
    [B('Glycolysis has ten steps; here it is one reaction. The barley enzymes are several, shown as one.', 'La glucólisis tiene diez pasos; aquí es una sola reacción. Las enzimas de la cebada son varias, mostradas como una.')],
    [ref(['Libkind, D.', 'Hittinger, C. T.', 'Valério, E.', 'et al.'], 2011, 'Microbe domestication and the identification of the wild genetic stock of lager-brewing yeast', 'Proceedings of the National Academy of Sciences', '10.1073/pnas.1105430108')])

quorum = path_spec('quorum', B('Bacteria that talk: the squid and its light', 'Bacterias que hablan: el calamar y su luz'), B('Light only when there are many', 'Luz solo cuando son muchas'), 'advanced', 9, 'jellyfish',
    B('Show how marine bacteria switch on their light only when they are numerous, by sensing a signal they release.', 'Muestra cómo unas bacterias marinas encienden su luz solo cuando son numerosas, detectando una señal que ellas mismas liberan.'),
    B('One bacterium alone does not glow. Many together do: each one releases a signal, and when the signal builds up, they all switch on their light at once.', 'Una bacteria sola no brilla. Muchas juntas sí: cada una libera una señal y, cuando la señal se acumula, todas encienden su luz a la vez.'),
    org('vibrio-squid', 'Vibrio fischeri', 'Vibrio fischeri', 'Vibrio fischeri', B('A bacterium that lives in a squid and lights up.', 'Una bacteria que vive en un calamar y se ilumina.'), ['Bacteria', 'Pseudomonadota', 'Gammaproteobacteria', 'Vibrionales', 'Vibrionaceae', 'Vibrio'], tissue='light organ'),
    [('jellyfish', B('The squid', 'El calamar'), B('A lamp against predators', 'Una lámpara contra los depredadores'), B('The Hawaiian bobtail squid hosts these bacteria in a light organ. At night, its glow hides its shadow from predators below.', 'El calamar hawaiano de cola corta alberga estas bacterias en un órgano luminoso. De noche, su brillo oculta su sombra a los depredadores de abajo.')),
     ('bacterium', B('Counting', 'Contar'), B('Quorum sensing', 'Detección de quórum'), B('Each bacterium makes a small signal molecule. In a crowd, the signal accumulates and tells the cells that they are many.', 'Cada bacteria fabrica una pequeña molécula señal. En una multitud, la señal se acumula y avisa a las células de que son muchas.')),
     ('dna', B('The switch', 'El interruptor'), B('A protein that listens', 'Una proteína que escucha'), B('The protein LuxR binds the signal, and only then switches on the genes that make light.', 'La proteína LuxR se une a la señal y solo entonces enciende los genes que fabrican luz.'))],
    dict(nodes=[
        N('gene_luxi', 'gene', B('luxI gene', 'Gen luxI'), B('The recipe of the enzyme that makes the signal.', 'La receta de la enzima que fabrica la señal.'), 0, 1),
        N('enzyme_luxi', 'enzyme', B('LuxI enzyme', 'Enzima LuxI'), B('Makes the signal molecule.', 'Fabrica la molécula señal.'), 1, 1),
        N('rxn_ai', 'reaction', B('Making the signal', 'Fabricar la señal'), B('The enzyme builds the signal molecule.', 'La enzima construye la molécula señal.'), 2, 1),
        N('met_ai', 'metabolite', B('Signal molecule', 'Molécula señal'), B('It builds up when there are many bacteria.', 'Se acumula cuando hay muchas bacterias.'), 3, 1),
        N('protein_luxr', 'protein', B('LuxR protein', 'Proteína LuxR'), B('It binds the signal and switches on the light genes.', 'Se une a la señal y enciende los genes de la luz.'), 3, 0),
        N('gene_lux', 'gene', B('Light genes', 'Genes de la luz'), B('The recipe of the enzyme that makes light.', 'La receta de la enzima que fabrica luz.'), 4, 0),
        N('enzyme_luc', 'enzyme', B('Luciferase', 'Luciferasa'), B('The enzyme that makes light.', 'La enzima que fabrica luz.'), 5, 0),
        N('rxn_light', 'reaction', B('Light reaction', 'Reacción de la luz'), B('The enzyme burns a small molecule and releases light.', 'La enzima quema una molécula pequeña y libera luz.'), 5, -1),
        N('phenotype_glow', 'phenotype', B('Blue-green light', 'Luz azul verdosa'), B('The colony of bacteria glows.', 'La colonia de bacterias brilla.'), 6, -1),
        N('gene_gfp', 'gene', B('gfp gene', 'Gen gfp'), B('A protein that glows only under blue light. Not part of this system.', 'Una proteína que solo brilla con luz azul. No forma parte de este sistema.'), 0, -1)],
        required=[
            R('req_luxi_enc', 'gene_luxi', 'enzyme_luxi', 'encodes', B('Each bacterium reads the luxI gene and builds the enzyme.', 'Cada bacteria lee el gen luxI y construye la enzima.')),
            R('req_luxi_cat', 'enzyme_luxi', 'rxn_ai', 'catalyzes', B('The enzyme runs the making of the signal.', 'La enzima hace funcionar la fabricación de la señal.')),
            R('req_signal', 'rxn_ai', 'met_ai', 'produces', B('The result is the signal molecule, released into the water.', 'El resultado es la molécula señal, que se libera al agua.')),
            R('req_bind', 'met_ai', 'protein_luxr', 'regulates', B('In a crowd, the signal builds up and binds the LuxR protein.', 'En una multitud, la señal se acumula y se une a la proteína LuxR.')),
            R('req_switch', 'protein_luxr', 'gene_lux', 'regulates', B('The LuxR protein, with the signal, switches on the light genes.', 'La proteína LuxR, con la señal, enciende los genes de la luz.')),
            R('req_lux_enc', 'gene_lux', 'enzyme_luc', 'encodes', B('The light genes are read and luciferase is built.', 'Se leen los genes de la luz y se construye la luciferasa.')),
            R('req_lux_cat', 'enzyme_luc', 'rxn_light', 'catalyzes', B('Luciferase runs the light reaction.', 'La luciferasa hace funcionar la reacción de la luz.')),
            R('req_glow', 'rxn_light', 'phenotype_glow', 'produces', B('The energy of the reaction leaves as light.', 'La energía de la reacción sale en forma de luz.'))],
        optional=[],
        invalid=[('met_ai', 'gene_lux', B('The signal does not touch the genes by itself. It acts through the LuxR protein.', 'La señal no toca los genes por sí sola. Actúa a través de la proteína LuxR.')),
                 ('gene_gfp', 'phenotype_glow', B('GFP does not make its own light: it needs blue light from outside. These bacteria make light with luciferase.', 'La GFP no fabrica luz propia: necesita luz azul de fuera. Estas bacterias fabrican luz con luciferasa.'))],
        distractors=['gene_gfp'], target='phenotype_glow',
        win=B('Let the signal build up so that the bacteria switch on their light together.', 'Deja que la señal se acumule para que las bacterias enciendan su luz a la vez.')),
    B('Light', 'Luz'),
    [(B('Signal made', 'Señal fabricada'), B('Each cell makes a little.', 'Cada célula fabrica un poco.')), (B('A crowd', 'Una multitud'), B('The signal builds up.', 'La señal se acumula.')), (B('Switch', 'Interruptor'), B('LuxR switches on the genes.', 'LuxR enciende los genes.')), (B('Light', 'Luz'), B('The colony glows.', 'La colonia brilla.'))],
    [B('There are two parts: a chain that makes the signal, and a chain that responds to it by making light.', 'Hay dos partes: una cadena que fabrica la señal y otra que responde a ella fabricando luz.'),
     B('luxI gene → enzyme → making the signal → signal → LuxR protein → light genes → luciferase → light reaction → glow.', 'Gen luxI → enzima → fabricar la señal → señal → proteína LuxR → genes de la luz → luciferasa → reacción de la luz → brillo.'),
     B('Connect the chain of the signal, then the signal with LuxR, LuxR with the light genes, and the second chain up to the glow.', 'Conecta la cadena de la señal, luego la señal con LuxR, LuxR con los genes de la luz y la segunda cadena hasta el brillo.')],
    B('Bacteria that count each other', 'Bacterias que se cuentan'),
    B('You followed a way in which single cells coordinate: they release a signal, sense how many they are, and act together.', 'Has seguido una forma en que las células solas se coordinan: liberan una señal, notan cuántas son y actúan juntas.'),
    B('The same idea of counting by a signal is used by many bacteria to decide when to make toxins, to form groups, or to attack, and it is an active field of research.', 'La misma idea de contarse mediante una señal la usan muchas bacterias para decidir cuándo fabricar toxinas, formar grupos o atacar, y es un campo de investigación muy activo.'),
    B('In 1970 researchers showed that the luminous marine bacteria switch on their light only at high density, thanks to a substance they release, which they called an autoinducer.', 'En 1970 unos investigadores mostraron que las bacterias marinas luminosas encienden su luz solo a alta densidad, gracias a una sustancia que liberan y que llamaron autoinductor.'),
    B('LuxI synthesises an acyl-homoserine lactone. At high concentration it binds LuxR, and the complex activates transcription of the lux operon, including the luciferase genes.', 'LuxI sintetiza una acil-homoserina lactona. A alta concentración se une a LuxR y el complejo activa la transcripción del operón lux, que incluye los genes de la luciferasa.'),
    [B('The light reaction also needs oxygen and a long-chain aldehyde; they are not shown here.', 'La reacción de la luz también necesita oxígeno y un aldehído de cadena larga; aquí no se muestran.')],
    [ref(['Nealson, K. H.', 'Platt, T.', 'Hastings, J. W.'], 1970, 'Cellular control of the synthesis and activity of the bacterial luminescent system', 'Journal of Bacteriology', '10.1128/jb.104.1.313-322.1970')])

iceminus = path_spec('ice-minus', B('Bacteria against frost', 'Bacterias contra la helada'), B('Ice that begins on a leaf', 'Hielo que empieza en una hoja'), 'beginner', 6, 'strawberry' if False else 'plant',
    B('Show how a bacterium on a leaf makes ice form on a frosty night, and so damages the plant.', 'Muestra cómo una bacteria de una hoja hace que se forme hielo en una noche de helada y así daña a la planta.'),
    B('Pure water can stay liquid below zero. A protein on the outside of some bacteria gives ice a place to start, so frost damage comes sooner.', 'El agua pura puede seguir líquida por debajo de cero. Una proteína de la superficie de algunas bacterias da al hielo un sitio donde empezar, y el daño por helada llega antes.'),
    org('pseudomonas-ice', 'Pseudomonas syringae', 'Pseudomonas syringae', 'Pseudomonas syringae', B('A common bacterium of leaves.', 'Una bacteria común de las hojas.'), ['Bacteria', 'Pseudomonadota', 'Gammaproteobacteria', 'Pseudomonadales', 'Pseudomonadaceae', 'Pseudomonas'], tissue='leaf'),
    [('plant', B('The frost', 'La helada'), B('Ice inside leaves kills cells', 'El hielo en las hojas mata células'), B('When ice forms in a leaf, crystals burst the cells. Fruit crops can lose their blossoms in one cold night.', 'Cuando se forma hielo en una hoja, los cristales revientan las células. Los cultivos de fruta pueden perder las flores en una sola noche fría.')),
     ('bacterium', B('The bacterium', 'La bacteria'), B('A seed for ice', 'Una semilla de hielo'), B('Some bacteria carry a protein that makes water freeze at about -2 °C instead of -8 °C, so ice starts on their surface.', 'Algunas bacterias llevan una proteína que hace que el agua se congele a unos -2 °C en vez de a -8 °C, así que el hielo empieza en su superficie.')),
     ('dna', B('The idea', 'La idea'), B('Remove one gene', 'Quitar un gen'), B('Researchers made a version of the bacterium without the gene of the ice protein, and sprayed it on plants so that it took the place of the natural ones.', 'Unos investigadores fabricaron una versión de la bacteria sin el gen de la proteína del hielo, y la rociaron sobre las plantas para que ocupara el lugar de las naturales.'))],
    dict(nodes=[
        N('gene_ina', 'gene', B('ina gene', 'Gen ina'), B('The recipe of the ice protein.', 'La receta de la proteína del hielo.'), 0, 0),
        N('protein_ina', 'protein', B('Ice protein', 'Proteína del hielo'), B('A protein on the surface of the bacterium that gives ice a place to start.', 'Una proteína de la superficie de la bacteria que da al hielo un sitio donde empezar.'), 1, 0),
        N('rxn_ice', 'reaction', B('Forming ice', 'Formar hielo'), B('Water organises into ice crystals.', 'El agua se organiza en cristales de hielo.'), 2, 0),
        N('met_water', 'metabolite', B('Water on the leaf', 'Agua en la hoja'), B('A thin film, liquid below zero.', 'Una película fina, líquida por debajo de cero.'), 2, 1),
        N('met_ice', 'metabolite', B('Ice crystals', 'Cristales de hielo'), B('They grow and burst the cells.', 'Crecen y revientan las células.'), 3, 0),
        N('phenotype_frost', 'phenotype', B('Frost damage', 'Daño por helada'), B('The blossoms and leaves turn brown.', 'Las flores y las hojas se ponen marrones.'), 4, 0),
        N('gene_afp', 'gene', B('Antifreeze gene', 'Gen anticongelante'), B('The recipe of a protein that stops ice from growing. The opposite of this system.', 'La receta de una proteína que impide que crezca el hielo. Lo contrario de este sistema.'), 0, 1),
        N('met_salt', 'metabolite', B('Salt', 'Sal'), B('It lowers the freezing point. Not part of this pathway.', 'Baja el punto de congelación. No forma parte de esta ruta.'), 3, 1)],
        required=[
            R('req_enc', 'gene_ina', 'protein_ina', 'encodes', B('The bacterium reads the gene and builds the ice protein.', 'La bacteria lee el gen y construye la proteína del hielo.')),
            R('req_cat', 'protein_ina', 'rxn_ice', 'catalyzes', B('The protein gives ice a place to start, so water freezes at a milder cold.', 'La proteína da al hielo un sitio donde empezar, así que el agua se congela con un frío menos intenso.')),
            R('req_water', 'rxn_ice', 'met_water', 'consumes', B('The water on the leaf is what freezes.', 'El agua de la hoja es lo que se congela.')),
            R('req_ice', 'rxn_ice', 'met_ice', 'produces', B('Ice crystals appear.', 'Aparecen cristales de hielo.')),
            R('req_damage', 'met_ice', 'phenotype_frost', 'influences', B('The crystals burst the cells of the leaf and the blossoms.', 'Los cristales revientan las células de la hoja y de las flores.'))],
        optional=[],
        invalid=[('gene_afp', 'phenotype_frost', B('Antifreeze proteins do the opposite: they stop ice crystals from growing. They would protect the plant.', 'Las proteínas anticongelantes hacen lo contrario: impiden que crezcan los cristales de hielo. Protegerían a la planta.')),
                 ('met_water', 'phenotype_frost', B('Liquid water does not hurt the leaf. It is the ice crystals that burst the cells.', 'El agua líquida no daña la hoja. Son los cristales de hielo los que revientan las células.'))],
        distractors=['gene_afp', 'met_salt'], target='phenotype_frost',
        win=B('Show how an ice protein on a bacterium leads to frost damage.', 'Muestra cómo una proteína del hielo de una bacteria lleva a una helada que daña la planta.')),
    B('Frost', 'Helada'),
    [(B('Gene read', 'Gen leído'), B('The ice protein is built.', 'Se construye la proteína del hielo.')), (B('A cold night', 'Una noche fría'), B('Water on the leaf is at -3 °C.', 'El agua de la hoja está a -3 °C.')), (B('Ice', 'Hielo'), B('Crystals start on the bacterium.', 'Empiezan los cristales sobre la bacteria.')), (B('Damage', 'Daño'), B('The cells burst.', 'Las células revientan.'))],
    [B('Ice needs a place to start. Follow how the bacterium gives it one.', 'El hielo necesita un sitio donde empezar. Sigue cómo se lo da la bacteria.'),
     B('Gene → ice protein → forming ice. The reaction uses water and makes crystals, and the crystals cause the damage.', 'Gen → proteína del hielo → formar hielo. La reacción gasta agua y fabrica cristales, y los cristales causan el daño.'),
     B('Connect: ina gene–ice protein, ice protein–forming ice, forming ice–water, forming ice–crystals and crystals–frost damage.', 'Conecta: gen ina–proteína del hielo, proteína del hielo–formar hielo, formar hielo–agua, formar hielo–cristales y cristales–daño por helada.')],
    B('One gene, one frost', 'Un gen, una helada'),
    B('You followed how a single bacterial protein can make a plant freeze at a milder cold.', 'Has seguido cómo una sola proteína bacteriana puede hacer que una planta se congele con un frío más suave.'),
    B('Without the gene, bacteria that fail to nucleate ice could take the place of those that do, and so protect a crop from frost.', 'Sin el gen, unas bacterias que no inician el hielo podrían ocupar el lugar de las que sí lo hacen y así proteger un cultivo de la helada.'),
    B('In 1987 a strain of Pseudomonas syringae without the ice gene was sprayed on a field of strawberries in California, the first outdoor test of a genetically engineered microbe.', 'En 1987 se roció una cepa de Pseudomonas syringae sin el gen del hielo sobre un campo de fresas en California, la primera prueba al aire libre de un microbio modificado genéticamente.'),
    B('Ice-nucleating proteins of P. syringae arrange water molecules like an ice lattice. Plants with these bacteria freeze at about -2 °C, while plants without them can supercool to about -8 °C.', 'Las proteínas de P. syringae que inician el hielo ordenan las moléculas de agua como una red de hielo. Las plantas con estas bacterias se congelan a unos -2 °C, mientras que sin ellas pueden sobreenfriarse hasta unos -8 °C.'),
    [B('The test and the public debate around it are not part of the level. The bacterium and its protein are simplified.', 'La prueba y el debate público que la rodeó no forman parte del nivel. La bacteria y su proteína están simplificadas.')],
    [ref(['Lindow, S. E.', 'Arny, D. C.', 'Upper, C. D.'], 1982, 'Bacterial ice nucleation: a factor in frost injury to plants', 'Plant Physiology', '10.1104/pp.70.4.1084')])

flavr = path_spec('flavr-savr', B('The tomato that lasts', 'El tomate que dura'), B('Switching off one enzyme to slow the softening', 'Apagar una enzima para frenar el ablandamiento'), 'intermediate', 7, 'tomato',
    B('Show how an enzyme softens a tomato, and how a copy of the gene in reverse can slow it down.', 'Muestra cómo una enzima ablanda un tomate y cómo una copia del gen al revés puede frenarla.'),
    B('As a tomato ripens, an enzyme breaks down the pectin that holds its cell walls together, and the fruit goes soft. Less of that enzyme means firmer tomatoes.', 'Cuando un tomate madura, una enzima descompone la pectina que mantiene unidas las paredes de sus células, y el fruto se ablanda. Menos de esa enzima significa tomates más firmes.'),
    org('flavr-savr', 'Tomato', 'Tomate', 'Solanum lycopersicum', B('A fruit that softens as it ripens.', 'Un fruto que se ablanda al madurar.'), ['Plantae', 'Tracheophyta', 'Magnoliopsida', 'Solanales', 'Solanaceae', 'Solanum'], tissue='fruit'),
    [('tomato', B('Softening', 'Ablandamiento'), B('Why tomatoes spoil', 'Por qué se estropean los tomates'), B('A tomato that is picked ripe softens quickly and bruises on the way to the shop. Growers pick them green and ripen them later, at the cost of flavour.', 'Un tomate cosechado maduro se ablanda enseguida y se magulla en el camino a la tienda. Los agricultores los cogen verdes y los maduran después, a costa del sabor.')),
     ('dna', B('The enzyme', 'La enzima'), B('Polygalacturonase', 'La poligalacturonasa'), B('The enzyme that breaks pectin is called polygalacturonase, or PG. Its gene is read more and more as the tomato ripens.', 'La enzima que rompe la pectina se llama poligalacturonasa, o PG. Su gen se lee cada vez más a medida que madura el tomate.')),
     ('flask', B('The trick', 'El truco'), B('A gene read backwards', 'Un gen leído al revés'), B('A copy of the PG gene inserted in reverse makes an RNA that pairs with the normal one and blocks it. This is called antisense.', 'Una copia del gen PG insertada al revés fabrica un ARN que se empareja con el normal y lo bloquea. Se llama antisentido.'))],
    dict(nodes=[
        N('gene_pg', 'gene', B('PG gene', 'Gen PG'), B('The recipe of polygalacturonase.', 'La receta de la poligalacturonasa.'), 0, 1),
        N('enzyme_pg', 'enzyme', B('PG enzyme', 'Enzima PG'), B('Polygalacturonase: it cuts pectin.', 'Poligalacturonasa: corta la pectina.'), 1, 1),
        N('rxn_pectin', 'reaction', B('Cutting pectin', 'Cortar la pectina'), B('The glue of the cell walls is broken.', 'Se rompe el pegamento de las paredes de las células.'), 2, 1),
        N('met_pectin', 'metabolite', B('Wall pectin', 'Pectina de la pared'), B('Holds the cells of the fruit together.', 'Mantiene unidas las células del fruto.'), 2, 2),
        N('met_pieces', 'metabolite', B('Pectin pieces', 'Trozos de pectina'), B('Small pieces: the wall loses strength.', 'Trozos pequeños: la pared pierde resistencia.'), 3, 1),
        N('phenotype_soft', 'phenotype', B('Soft fruit', 'Fruto blando'), B('The tomato goes soft and spoils.', 'El tomate se ablanda y se estropea.'), 4, 1),
        N('gene_anti', 'gene', B('Reversed PG gene', 'Gen PG al revés'), B('An inserted copy of the PG gene, in reverse.', 'Una copia insertada del gen PG, al revés.'), 0, -1),
        N('met_ethylene', 'metabolite', B('Ethylene', 'Etileno'), B('The hormone that starts ripening in general.', 'La hormona que inicia la maduración en general.'), 3, 2)],
        required=[
            R('req_enc', 'gene_pg', 'enzyme_pg', 'encodes', B('As the tomato ripens, the gene is read and PG is built.', 'Al madurar el tomate, se lee el gen y se construye la PG.')),
            R('req_cat', 'enzyme_pg', 'rxn_pectin', 'catalyzes', B('PG runs the cutting of pectin.', 'La PG hace funcionar el corte de la pectina.')),
            R('req_use', 'rxn_pectin', 'met_pectin', 'consumes', B('The reaction uses up wall pectin.', 'La reacción gasta pectina de la pared.')),
            R('req_prod', 'rxn_pectin', 'met_pieces', 'produces', B('And leaves small pieces.', 'Y deja trozos pequeños.')),
            R('req_soft', 'met_pieces', 'phenotype_soft', 'influences', B('With weak walls, the fruit goes soft.', 'Con las paredes débiles, el fruto se ablanda.'))],
        optional=[('opt_anti', 'gene_anti', 'gene_pg', 'represses', B('The reversed copy makes an RNA that blocks the PG gene: less enzyme, firmer fruit.', 'La copia al revés fabrica un ARN que bloquea el gen PG: menos enzima, fruto más firme.'), 100)],
        invalid=[('met_ethylene', 'phenotype_soft', B('Ethylene starts ripening as a whole, with many changes. It is not the enzyme that breaks pectin.', 'El etileno inicia la maduración en su conjunto, con muchos cambios. No es la enzima que rompe la pectina.')),
                 ('met_pectin', 'phenotype_soft', B('Pectin keeps the fruit firm. It is its breakdown that makes the fruit soft.', 'La pectina mantiene firme el fruto. Es su descomposición lo que lo ablanda.'))],
        distractors=['met_ethylene'], target='phenotype_soft',
        win=B('Show how the PG enzyme softens the tomato. Then try the trick that slows it down.', 'Muestra cómo la enzima PG ablanda el tomate. Después prueba el truco que la frena.')),
    B('Softening', 'Ablandamiento'),
    [(B('Gene read', 'Gen leído'), B('PG is built.', 'Se construye la PG.')), (B('Pectin cut', 'Pectina cortada'), B('The walls weaken.', 'Se debilitan las paredes.')), (B('Soft fruit', 'Fruto blando'), B('The tomato spoils.', 'El tomate se estropea.'))],
    [B('Follow the enzyme that breaks the pectin of the walls. At the end, there is an extra gene you can use to slow it down.', 'Sigue la enzima que rompe la pectina de las paredes. Al final hay un gen extra que puedes usar para frenarla.'),
     B('Gene → PG enzyme → cutting pectin → pieces → soft fruit. The reaction also uses up wall pectin.', 'Gen → enzima PG → cortar la pectina → trozos → fruto blando. La reacción también gasta pectina de la pared.'),
     B('Optional: connect the reversed PG gene to the PG gene to see how it is blocked.', 'Opcional: conecta el gen PG al revés con el gen PG para ver cómo se bloquea.')],
    B('A firmer tomato', 'Un tomate más firme'),
    B('You saw how an enzyme softens a tomato, and how a gene inserted in reverse can lower it.', 'Has visto cómo una enzima ablanda un tomate y cómo un gen insertado al revés puede reducirla.'),
    B('This tomato, called Flavr Savr, reached the shops in 1994 in the United States and was the first genetically engineered whole food to be sold.', 'Este tomate, llamado Flavr Savr, llegó a las tiendas en 1994 en Estados Unidos y fue el primer alimento entero modificado genéticamente que se vendió.'),
    B('In 1988 two teams reported that antisense RNA lowered the PG enzyme in tomato fruit. The tomato did not last on the market, but it showed that the idea works.', 'En 1988 dos equipos comunicaron que el ARN antisentido reducía la enzima PG en los frutos de tomate. El tomate no se mantuvo en el mercado, pero mostró que la idea funciona.'),
    B('The transgene is a PG sequence inserted backwards behind a promoter. The antisense RNA pairs with the PG messenger, blocking its translation and reducing PG activity.', 'El transgén es una secuencia de PG insertada al revés tras un promotor. El ARN antisentido se empareja con el mensajero de la PG, bloquea su traducción y reduce la actividad de la PG.'),
    [B('Softening depends on several enzymes, not only PG; the effect of lowering PG is partial.', 'El ablandamiento depende de varias enzimas, no solo de la PG; el efecto de reducir la PG es parcial.')],
    [ref(['Smith, C. J. S.', 'Watson, C. F.', 'Ray, J.', 'et al.'], 1988, 'Antisense RNA inhibition of polygalacturonase gene expression in transgenic tomatoes', 'Nature', '10.1038/334724a0'),
     ref(['Sheehy, R. E.', 'Kramer, M.', 'Hiatt, W. R.'], 1988, 'Reduction of polygalacturonase activity in tomato fruit by antisense RNA', 'Proceedings of the National Academy of Sciences', '10.1073/pnas.85.23.8805')])

oil = path_spec('oil-eaters', B('Bacteria that eat oil', 'Bacterias que comen petróleo'), B('Cleaning a spill with microbes', 'Limpiar un vertido con microbios'), 'advanced', 9, 'bacterium',
    B('Show how some bacteria use oil as food, in two steps: first they add oxygen to it, then they burn it for energy.', 'Muestra cómo algunas bacterias usan el petróleo como alimento, en dos pasos: primero le añaden oxígeno y luego lo queman para obtener energía.'),
    B('Oil is mostly chains of carbon and hydrogen, which very few living things can use. Some bacteria have enzymes that can start to break them down.', 'El petróleo son sobre todo cadenas de carbono e hidrógeno, que muy pocos seres vivos pueden usar. Algunas bacterias tienen enzimas que pueden empezar a romperlas.'),
    org('oil-bacteria', 'Oil-degrading bacteria', 'Bacterias que degradan petróleo', 'Alcanivorax borkumensis', B('Marine bacteria that live on oil.', 'Bacterias marinas que viven de petróleo.'), ['Bacteria', 'Pseudomonadota', 'Gammaproteobacteria', 'Oceanospirillales', 'Alcanivoracaceae', 'Alcanivorax'], tissue='single cell'),
    [('flask', B('The spill', 'El vertido'), B('Oil in the sea', 'Petróleo en el mar'), B('When oil is spilled at sea, it takes a long time to disappear. But the sea already holds bacteria that feed on it, and they multiply where there is oil.', 'Cuando se vierte petróleo al mar, tarda mucho en desaparecer. Pero el mar ya contiene bacterias que se alimentan de él y se multiplican donde hay petróleo.')),
     ('bacterium', B('The first step', 'El primer paso'), B('Adding oxygen to a hydrocarbon', 'Añadir oxígeno a un hidrocarburo'), B('An enzyme called alkane hydroxylase adds an oxygen atom to the end of the chain, which turns it into an alcohol the cell can use.', 'Una enzima llamada alcano hidroxilasa añade un átomo de oxígeno al extremo de la cadena, lo que la convierte en un alcohol que la célula puede usar.')),
     ('cell', B('The second step', 'El segundo paso'), B('Burning it for energy', 'Quemarlo para obtener energía'), B('The alcohol is oxidised step by step and burned for energy, leaving carbon dioxide and water.', 'El alcohol se oxida paso a paso y se quema para obtener energía, y quedan dióxido de carbono y agua.'))],
    dict(nodes=[
        N('gene_alk', 'gene', B('Alkane gene', 'Gen de alcanos'), B('The recipe of the enzyme that attacks oil.', 'La receta de la enzima que ataca el petróleo.'), 0, 0),
        N('enzyme_alk', 'enzyme', B('AlkB enzyme', 'Enzima AlkB'), B('Alkane hydroxylase: adds oxygen to oil.', 'Alcano hidroxilasa: añade oxígeno al petróleo.'), 1, 0),
        N('rxn_oxidize', 'reaction', B('Adding oxygen', 'Añadir oxígeno'), B('An alkane becomes a fatty alcohol.', 'Un alcano se convierte en un alcohol graso.'), 2, 0),
        N('met_alkane', 'metabolite', B('Oil', 'Petróleo'), B('Alkanes, the chains of carbon of oil.', 'Alcanos, las cadenas de carbono del petróleo.'), 2, 1),
        N('met_o2', 'metabolite', B('Oxygen', 'Oxígeno'), B('Dissolved in the water.', 'Disuelto en el agua.'), 2, 2),
        N('met_alcohol', 'metabolite', B('Fatty alcohol', 'Alcohol graso'), B('The first product: oil with an oxygen added.', 'El primer producto: petróleo con un oxígeno añadido.'), 3, 0),
        N('enzyme_beta', 'enzyme', B('Cell enzymes', 'Enzimas de la célula'), B('The usual enzymes that burn fats for energy.', 'Las enzimas habituales que queman grasas para obtener energía.'), 3, -1),
        N('rxn_burn', 'reaction', B('Burning for energy', 'Quemar para obtener energía'), B('The alcohol is oxidised step by step.', 'El alcohol se oxida paso a paso.'), 4, 0),
        N('met_co2', 'metabolite', B('Carbon dioxide', 'Dióxido de carbono'), B('A waste gas of the burning.', 'Un gas de desecho de la combustión.'), 4, 1),
        N('phenotype_clean', 'phenotype', B('Cleaner water', 'Agua más limpia'), B('The oil disappears from the sea.', 'El petróleo desaparece del mar.'), 5, 0),
        N('met_plastic', 'metabolite', B('Plastic', 'Plástico'), B('Not food for these bacteria.', 'No es alimento para estas bacterias.'), 1, 1)],
        required=[
            R('req_enc', 'gene_alk', 'enzyme_alk', 'encodes', B('The bacterium reads the gene and builds the enzyme.', 'La bacteria lee el gen y construye la enzima.')),
            R('req_cat', 'enzyme_alk', 'rxn_oxidize', 'catalyzes', B('The enzyme runs the first step.', 'La enzima hace funcionar el primer paso.')),
            R('req_oil', 'rxn_oxidize', 'met_alkane', 'consumes', B('The reaction uses oil.', 'La reacción gasta petróleo.')),
            R('req_o2', 'rxn_oxidize', 'met_o2', 'consumes', B('And oxygen, which is added to the oil.', 'Y oxígeno, que se añade al petróleo.')),
            R('req_alc', 'rxn_oxidize', 'met_alcohol', 'produces', B('The result is an alcohol.', 'El resultado es un alcohol.')),
            R('req_beta', 'enzyme_beta', 'rxn_burn', 'catalyzes', B('The usual enzymes of the cell run the burning.', 'Las enzimas habituales de la célula hacen funcionar la combustión.')),
            R('req_burn', 'rxn_burn', 'met_alcohol', 'consumes', B('The alcohol is burned for energy.', 'El alcohol se quema para obtener energía.')),
            R('req_clean', 'rxn_burn', 'phenotype_clean', 'produces', B('Little by little the oil disappears and the water is cleaner.', 'Poco a poco el petróleo desaparece y el agua queda más limpia.'))],
        optional=[('opt_co2', 'rxn_burn', 'met_co2', 'produces', B('Carbon dioxide is released, like in any burning of food.', 'Se libera dióxido de carbono, como en cualquier combustión de alimento.'), 50)],
        invalid=[('met_plastic', 'enzyme_alk', B('These bacteria feed on oil, not on plastic. Plastic needs other enzymes.', 'Estas bacterias se alimentan de petróleo, no de plástico. El plástico necesita otras enzimas.')),
                 ('met_alkane', 'rxn_burn', B('The cell cannot burn oil directly. First it has to add oxygen to it.', 'La célula no puede quemar el petróleo directamente. Primero tiene que añadirle oxígeno.'))],
        distractors=['met_plastic'], target='phenotype_clean',
        win=B('Let the bacteria add oxygen to the oil and then burn it, until the water is clean.', 'Haz que las bacterias añadan oxígeno al petróleo y luego lo quemen, hasta que el agua quede limpia.')),
    B('Clean water', 'Agua limpia'),
    [(B('Enzyme built', 'Enzima construida'), B('The first step is ready.', 'El primer paso está listo.')), (B('Oxygen added', 'Oxígeno añadido'), B('Oil becomes an alcohol.', 'El petróleo se convierte en un alcohol.')), (B('Burning', 'Combustión'), B('The cell gets energy.', 'La célula obtiene energía.')), (B('Clean', 'Limpio'), B('The oil disappears.', 'El petróleo desaparece.'))],
    [B('There are two reactions in a row. The first makes something that the second one uses.', 'Hay dos reacciones seguidas. La primera fabrica algo que usa la segunda.'),
     B('Gene → enzyme → adding oxygen (uses oil and oxygen, makes alcohol). Then cell enzymes → burning (uses the alcohol) → cleaner water.', 'Gen → enzima → añadir oxígeno (gasta petróleo y oxígeno, fabrica alcohol). Luego enzimas de la célula → combustión (gasta el alcohol) → agua más limpia.'),
     B('Connect the first chain up to the alcohol, then the second chain from the alcohol to the clean water.', 'Conecta la primera cadena hasta el alcohol y luego la segunda cadena desde el alcohol hasta el agua limpia.')],
    B('Microbes at the clean-up', 'Microbios en la limpieza'),
    B('You connected a two-step pathway by which bacteria turn oil into energy and carbon dioxide.', 'Has conectado una ruta de dos pasos con la que las bacterias convierten el petróleo en energía y dióxido de carbono.'),
    B('Natural populations of these bacteria help to remove oil from the sea after a spill, and scientists study how to help them without causing other problems.', 'Las poblaciones naturales de estas bacterias ayudan a eliminar el petróleo del mar tras un vertido, y los científicos estudian cómo ayudarlas sin causar otros problemas.'),
    B('After the Deepwater Horizon oil spill in 2010, researchers found that bacteria able to degrade oil became the most abundant in a plume of oil deep in the water.', 'Tras el vertido de petróleo de Deepwater Horizon en 2010, los investigadores encontraron que las bacterias capaces de degradar petróleo pasaron a ser las más abundantes en una nube de petróleo en las profundidades del agua.'),
    B('Alkane hydroxylases such as AlkB oxidise the terminal carbon of alkanes to alcohols. Further oxidation leads to fatty acids, which enter β-oxidation and the cell\'s energy metabolism.', 'Las alcano hidroxilasas, como la AlkB, oxidan el carbono terminal de los alcanos y los convierten en alcoholes. Una oxidación posterior da ácidos grasos, que entran en la β-oxidación y en el metabolismo energético de la célula.'),
    [B('Oil is a complex mix; here it is shown as a single kind of molecule. Several steps are shown as one.', 'El petróleo es una mezcla compleja; aquí se muestra como un solo tipo de molécula. Varios pasos se muestran como uno.')],
    [ref(['Hazen, T. C.', 'Dubinsky, E. A.', 'DeSantis, T. Z.', 'et al.'], 2010, 'Deep-sea oil plume enriches indigenous oil-degrading bacteria', 'Science', '10.1126/science.1195979'),
     ref(['Yakimov, M. M.', 'Timmis, K. N.', 'Golyshin, P. N.'], 2007, 'Obligate oil-degrading marine bacteria', 'Current Opinion in Biotechnology', '10.1016/j.copbio.2007.04.006', 'review')])

# ═════════════════════════ DIAGNOSE ═════════════════════════

def diag(id_, title, subtitle, diff, minutes, kind, objective, organism, explore, dg, hints, done_title, summary, impact, case, context, simplify, refs):
    return dict(id=id_, mode='diagnose', kind=kind, title=title, subtitle=subtitle, difficulty=diff, minutes=minutes, objective=objective,
                description=B('The pathway is built, but something fails. Read the clues, find the broken piece, and choose the right treatment.', 'La ruta está montada, pero algo falla. Lee las pistas, encuentra la pieza rota y elige el tratamiento correcto.'),
                organism=organism, exploration=explore, diagnose=dg, product=B('Diagnosis', 'Diagnóstico'),
                steps=[(B('Diagnosis', 'Diagnóstico'), B('Found and treated.', 'Encontrado y tratado.'))],
                hints=hints, done_title=done_title, summary=summary, impact=impact, case=case, context=context, simplify=simplify, refs=refs)

fix_beer = diag('fix-beer', B('The fermentation that stopped', 'La fermentación que se paró'), B('Sugar left, yeast tired', 'Queda azúcar, la levadura está cansada'), 'intermediate', 6, 'wheat',
    B('A beer stopped fermenting with a lot of sugar still in it. Find the piece that fails and the fix.', 'Una cerveza ha dejado de fermentar con mucho azúcar todavía dentro. Descubre qué pieza falla y cómo se arregla.'),
    org('beer-fix', 'Brewer\'s yeast', 'Levadura cervecera', 'Saccharomyces cerevisiae', B('Yeast that should be turning sugar into alcohol.', 'Levadura que debería convertir el azúcar en alcohol.'), ['Fungi', 'Ascomycota', 'Saccharomycetes', 'Saccharomycetales', 'Saccharomycetaceae', 'Saccharomyces'], tissue='single cell'),
    [('wheat', B('Problem', 'Problema'), B('A beer that stalls', 'Una cerveza que se atasca'), B('After three days the bubbles have stopped, but the beer is still very sweet and weak.', 'A los tres días las burbujas se han parado, pero la cerveza sigue muy dulce y floja.')),
     ('yeast', B('The yeast', 'La levadura'), B('It needs more than sugar', 'Necesita algo más que azúcar'), B('To keep fermenting, yeast also needs nitrogen, minerals and vitamins to build its enzymes and to grow.', 'Para seguir fermentando, la levadura también necesita nitrógeno, minerales y vitaminas para construir sus enzimas y crecer.'))],
    dict(symptom=B('Fermentation stopped halfway: sugar is left and the alcohol is low.', 'La fermentación se ha parado a medias: queda azúcar y el alcohol es bajo.'),
         clues=[B('A lot of sugar is still in the beer.', 'Todavía hay mucho azúcar en la cerveza.'), B('The temperature is a comfortable 18 °C.', 'La temperatura es de unos cómodos 18 °C.'), B('The yeast cells look few and weak under the microscope.', 'Las células de levadura parecen pocas y débiles al microscopio.'), B('The wort was made from very pure sugar, with almost no nitrogen.', 'El mosto se hizo con un azúcar muy puro, casi sin nitrógeno.')],
         faulty=['met_nutrients'],
         nodes=[N('met_nutrients', 'metabolite', B('Yeast nutrients', 'Nutrientes de la levadura'), B('Nitrogen, minerals and vitamins that yeast needs.', 'Nitrógeno, minerales y vitaminas que necesita la levadura.'), 0, 1),
                N('gene_ferm', 'gene', B('Yeast genes', 'Genes de levadura'), B('The recipes of the enzymes of fermentation.', 'Las recetas de las enzimas de la fermentación.'), 1, 1),
                N('enzyme_ferm', 'enzyme', B('Yeast enzymes', 'Enzimas de levadura'), B('They run the fermentation.', 'Hacen funcionar la fermentación.'), 2, 1),
                N('rxn_ferment', 'reaction', B('Fermenting', 'Fermentar'), B('Sugar → alcohol and gas.', 'Azúcar → alcohol y gas.'), 3, 1),
                N('met_sugar', 'metabolite', B('Sugar', 'Azúcar'), B('The food of the yeast.', 'La comida de la levadura.'), 3, 2),
                N('met_ethanol', 'metabolite', B('Alcohol', 'Alcohol'), B('What the yeast makes.', 'Lo que fabrica la levadura.'), 4, 1),
                N('phenotype_beer', 'phenotype', B('Finished beer', 'Cerveza terminada'), B('What we should have.', 'Lo que deberíamos tener.'), 5, 1)],
         edges=[('met_nutrients', 'gene_ferm', 'influences'), ('gene_ferm', 'enzyme_ferm', 'encodes'), ('enzyme_ferm', 'rxn_ferment', 'catalyzes'), ('rxn_ferment', 'met_sugar', 'consumes'), ('rxn_ferment', 'met_ethanol', 'produces'), ('met_ethanol', 'phenotype_beer', 'influences')],
         notes={'met_nutrients': B('The wort has almost no nitrogen: the yeast cannot build enzymes or grow, and tires. This is the broken piece.', 'El mosto casi no tiene nitrógeno: la levadura no puede construir enzimas ni crecer, y se cansa. Esta es la pieza rota.'),
                'gene_ferm': B('The genes are fine: the yeast just cannot make enough of its enzymes without nutrients.', 'Los genes están bien: la levadura, sencillamente, no puede fabricar suficientes enzimas sin nutrientes.'),
                'enzyme_ferm': B('Few enzymes are made, but those that exist work. A consequence.', 'Se fabrican pocas enzimas, pero las que hay funcionan. Una consecuencia.'),
                'rxn_ferment': B('It runs slowly because there are few enzymes. A consequence.', 'Va despacio porque hay pocas enzimas. Una consecuencia.'),
                'met_sugar': B('There is plenty of sugar, so food is not the problem.', 'Hay azúcar de sobra, así que la comida no es el problema.'),
                'met_ethanol': B('It is low, as a consequence of the stalled fermentation.', 'Es bajo, como consecuencia de la fermentación atascada.'),
                'phenotype_beer': B('It is the symptom, not the broken piece.', 'Es el síntoma, no la pieza rota.')},
         fixes=[(B('Add yeast nutrients, a source of nitrogen, and stir gently.', 'Añadir nutrientes para la levadura, una fuente de nitrógeno, y remover con suavidad.'), True, B('With nitrogen, the yeast can build enzymes and grow again, and the fermentation restarts.', 'Con nitrógeno, la levadura puede construir enzimas y crecer otra vez, y la fermentación se reanuda.')),
                (B('Add more sugar.', 'Añadir más azúcar.'), False, B('There is already plenty of sugar. More would only add to what is left.', 'Ya hay azúcar de sobra. Más solo se sumaría a lo que queda.')),
                (B('Heat the beer to 40 °C.', 'Calentar la cerveza a 40 °C.'), False, B('Heat that high would stress or kill the yeast. The temperature is already right.', 'Un calor tan alto estresaría o mataría a la levadura. La temperatura ya es la correcta.')),
                (B('Add more hops.', 'Añadir más lúpulo.'), False, B('Hops add bitterness and flavour. They do not help the yeast to ferment.', 'El lúpulo añade amargor y sabor. No ayuda a la levadura a fermentar.'))]),
    [B('There is food and the temperature is right, and yet the yeast is weak. What else does it need?', 'Hay comida y la temperatura es la correcta, y sin embargo la levadura está débil. ¿Qué más necesita?'), B('The wort was made from very pure sugar. What does pure sugar lack?', 'El mosto se hizo con azúcar muy puro. ¿Qué le falta al azúcar puro?'), B('The yeast lacks nutrients such as nitrogen.', 'A la levadura le faltan nutrientes como el nitrógeno.')],
    B('Fed with more than sugar', 'Alimentada con algo más que azúcar'),
    B('You found that the sugar was not the problem: the yeast lacked the nutrients to keep working.', 'Has descubierto que el problema no era el azúcar: a la levadura le faltaban los nutrientes para seguir trabajando.'),
    B('Stuck fermentations are a classic problem in wine and beer, and brewers often add nutrients to prevent them.', 'Las fermentaciones atascadas son un problema clásico en el vino y la cerveza, y quienes los elaboran suelen añadir nutrientes para prevenirlas.'),
    B('A nutrient shortage, mostly nitrogen, is one of the best-known causes of a stuck fermentation. A low-nitrogen must or wort is a typical warning sign.', 'La falta de nutrientes, sobre todo nitrógeno, es una de las causas mejor conocidas de una fermentación atascada. Un mosto con poco nitrógeno es una señal de aviso típica.'),
    B('Yeast needs assimilable nitrogen to make proteins and for the transport of sugars. Without it, cells stop dividing and fermentation slows down, even with sugar left.', 'La levadura necesita nitrógeno asimilable para fabricar proteínas y para el transporte de azúcares. Sin él las células dejan de dividirse y la fermentación se ralentiza, aunque quede azúcar.'),
    [B('Real stuck fermentations can have other causes too, such as cold, alcohol or toxic compounds.', 'Las fermentaciones atascadas reales también pueden tener otras causas, como el frío, el alcohol o compuestos tóxicos.')], [])

fix_sourdough = diag('fix-sourdough', B('The starter that does not rise', 'La masa madre que no sube'), B('A jar forgotten in the fridge', 'Un tarro olvidado en la nevera'), 'beginner', 5, 'bread',
    B('A sourdough starter that used to bubble is now flat. Find the piece that fails and the fix.', 'Una masa madre que antes burbujeaba ahora está plana. Descubre qué pieza falla y cómo se arregla.'),
    org('sourdough-fix', 'A sourdough starter', 'Una masa madre', 'Yeast and lactic acid bacteria', B('A living culture that should bubble.', 'Un cultivo vivo que debería burbujear.'), ['Fungi', 'Bacteria'], tissue='single cell'),
    [('bread', B('Problem', 'Problema'), B('A flat starter', 'Un cultivo plano'), B('The starter smells strange, has a grey liquid on top and shows no bubbles.', 'El cultivo huele raro, tiene un líquido gris encima y no hay burbujas.')),
     ('yeast', B('The microbes', 'Los microbios'), B('They have to eat', 'Tienen que comer'), B('Yeasts and bacteria live on the sugars of flour. If nobody feeds them, they run out of food and slow down.', 'Las levaduras y las bacterias viven de los azúcares de la harina. Si nadie las alimenta, se quedan sin comida y se ralentizan.'))],
    dict(symptom=B('The starter shows no bubbles and does not rise.', 'La masa madre no tiene burbujas y no sube.'),
         clues=[B('It has not been fed for three weeks.', 'No se ha alimentado en tres semanas.'), B('There is a grey liquid on top and a smell of nail-polish remover.', 'Hay un líquido gris encima y un olor a quitaesmalte.'), B('It has been kept at room temperature, about 22 °C.', 'Se ha guardado a temperatura ambiente, unos 22 °C.'), B('A microscope shows live yeast cells.', 'Un microscopio muestra células de levadura vivas.')],
         faulty=['met_flour'],
         nodes=[N('met_flour', 'metabolite', B('Fresh flour', 'Harina fresca'), B('The food of the microbes.', 'La comida de los microbios.'), 0, 1),
                N('gene_yeast', 'gene', B('Yeast genes', 'Genes de levadura'), B('The recipes of the enzymes.', 'Las recetas de las enzimas.'), 1, 1),
                N('enzyme_yeast', 'enzyme', B('Yeast enzymes', 'Enzimas de levadura'), B('They run the fermentation.', 'Hacen funcionar la fermentación.'), 2, 1),
                N('rxn_ferment', 'reaction', B('Fermenting', 'Fermentar'), B('Sugars → gas and acid.', 'Azúcares → gas y ácido.'), 3, 1),
                N('met_co2', 'metabolite', B('Gas', 'Gas'), B('Carbon dioxide: the bubbles.', 'Dióxido de carbono: las burbujas.'), 4, 1),
                N('phenotype_rise', 'phenotype', B('Bubbles and rise', 'Burbujas y subida'), B('What we should see.', 'Lo que deberíamos ver.'), 5, 1)],
         edges=[('gene_yeast', 'enzyme_yeast', 'encodes'), ('enzyme_yeast', 'rxn_ferment', 'catalyzes'), ('rxn_ferment', 'met_flour', 'consumes'), ('rxn_ferment', 'met_co2', 'produces'), ('met_co2', 'phenotype_rise', 'influences')],
         notes={'met_flour': B('Three weeks without feeding: the microbes have used up the flour. This is the broken piece.', 'Tres semanas sin alimentar: los microbios se han acabado la harina. Esta es la pieza rota.'),
                'gene_yeast': B('A test shows live yeast, so their genes are fine.', 'Un análisis muestra levadura viva, así que sus genes están bien.'),
                'enzyme_yeast': B('The enzymes are there, but they have nothing to work on.', 'Las enzimas están ahí, pero no tienen nada sobre lo que trabajar.'),
                'rxn_ferment': B('It has almost stopped for lack of food. A consequence.', 'Casi se ha parado por falta de comida. Una consecuencia.'),
                'met_co2': B('Very little gas is made, as a consequence of the hunger.', 'Se fabrica muy poco gas, como consecuencia del hambre.'),
                'phenotype_rise': B('It is the symptom, not the broken piece.', 'Es el síntoma, no la pieza rota.')},
         fixes=[(B('Pour off the liquid and feed the starter with fresh flour and water every day.', 'Quitar el líquido y alimentar la masa madre con harina y agua frescas cada día.'), True, B('Fresh flour gives the microbes food, and in a few days of regular feeding the starter becomes lively again.', 'La harina fresca da comida a los microbios, y con unos días de alimentación regular la masa madre vuelve a estar activa.')),
                (B('Add more salt.', 'Añadir más sal.'), False, B('Salt slows microbes down. It would make the starter even less active.', 'La sal frena a los microbios. Haría a la masa madre aún menos activa.')),
                (B('Bake it at a higher temperature.', 'Hornearla a más temperatura.'), False, B('Baking would kill the microbes you are trying to revive.', 'Hornearla mataría a los microbios que quieres reanimar.')),
                (B('Replace the genes of the yeast.', 'Cambiar los genes de la levadura.'), False, B('The genes are fine. The yeast is alive, just hungry.', 'Los genes están bien. La levadura está viva, solo que hambrienta.'))]),
    [B('The microbes are alive, so what is missing for them to work?', 'Los microbios están vivos, ¿qué les falta para trabajar?'), B('One clue says how long it has been since the last feeding.', 'Una pista dice cuánto hace desde la última vez que se alimentó.'), B('The starter has run out of flour to eat.', 'A la masa madre se le ha acabado la harina para comer.')],
    B('Feed it and it wakes up', 'Aliméntala y despierta'),
    B('You found that the microbes were alive but hungry: a starter needs regular feeding.', 'Has descubierto que los microbios estaban vivos pero hambrientos: una masa madre necesita alimentación regular.'),
    B('A starter that is looked after can last for generations, and some bakeries have kept theirs going for more than a century.', 'Una masa madre bien cuidada puede durar generaciones, y algunas panaderías mantienen la suya desde hace más de un siglo.'),
    B('Studies of sourdoughs from different countries found that each one holds its own community of yeasts and lactic acid bacteria, which survive thanks to regular feeding.', 'Los estudios de masas madre de distintos países encontraron que cada una tiene su propia comunidad de levaduras y bacterias lácticas, que sobreviven gracias a la alimentación regular.'),
    B('A starved starter accumulates acids and ethanol, which can be smelled as acetone or solvent, and the liquid on top contains the by-products. Feeding dilutes them and restores growth.', 'Una masa madre sin alimentar acumula ácidos y etanol, que huelen a acetona o disolvente, y el líquido de arriba contiene los subproductos. Alimentarla los diluye y recupera el crecimiento.'),
    [B('A real starter has many species; here it is shown as a single pathway.', 'Una masa madre real tiene muchas especies; aquí se muestra como una sola ruta.')],
    [ref(['De Vuyst, L.', 'Neysens, P.'], 2005, 'The sourdough microflora: biodiversity and metabolic interactions', 'Trends in Food Science & Technology', '10.1016/j.tifs.2004.02.012')])

fix_nodule = diag('fix-nodule', B('Soybeans without nodules', 'Soja sin nódulos'), B('The bacteria are there, but the plant ignores them', 'Las bacterias están, pero la planta las ignora'), 'intermediate', 6, 'plant',
    B('Soybean plants have no root nodules even though the right bacteria are in the soil. Find the piece that fails and the fix.', 'Unas plantas de soja no tienen nódulos en la raíz aunque en el suelo están las bacterias adecuadas. Descubre qué pieza falla y cómo se arregla.'),
    org('nodule-fix', 'Soybean and rhizobia', 'Soja y rizobios', 'Glycine max', B('A legume that should form nodules.', 'Una leguminosa que debería formar nódulos.'), ['Plantae', 'Tracheophyta', 'Magnoliopsida', 'Fabales', 'Fabaceae', 'Glycine'], tissue='root'),
    [('plant', B('Problem', 'Problema'), B('A field with no nodules', 'Un campo sin nódulos'), B('The roots are healthy but have no nodules, and the plants are pale.', 'Las raíces están sanas pero sin nódulos, y las plantas están pálidas.')),
     ('bacterium', B('The talk', 'La conversación'), B('Signals and a stop sign', 'Señales y una señal de alto'), B('Nodules form after a chemical conversation between root and bacteria. A plant that already has plenty of nitrogen does not start it.', 'Los nódulos se forman tras una conversación química entre raíz y bacterias. Una planta que ya tiene mucho nitrógeno no la empieza.'))],
    dict(symptom=B('The roots have no nodules and the plants are pale.', 'Las raíces no tienen nódulos y las plantas están pálidas.'),
         clues=[B('The right bacteria are alive in the soil.', 'Las bacterias adecuadas están vivas en el suelo.'), B('The roots release their signals normally.', 'Las raíces liberan sus señales con normalidad.'), B('The field is fertilised with a lot of nitrate.', 'El campo está abonado con mucho nitrato.'), B('Plants in unfertilised soil nearby have many nodules.', 'Las plantas de un suelo sin abonar cercano tienen muchos nódulos.')],
         faulty=['met_nitrate'],
         nodes=[N('met_flavonoid', 'metabolite', B('Root signal', 'Señal de la raíz'), B('A chemical released by the root to call the bacteria.', 'Una sustancia que libera la raíz para llamar a las bacterias.'), 0, 1),
                N('gene_nod', 'gene', B('nod genes', 'Genes nod'), B('The recipes of the enzymes that make the bacterial signal.', 'Las recetas de las enzimas que fabrican la señal de la bacteria.'), 1, 1),
                N('enzyme_nod', 'enzyme', B('Nod enzymes', 'Enzimas Nod'), B('They build the Nod factor.', 'Construyen el factor Nod.'), 2, 1),
                N('rxn_nodfactor', 'reaction', B('Making the Nod factor', 'Fabricar el factor Nod'), B('The bacterial signal that the root can read.', 'La señal bacteriana que la raíz sabe leer.'), 3, 1),
                N('met_nodfactor', 'metabolite', B('Nod factor', 'Factor Nod'), B('It tells the plant to build a nodule.', 'Dice a la planta que construya un nódulo.'), 4, 1),
                N('phenotype_nodule', 'phenotype', B('Nodules', 'Nódulos'), B('What we should see on the roots.', 'Lo que deberíamos ver en las raíces.'), 5, 1),
                N('met_nitrate', 'metabolite', B('Nitrate fertiliser', 'Abono de nitrato'), B('A form of nitrogen that the plant can take directly.', 'Una forma de nitrógeno que la planta puede absorber directamente.'), 1, 2)],
         edges=[('met_flavonoid', 'gene_nod', 'regulates'), ('gene_nod', 'enzyme_nod', 'encodes'), ('enzyme_nod', 'rxn_nodfactor', 'catalyzes'), ('rxn_nodfactor', 'met_nodfactor', 'produces'), ('met_nodfactor', 'phenotype_nodule', 'influences'), ('met_nitrate', 'gene_nod', 'represses')],
         notes={'met_flavonoid': B('The roots release their signals normally, so the call is made.', 'Las raíces liberan sus señales con normalidad, así que la llamada se hace.'),
                'gene_nod': B('The bacteria are alive and have their genes; but their switch is held down by the nitrate.', 'Las bacterias están vivas y tienen sus genes; pero el nitrato mantiene bajado su interruptor.'),
                'enzyme_nod': B('Not made, as a consequence of the gene being held down.', 'No se fabrican, como consecuencia de que el gen está frenado.'),
                'rxn_nodfactor': B('It does not happen without the enzymes. A consequence.', 'No ocurre sin las enzimas. Una consecuencia.'),
                'met_nodfactor': B('It is missing, as a consequence.', 'Falta, como consecuencia.'),
                'phenotype_nodule': B('It is the symptom, not the broken piece.', 'Es el síntoma, no la pieza rota.'),
                'met_nitrate': B('High nitrate tells the plant it does not need partners, and the conversation is not started. This is the broken piece.', 'El nitrato alto dice a la planta que no necesita socios, y la conversación no empieza. Esta es la pieza rota.')},
         fixes=[(B('Use much less nitrate fertiliser, so that the plant needs its bacteria.', 'Usar mucho menos abono de nitrato, para que la planta necesite a sus bacterias.'), True, B('With little nitrate in the soil the plant calls its bacteria, nodules form, and the bacteria give it nitrogen.', 'Con poco nitrato en el suelo la planta llama a sus bacterias, se forman nódulos y las bacterias le dan nitrógeno.')),
                (B('Add more bacteria to the soil.', 'Añadir más bacterias al suelo.'), False, B('The right bacteria are already there. They are held back, not missing.', 'Las bacterias adecuadas ya están. Están frenadas, no ausentes.')),
                (B('Water the field more.', 'Regar más el campo.'), False, B('Water does not restart the signal. The problem is the nitrate.', 'El agua no reactiva la señal. El problema es el nitrato.')),
                (B('Cut the leaves of the plants.', 'Cortar las hojas de las plantas.'), False, B('That would only stress the plants. It does not help the nodules.', 'Solo estresaría a las plantas. No ayuda a los nódulos.'))]),
    [B('The plant calls its partners, the bacteria are there, yet no nodule appears. Something stops the conversation.', 'La planta llama a sus socios, las bacterias están ahí, y sin embargo no aparece ningún nódulo. Algo detiene la conversación.'), B('One clue is about what is added to the field.', 'Una pista habla de lo que se añade al campo.'), B('The nitrate fertiliser switches nodulation off.', 'El abono de nitrato apaga la nodulación.')],
    B('A fertiliser that works against the partner', 'Un abono que trabaja contra el socio'),
    B('You found that a plant that gets plenty of nitrogen does not bother to build nodules.', 'Has descubierto que una planta que recibe mucho nitrógeno no se molesta en construir nódulos.'),
    B('Farmers who grow legumes can save fertiliser, since the plants make part of their own nitrogen.', 'Los agricultores que cultivan leguminosas pueden ahorrar abono, porque las plantas fabrican parte de su propio nitrógeno.'),
    B('Studies of legumes show that high nitrate concentrations inhibit the formation of nodules and the fixing of nitrogen.', 'Los estudios de leguminosas muestran que las concentraciones altas de nitrato inhiben la formación de nódulos y la fijación de nitrógeno.'),
    B('Nitrate inhibits several steps of nodulation, among them the response of the root to Nod factors and the growth of the nodule, probably through signals that travel through the plant.', 'El nitrato inhibe varios pasos de la nodulación, entre ellos la respuesta de la raíz a los factores Nod y el crecimiento del nódulo, probablemente mediante señales que viajan por la planta.'),
    [B('Nitrate acts at several points; here it is shown as one switch on the bacterial genes.', 'El nitrato actúa en varios puntos; aquí se muestra como un solo interruptor sobre los genes de la bacteria.')],
    [ref(['Streeter, J.', 'Wong, P. P.'], 1988, 'Inhibition of legume nodule formation and N2 fixation by nitrate', 'Critical Reviews in Plant Sciences', '10.1080/07352688809382257', 'review')])

# ═════════════════════════ CRISPR (rice, real) ═════════════════════════

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
    rng = random.Random(seed)
    for _ in range(4000):
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
                plant(p, seq, rng.choice('ACGT') + 'GG'); planted.append(p)
                if kind == 'offtarget':
                    q = free(0, glen)
                    if q is None or (start - L - 4 < q < end + 3): ok = False; break
                    near = list(seq); k = rng.randrange(L // 2); near[k] = rng.choice([c for c in 'ACGT' if c != near[k]])
                    plant(q, ''.join(near), rng.choice('ACGT') + 'GG'); planted.append(q)
            elif kind == 'nopam':
                p = free(start, end + 3)
                if p is None or p + L > end: ok = False; break
                plant(p, seq, rng.choice('ACGT') + rng.choice(['AG', 'GA', 'CA', 'AC', 'TA'])); planted.append(p)
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

genome, guides = make_crispr(21, 100, 24, 66, 1, [('a', 'offtarget'), ('b', 'perfect'), ('c', 'elsewhere'), ('d', 'nopam'), ('e', 'nomatch')])
crispr5 = dict(id='crispr-5', mode='crispr', kind='grain', title=B('Rice that resists blight', 'Arroz que resiste el tizón'), subtitle=B('Editing the door the bacteria use', 'Editar la puerta que usa la bacteria'),
    difficulty='advanced', minutes=9,
    objective=B('Choose the guide that edits the binding site in the promoter of a rice gene, and only there.', 'Elige la guía que edita el sitio de unión del promotor de un gen del arroz, y solo ese.'),
    description=B('The bacterium that causes bacterial blight in rice switches on a plant gene by binding to a short stretch of its promoter. Editing that stretch closes the door.', 'La bacteria que causa el tizón bacteriano del arroz enciende un gen de la planta uniéndose a un tramo corto de su promotor. Editar ese tramo cierra la puerta.'),
    organism=org('rice-sweet', 'Rice', 'Arroz', 'Oryza sativa', B('A cereal attacked by a bacterial disease.', 'Un cereal atacado por una enfermedad bacteriana.'), ['Plantae', 'Tracheophyta', 'Liliopsida', 'Poales', 'Poaceae', 'Oryza'], tissue='leaf', organelle='nucleus'),
    exploration=[('grain', B('The disease', 'La enfermedad'), B('Bacterial blight', 'El tizón bacteriano'), B('Bacterial blight is a disease of rice caused by Xanthomonas bacteria. It can destroy a large part of a harvest.', 'El tizón bacteriano es una enfermedad del arroz causada por bacterias del género Xanthomonas. Puede destruir una parte grande de una cosecha.')),
                 ('dna', B('The trick of the bacterium', 'El truco de la bacteria'), B('It makes the plant open a door', 'Hace que la planta abra una puerta'), B('The bacterium injects a protein that binds to the promoter of a plant gene for a sugar transporter, SWEET. The plant then releases sugar to feed the bacteria.', 'La bacteria inyecta una proteína que se une al promotor de un gen de la planta para un transportador de azúcar, SWEET. La planta libera entonces azúcar para alimentar a la bacteria.')),
                 ('dna', B('The edit', 'La edición'), B('Change the binding site', 'Cambiar el sitio de unión'), B('If the binding site of the promoter is edited, the bacterial protein can no longer bind, but the plant gene still works for the plant.', 'Si se edita el sitio de unión del promotor, la proteína de la bacteria ya no puede unirse, pero el gen de la planta sigue funcionando para la planta.'))],
    crispr=dict(genome=genome, target=(B('binding site of the SWEET promoter', 'sitio de unión del promotor de SWEET'), 24, 66), guides=guides, mismatches=1,
                story=B('A stretch of the promoter of a SWEET gene of rice. Edit the binding site of the bacterial protein, and nothing else.', 'Un tramo del promotor de un gen SWEET del arroz. Edita el sitio de unión de la proteína de la bacteria, y nada más.')),
    product=B('Cut', 'Corte'),
    steps=[(B('Guide', 'Guía'), B('The guide leads Cas9 to the binding site.', 'La guía lleva a Cas9 al sitio de unión.')), (B('Cut', 'Corte'), B('Cas9 cuts the promoter.', 'Cas9 corta el promotor.')), (B('Repair', 'Reparación'), B('The binding site changes.', 'El sitio de unión cambia.'))],
    hints=[B('Tap each guide and count where it sticks. Only one cuts exactly once, inside the blue area.', 'Toca cada guía y cuenta dónde se pega. Solo una corta exactamente una vez, dentro de la zona azul.'),
           B('Two guides stick inside the blue area but one has no PAM and another cuts also at a look-alike site elsewhere.', 'Dos guías se pegan dentro de la zona azul pero una no tiene PAM y otra corta también en un sitio parecido de otro lugar.'),
           B('Choose guide B.', 'Elige la guía B.')],
    done_title=B('A door closed', 'Una puerta cerrada'),
    summary=B('You chose a guide that edits only the binding site, so the bacterium can no longer open the door.', 'Has elegido una guía que edita solo el sitio de unión, así que la bacteria ya no puede abrir la puerta.'),
    impact=B('Editing the parts of a plant that a disease needs can give resistance without adding genes from other species.', 'Editar las partes de una planta que necesita una enfermedad puede dar resistencia sin añadir genes de otras especies.'),
    case=B('In 2019 a team edited the promoters of three SWEET genes in rice with CRISPR, and obtained plants with broad resistance to bacterial blight in the laboratory and in field tests.', 'En 2019 un equipo editó con CRISPR los promotores de tres genes SWEET del arroz y obtuvo plantas con una resistencia amplia al tizón bacteriano en el laboratorio y en ensayos de campo.'),
    context=B('Xanthomonas oryzae injects TAL effectors that bind effector-binding elements in the promoters of SWEET genes, inducing them. Mutating those elements prevents the induction and the disease.', 'Xanthomonas oryzae inyecta efectores TAL que se unen a elementos de unión en los promotores de los genes SWEET y los activan. Mutar esos elementos impide la activación y la enfermedad.'),
    simplify=[B('Guides here have 8 letters so they fit on the screen; real ones have about 20.', 'Las guías de aquí tienen 8 letras para que quepan en pantalla; las reales tienen unas 20.'), B('The sequence is invented; the real promoters have several binding sites.', 'La secuencia es inventada; los promotores reales tienen varios sitios de unión.')],
    refs=[ref(['Oliva, R.', 'Ji, C.', 'Atienza-Grande, G.', 'et al.'], 2019, 'Broad-spectrum resistance to bacterial blight in rice using genome editing', 'Nature Biotechnology', '10.1038/s41587-019-0267-z')])

write_levels([nitrogen, beer_path, quorum, iceminus, flavr, oil, fix_beer, fix_sourdough, fix_nodule, crispr5])
