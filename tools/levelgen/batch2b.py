import os
import sys, itertools
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from levelgen import *

def org(id_, en, es, sci, desc, taxonomy=None, tissue='whole organism', organelle='cytoplasm'):
    return dict(id=id_, name=B(en, es), sci=sci, desc=desc, taxonomy=taxonomy or ['Eukaryota'], tissue=tissue, organelle=organelle)

def check_tune(spec):
    t = spec['tune']
    combos = list(itertools.product(*[k[2] for k in t['knobs']]))
    res = []
    for combo in combos:
        per = gr = 1; cost = 0
        for o in combo:
            cost += o[3]; per *= o[4]; gr *= o[5]
        res.append((round(t['base'] * per * gr * 10) / 10, gr, cost))
    solved = [r for r in res if r[0] >= t['target'] and r[2] <= t['budget']]
    over = [r for r in res if r[0] >= t['target'] and r[2] > t['budget']]
    suffer = [r for r in res if r[2] <= t['budget'] and r[0] < t['target'] and r[1] < 0.6]
    assert len(solved) >= 2 and len(solved) / len(res) < 0.35 and over and suffer, (spec['id'], len(solved), len(res), len(over), len(suffer))

# ═════════════════════════ TUNE ═════════════════════════

def tune_spec(id_, title, subtitle, diff, minutes, objective, description, organism, explore, tune, hints, kind, done_title, summary, impact, case, context, simplify, steps):
    spec = dict(id=id_, mode='tune', kind=kind, title=title, subtitle=subtitle, difficulty=diff, minutes=minutes, objective=objective, description=description,
                organism=organism, exploration=explore, tune=tune, product=B(tune['metric'][0], tune['metric'][1]), steps=steps,
                hints=hints, done_title=done_title, summary=summary, impact=impact, case=case, context=context, simplify=simplify, refs=[])
    check_tune(spec)
    return spec

tune_yogurt = tune_spec('tune-yogurt', B('Tune the yogurt', 'Ajusta el yogur'), B('Warm enough, not too hot', 'Templado, pero no demasiado'), 'beginner', 5,
    B('Choose the settings so that the milk sets firmly without going over budget.', 'Elige los ajustes para que la leche cuaje bien sin pasarte del presupuesto.'),
    B('Yogurt bacteria are picky: the temperature, the amount of culture and the time all change how firm the yogurt is.', 'Las bacterias del yogur son exigentes: la temperatura, la cantidad de cultivo y el tiempo cambian lo firme que queda el yogur.'),
    org('yogurt-tune', 'Yogurt bacteria', 'Bacterias del yogur', 'Lactobacillus delbrueckii', B('Bacteria that thicken milk.', 'Bacterias que espesan la leche.'), ['Bacteria', 'Bacillota', 'Bacilli', 'Lactobacillales'], tissue='single cell'),
    [('milk', B('Milk', 'Leche'), B('A recipe with settings', 'Una receta con ajustes'), B('Making yogurt at home is a balance: a bit more of one thing may need less of another.', 'Hacer yogur en casa es un equilibrio: un poco más de una cosa puede pedir menos de otra.')),
     ('bacterium', B('Bacteria', 'Bacterias'), B('Happy at 43 °C', 'Felices a 43 °C'), B('At about 43 °C the bacteria grow fastest. Much hotter and they die.', 'A unos 43 °C las bacterias crecen más rápido. Con mucho más calor mueren.'))],
    dict(metric=B('Firmness', 'Firmeza'), unit='%', base=40, target=64, budget=5,
         perCell=B('Acid made', 'Ácido fabricado'), growth=B('Bacteria health', 'Salud de las bacterias'),
         lowGrowth=B('The bacteria are suffering: the temperature or the time do not suit them.', 'Las bacterias sufren: la temperatura o el tiempo no les sientan bien.'),
         lowPerCell=B('Too little acid: the milk needs more culture or more time.', 'Poco ácido: la leche necesita más cultivo o más tiempo.'),
         knobs=[
             ('culture', B('Amount of culture', 'Cantidad de cultivo'), [
                 ('little', B('A little', 'Poco'), B('Slow, but gentle.', 'Lento, pero suave.'), 1, 1, 1),
                 ('normal', B('A spoonful', 'Una cucharada'), B('The usual amount.', 'La cantidad habitual.'), 2, 1.4, 1),
                 ('lots', B('A lot', 'Mucho'), B('Fast, but the bacteria compete for food.', 'Rápido, pero las bacterias compiten por la comida.'), 3, 1.8, 0.85)]),
             ('temp', B('Temperature', 'Temperatura'), [
                 ('cool', B('Cool, about 25 °C', 'Fresca, unos 25 °C'), B('Free, but the bacteria grow very slowly.', 'Gratis, pero las bacterias crecen muy despacio.'), 0, 1, 0.55),
                 ('warm', B('Warm, about 43 °C', 'Templada, unos 43 °C'), B('Where the bacteria are happiest.', 'Donde las bacterias están más a gusto.'), 1, 1, 1),
                 ('hot', B('Hot, about 65 °C', 'Caliente, unos 65 °C'), B('Too hot: it kills the bacteria.', 'Demasiado caliente: mata a las bacterias.'), 1, 1, 0.05)]),
             ('time', B('Time', 'Tiempo'), [
                 ('short', B('3 hours', '3 horas'), B('Quick, but little acid.', 'Rápido, pero con poco ácido.'), 0, 0.7, 1),
                 ('mid', B('8 hours', '8 horas'), B('The classic overnight.', 'La clásica noche entera.'), 1, 1.3, 1),
                 ('long', B('24 hours', '24 horas'), B('Very sour and watery.', 'Muy ácido y aguado.'), 2, 1.6, 0.7)])]),
    [B('Think about what the bacteria like: warmth, enough food and time, but not too much of anything.', 'Piensa en lo que les gusta a las bacterias: calor, suficiente comida y tiempo, pero nada en exceso.'),
     B('Hot kills the bacteria, and a long time makes the yogurt too sour. Look for the middle of each knob.', 'El calor mata a las bacterias y mucho tiempo vuelve el yogur demasiado ácido. Busca el punto medio de cada ajuste.'),
     B('A spoonful of culture, warm and 8 hours works within budget.', 'Una cucharada de cultivo, templado y 8 horas funciona dentro del presupuesto.')],
    'milk', B('A balanced recipe', 'Una receta equilibrada'),
    B('You balanced three settings, each with its good side and its drawback.', 'Has equilibrado tres ajustes, cada uno con su lado bueno y su inconveniente.'),
    B('Industrial dairies do the same, tuning culture, temperature and time to get the yogurt they want.', 'Las lecherías industriales hacen lo mismo, ajustando cultivo, temperatura y tiempo para obtener el yogur que quieren.'),
    B('Yogurt bacteria were studied in the early 1900s, and starter cultures became an industrial product soon after.', 'Las bacterias del yogur se estudiaron a principios del siglo XX y los cultivos iniciadores pronto se convirtieron en un producto industrial.'),
    B('Lactic acid production depends on temperature in a bell-shaped way: too cold is slow, too hot kills.', 'La producción de ácido láctico depende de la temperatura con forma de campana: demasiado frío es lento y demasiado calor mata.'),
    [B('Real fermentation has more variables, like the milk used and the type of bacteria.', 'La fermentación real tiene más variables, como la leche usada y el tipo de bacterias.')],
    [(B('Prepare', 'Preparar'), B('Milk and culture.', 'Leche y cultivo.')), (B('Incubate', 'Incubar'), B('The bacteria make acid.', 'Las bacterias fabrican ácido.')), (B('Set', 'Cuajar'), B('The milk firms up.', 'La leche se vuelve firme.'))])

tune_biogas = tune_spec('tune-biogas', B('Tune the digester', 'Ajusta el digestor'), B('Heat, feed and stirring', 'Calor, alimento y mezcla'), 'intermediate', 6,
    B('Choose the settings for a biogas digester so that it makes enough gas without going over budget.', 'Elige los ajustes de un digestor de biogás para que produzca suficiente gas sin pasarte del presupuesto.'),
    B('The microbes of a digester work best in warm, well-fed and gently stirred tanks, but each of those costs energy or harms them if overdone.', 'Los microbios de un digestor trabajan mejor en tanques templados, bien alimentados y removidos con suavidad, pero cada cosa cuesta energía o los perjudica si se exagera.'),
    org('digester-tune', 'A biogas digester', 'Un digestor de biogás', 'Anaerobic digestion', B('A tank of microbes that make methane.', 'Un tanque de microbios que fabrican metano.'), ['Bacteria', 'Archaea'], tissue='single cell'),
    [('flask', B('Digester', 'Digestor'), B('A tank to look after', 'Un tanque que cuidar'), B('The gas a digester makes depends on how well its microbes are kept.', 'El gas que da un digestor depende de lo bien cuidados que estén sus microbios.')),
     ('bacterium', B('Microbes', 'Microbios'), B('Sensitive and hard-working', 'Sensibles y trabajadores'), B('Methane microbes grow slowly and dislike sudden changes, too much food or too much stirring.', 'Los microbios del metano crecen despacio y no les gustan los cambios bruscos, el exceso de comida ni remover demasiado.'))],
    dict(metric=B('Gas', 'Gas'), unit='m³/day', unit_es='m³/día', base=10, target=12, budget=5,
         perCell=B('Gas per microbe', 'Gas por microbio'), growth=B('Microbe health', 'Salud de los microbios'),
         lowGrowth=B('The microbes are suffering: too cold, overfed or stirred too hard.', 'Los microbios sufren: hace demasiado frío, hay exceso de comida o se remueve con demasiada fuerza.'),
         lowPerCell=B('The digester makes little gas: it needs more warmth, food or stirring.', 'El digestor da poco gas: necesita más calor, comida o mezcla.'),
         knobs=[
             ('temp', B('Temperature', 'Temperatura'), [
                 ('cold', B('Cold, about 15 °C', 'Fría, unos 15 °C'), B('Free, but the microbes are very slow.', 'Gratis, pero los microbios van muy lentos.'), 0, 1, 0.5),
                 ('mild', B('Warm, about 35 °C', 'Templada, unos 35 °C'), B('Where the methane microbes are happiest.', 'Donde más a gusto están los microbios del metano.'), 2, 1, 1),
                 ('hot', B('Hot, about 55 °C', 'Caliente, unos 55 °C'), B('Faster, but costly and a bit risky.', 'Más rápido, pero caro y algo arriesgado.'), 3, 1.3, 0.9)]),
             ('feed', B('Amount of waste', 'Cantidad de residuos'), [
                 ('little', B('A little', 'Poca'), B('Safe, but there is little to eat.', 'Seguro, pero hay poco que comer.'), 0, 0.8, 1),
                 ('normal', B('A normal load', 'Una carga normal'), B('A steady supply of food.', 'Un suministro constante de comida.'), 1, 1.2, 1),
                 ('lots', B('A lot', 'Mucha'), B('Too much at once turns the tank acid and harms the microbes.', 'Demasiada de golpe acidifica el tanque y perjudica a los microbios.'), 2, 1.6, 0.6)]),
             ('mix', B('Stirring', 'Mezcla'), [
                 ('none', B('None', 'Ninguna'), B('Free, but a crust forms and the microbes starve.', 'Gratis, pero se forma una costra y los microbios se quedan sin comida.'), 0, 1, 0.7),
                 ('gentle', B('Gentle', 'Suave'), B('Spreads the food without hurting the microbes.', 'Reparte la comida sin dañar a los microbios.'), 1, 1.2, 1),
                 ('strong', B('Strong', 'Fuerte'), B('Costs energy and breaks up the microbe groups.', 'Gasta energía y deshace los grupos de microbios.'), 2, 1.3, 0.8)])]),
    [B('Each microbe group is happiest in a middle setting: neither cold nor too hot, neither starved nor overfed.', 'Cada grupo de microbios está más a gusto en un punto medio: ni frío ni demasiado calor, ni sin comida ni con exceso.'),
     B('Cold tanks and no stirring make the microbes suffer. Too much waste at once does too. Keep the budget in mind.', 'Los tanques fríos y sin mezcla hacen sufrir a los microbios. Demasiados residuos de golpe también. Ten en cuenta el presupuesto.'),
     B('Warm, a normal load and gentle stirring is a safe combination within budget.', 'Templado, carga normal y mezcla suave es una combinación segura dentro del presupuesto.')],
    'flask', B('A well-kept tank', 'Un tanque bien cuidado'),
    B('You tuned a digester by balancing what its microbes need against what it costs to give it.', 'Has ajustado un digestor equilibrando lo que necesitan sus microbios y lo que cuesta dárselo.'),
    B('Operators of real biogas plants adjust these same variables every day.', 'Quienes operan las plantas de biogás reales ajustan estas mismas variables a diario.'),
    B('In some countries, millions of small household digesters turn animal waste into cooking gas.', 'En algunos países, millones de pequeños digestores domésticos convierten residuos animales en gas para cocinar.'),
    B('Mesophilic digesters work at about 35 °C and thermophilic ones at about 55 °C. Overloading with food can acidify the tank and stop methane production.', 'Los digestores mesófilos trabajan a unos 35 °C y los termófilos a unos 55 °C. Sobrecargarlos de comida puede acidificar el tanque y detener la producción de metano.'),
    [B('Real digesters also depend on the type of waste and on the retention time.', 'Los digestores reales también dependen del tipo de residuos y del tiempo de retención.')],
    [(B('Load', 'Cargar'), B('Waste enters the tank.', 'Entran residuos en el tanque.')), (B('Digest', 'Digerir'), B('Microbes work in a chain.', 'Los microbios trabajan en cadena.')), (B('Gas', 'Gas'), B('Methane is collected.', 'Se recoge el metano.'))])

tune_pcr = tune_spec('tune-pcr', B('Tune the PCR', 'Ajusta la PCR'), B('Copies without mistakes', 'Copias sin errores'), 'intermediate', 7,
    B('Choose the settings of a PCR machine to get enough copies of a DNA piece without going over budget.', 'Elige los ajustes de una máquina de PCR para obtener suficientes copias de un trozo de ADN sin pasarte del presupuesto.'),
    B('PCR copies DNA by heating and cooling. The number of cycles, the temperature where the primers stick and the enzyme all matter.', 'La PCR copia ADN calentando y enfriando. Importan el número de ciclos, la temperatura a la que se pegan los cebadores y la enzima.'),
    org('pcr-tune', 'A PCR tube', 'Un tubo de PCR', 'Polymerase chain reaction', B('A tube where DNA is copied.', 'Un tubo donde se copia ADN.'), ['Method'], tissue='tube', organelle='tube'),
    [('dna', B('Cycles', 'Ciclos'), B('Every cycle doubles the DNA', 'Cada ciclo duplica el ADN'), B('After 30 cycles one copy becomes more than a billion. But more cycles also bring more errors.', 'Tras 30 ciclos una copia se convierte en más de mil millones. Pero más ciclos también traen más errores.')),
     ('flask', B('Enzyme', 'Enzima'), B('It has to survive the heat', 'Tiene que sobrevivir al calor'), B('Each cycle heats the DNA to about 95 °C. An ordinary enzyme would be destroyed; a heat-resistant one survives.', 'En cada ciclo el ADN se calienta a unos 95 °C. Una enzima corriente se destruiría; una resistente al calor sobrevive.'))],
    dict(metric=B('Copies', 'Copias'), unit='×1000', base=10, target=12, budget=5,
         perCell=B('Copies per cycle', 'Copias por ciclo'), growth=B('Accuracy', 'Precisión'),
         lowGrowth=B('The copies are full of mistakes: the primers stick in wrong places, or the enzyme does not survive.', 'Las copias están llenas de errores: los cebadores se pegan en sitios equivocados o la enzima no sobrevive.'),
         lowPerCell=B('Too few copies: more cycles or more primers are needed.', 'Pocas copias: hacen falta más ciclos o más cebadores.'),
         knobs=[
             ('cycles', B('Number of cycles', 'Número de ciclos'), [
                 ('few', B('15 cycles', '15 ciclos'), B('Quick, but few copies.', 'Rápido, pero pocas copias.'), 0, 0.5, 1),
                 ('normal', B('30 cycles', '30 ciclos'), B('The usual number.', 'El número habitual.'), 1, 1.5, 1),
                 ('many', B('45 cycles', '45 ciclos'), B('Many copies, but errors and junk pile up.', 'Muchas copias, pero se acumulan errores y basura.'), 2, 1.9, 0.6)]),
             ('anneal', B('Temperature where primers stick', 'Temperatura a la que se pegan los cebadores'), [
                 ('low', B('Low, about 45 °C', 'Baja, unos 45 °C'), B('Primers stick everywhere, including wrong places.', 'Los cebadores se pegan en todas partes, también donde no deben.'), 0, 1, 0.5),
                 ('right', B('Right, about 55 °C', 'Adecuada, unos 55 °C'), B('Primers stick only where they should.', 'Los cebadores se pegan solo donde deben.'), 0, 1, 1),
                 ('high', B('High, about 72 °C', 'Alta, unos 72 °C'), B('Primers hardly stick at all.', 'Los cebadores casi no se pegan.'), 0, 1, 0.3)]),
             ('enzyme', B('Polymerase', 'Polimerasa'), [
                 ('ordinary', B('Ordinary', 'Corriente'), B('Cheap, but the heat destroys it.', 'Barata, pero el calor la destruye.'), 0, 1, 0.05),
                 ('heat', B('Heat-resistant', 'Resistente al calor'), B('Survives the 95 °C of each cycle.', 'Sobrevive a los 95 °C de cada ciclo.'), 2, 1, 1),
                 ('precise', B('Heat-resistant and precise', 'Resistente al calor y precisa'), B('The best, and the most expensive.', 'La mejor, y la más cara.'), 3, 1.1, 1)]),
             ('primers', B('Primers', 'Cebadores'), [
                 ('little', B('A little', 'Pocos'), B('Cheap, but slower copying.', 'Baratos, pero el copiado es más lento.'), 0, 0.7, 1),
                 ('normal', B('Normal', 'Normal'), B('The usual amount.', 'La cantidad habitual.'), 1, 1, 1),
                 ('lots', B('A lot', 'Muchos'), B('Faster, but primers stick to each other.', 'Más rápido, pero los cebadores se pegan entre sí.'), 2, 1.2, 0.8)])]),
    [B('The enzyme must survive the heat, and the primers must stick only where they should.', 'La enzima tiene que sobrevivir al calor y los cebadores deben pegarse solo donde toca.'),
     B('An ordinary enzyme and a wrong temperature ruin the copies. Then balance the number of cycles against the budget.', 'Una enzima corriente y una temperatura equivocada arruinan las copias. Después equilibra el número de ciclos con el presupuesto.'),
     B('A heat-resistant enzyme, 55 °C and 30 cycles is a safe base to build on.', 'Una enzima resistente al calor, 55 °C y 30 ciclos es una base segura.')],
    'flask', B('A good amplification', 'Una buena amplificación'),
    B('You tuned a PCR: the right enzyme and temperature, and enough cycles without wasting money or making errors.', 'Has ajustado una PCR: la enzima y la temperatura correctas, y suficientes ciclos sin gastar de más ni cometer errores.'),
    B('PCR is used everywhere: to identify species, to check food, to test samples and to prepare DNA for sequencing.', 'La PCR se usa en todas partes: para identificar especies, comprobar alimentos, analizar muestras y preparar ADN para secuenciar.'),
    B('Kary Mullis devised PCR in 1983, and the use of a heat-resistant polymerase from a hot-spring bacterium made it practical. Mullis shared the 1993 Nobel Prize in Chemistry.', 'Kary Mullis ideó la PCR en 1983, y el uso de una polimerasa resistente al calor de una bacteria de aguas termales la hizo práctica. Mullis compartió el Premio Nobel de Química de 1993.'),
    B('The annealing temperature depends on the primers. Too low and they bind to similar sequences; too high and they do not bind.', 'La temperatura de unión depende de los cebadores. Demasiado baja y se unen a secuencias parecidas; demasiado alta y no se unen.'),
    [B('Real PCR also depends on the buffer, the amount of DNA and the length of the piece.', 'La PCR real también depende del tampón, la cantidad de ADN y la longitud del trozo.')],
    [(B('Heat', 'Calentar'), B('The strands separate.', 'Las hebras se separan.')), (B('Cool', 'Enfriar'), B('The primers stick.', 'Los cebadores se pegan.')), (B('Copy', 'Copiar'), B('The enzyme builds new strands.', 'La enzima construye hebras nuevas.'))])

tune_algae = tune_spec('tune-algae', B('Tune the algae pond', 'Ajusta el estanque de algas'), B('Light, gas and food', 'Luz, gas y alimento'), 'intermediate', 6,
    B('Choose the settings of an algae culture so that it grows enough without going over budget.', 'Elige los ajustes de un cultivo de algas para que crezca lo suficiente sin pasarte del presupuesto.'),
    B('Algae live on light, carbon dioxide and nutrients. More of everything costs more, and too much of some things hurts them.', 'Las algas viven de luz, dióxido de carbono y nutrientes. Más de todo cuesta más, y demasiado de algunas cosas les hace daño.'),
    org('algae-tune', 'Microalgae', 'Microalgas', 'Chlorella vulgaris', B('Tiny green algae grown for food, feed and fuel.', 'Algas verdes diminutas que se cultivan para alimento, pienso y combustible.'), ['Plantae', 'Chlorophyta', 'Trebouxiophyceae', 'Chlorellales', 'Chlorellaceae', 'Chlorella'], tissue='single cell', organelle='chloroplast'),
    [('plant', B('Algae', 'Algas'), B('Sunlight turned into biomass', 'Luz del sol convertida en biomasa'), B('Algae turn light and CO2 into sugars and oils. Some are grown to make food, feed or fuel.', 'Las algas convierten luz y CO2 en azúcares y aceites. Algunas se cultivan para obtener alimento, pienso o combustible.')),
     ('flask', B('The pond', 'El estanque'), B('A balance of three things', 'Un equilibrio de tres cosas'), B('Too little light or food and the algae grow slowly. Too much light burns them, and too many nutrients can turn the water toxic for them.', 'Con poca luz o alimento las algas crecen despacio. Con demasiada luz se queman, y con demasiados nutrientes el agua puede volverse mala para ellas.'))],
    dict(metric=B('Algae', 'Algas'), unit='g/L', base=10, target=13, budget=5,
         perCell=B('Growth per cell', 'Crecimiento por célula'), growth=B('Algae health', 'Salud de las algas'),
         lowGrowth=B('The algae are suffering: too much light or too many nutrients.', 'Las algas sufren: demasiada luz o demasiados nutrientes.'),
         lowPerCell=B('The algae grow slowly: they need more light, CO2 or nutrients.', 'Las algas crecen despacio: necesitan más luz, CO2 o nutrientes.'),
         knobs=[
             ('light', B('Light', 'Luz'), [
                 ('dim', B('Dim', 'Tenue'), B('Free, but the algae grow slowly.', 'Gratis, pero las algas crecen despacio.'), 0, 0.6, 1),
                 ('bright', B('Bright', 'Intensa'), B('Good growth for a fair price.', 'Buen crecimiento a un precio razonable.'), 2, 1.4, 1),
                 ('intense', B('Very intense', 'Muy intensa'), B('Fast, but it burns the algae.', 'Rápida, pero quema las algas.'), 3, 1.8, 0.5)]),
             ('co2', B('Carbon dioxide', 'Dióxido de carbono'), [
                 ('air', B('Just air', 'Solo aire'), B('Free, but there is little CO2.', 'Gratis, pero hay poco CO2.'), 0, 0.8, 1),
                 ('enriched', B('Enriched air', 'Aire enriquecido'), B('More CO2 for the algae to use.', 'Más CO2 para que lo aprovechen las algas.'), 2, 1.3, 1),
                 ('pure', B('Pure CO2', 'CO2 puro'), B('Costly, and it makes the water too acid.', 'Caro, y vuelve el agua demasiado ácida.'), 3, 1.5, 0.7)]),
             ('food', B('Nutrients', 'Nutrientes'), [
                 ('poor', B('Poor', 'Pocos'), B('Cheap, but the algae are underfed.', 'Barato, pero las algas pasan hambre.'), 0, 0.7, 0.8),
                 ('balanced', B('Balanced', 'Equilibrados'), B('The right amount of nitrogen and phosphorus.', 'La cantidad justa de nitrógeno y fósforo.'), 1, 1.2, 1),
                 ('rich', B('Very rich', 'Muy abundantes'), B('Too much and the culture gets unbalanced.', 'Demasiado y el cultivo se desequilibra.'), 2, 1.4, 0.55)])]),
    [B('Algae need light, CO2 and nutrients, but each one can be too much.', 'Las algas necesitan luz, CO2 y nutrientes, pero de cada cosa puede haber demasiado.'),
     B('Very intense light, pure CO2 and a very rich pond hurt the algae and the budget. Look for the middle.', 'La luz muy intensa, el CO2 puro y un estanque muy rico dañan a las algas y al presupuesto. Busca el punto medio.'),
     B('Bright light, enriched air and balanced nutrients is not possible within budget; give up one of them.', 'Luz intensa, aire enriquecido y nutrientes equilibrados no cabe en el presupuesto; renuncia a uno de ellos.')],
    'plant', B('A green harvest', 'Una cosecha verde'),
    B('You balanced light, CO2 and nutrients to grow algae efficiently.', 'Has equilibrado luz, CO2 y nutrientes para cultivar algas de forma eficiente.'),
    B('Algae farms produce food supplements, animal feed and research into biofuels.', 'Las granjas de algas producen complementos alimenticios, pienso y investigación en biocombustibles.'),
    B('Microalgae have been grown commercially since the 1960s, first in Japan and later across the world.', 'Las microalgas se cultivan comercialmente desde los años sesenta, primero en Japón y luego en todo el mundo.'),
    B('Photosynthesis saturates: beyond a certain light level, extra light only damages the photosystems. Nutrient balance also controls what the cells make.', 'La fotosíntesis se satura: por encima de cierta cantidad de luz, la luz extra solo daña los fotosistemas. El equilibrio de nutrientes también controla lo que fabrican las células.'),
    [B('Real cultures also depend on temperature, depth and mixing.', 'Los cultivos reales también dependen de la temperatura, la profundidad y la mezcla.')],
    [(B('Seed', 'Sembrar'), B('A few algae in water.', 'Unas pocas algas en el agua.')), (B('Grow', 'Crecer'), B('They use light and CO2.', 'Usan luz y CO2.')), (B('Harvest', 'Cosechar'), B('The culture is collected.', 'Se recoge el cultivo.'))])

# ═════════════════════════ CONSTRUCT ═════════════════════════

def construct_spec(id_, title, subtitle, diff, minutes, objective, description, organism, explore, construct, hints, kind, done_title, summary, impact, case, context, simplify, steps, product, refs=None):
    return dict(id=id_, mode='construct', kind=kind, title=title, subtitle=subtitle, difficulty=diff, minutes=minutes, objective=objective, description=description,
                organism=organism, exploration=explore, construct=construct, product=product, steps=steps,
                hints=hints, done_title=done_title, summary=summary, impact=impact, case=case, context=context, simplify=simplify, refs=refs or [])

STD_STEPS = [(B('Promoter', 'Promotor'), B('The cell starts reading.', 'La célula empieza a leer.')), (B('Gene', 'Gen'), B('The protein is made.', 'Se fabrica la proteína.')), (B('Stop', 'Parada'), B('The reading ends.', 'La lectura termina.'))]

build_sensor = construct_spec('build-sensor', B('Bacteria that warn you', 'Bacterias que avisan'), B('A switch that listens for sugar', 'Un interruptor que escucha el azúcar'), 'beginner', 5,
    B('Assemble a DNA circuit so that bacteria glow only when a sugar is present.', 'Monta un circuito de ADN para que las bacterias brillen solo cuando haya un azúcar.'),
    B('A biosensor is a living detector. Its promoter only switches on when it meets the substance we want to detect.', 'Un biosensor es un detector vivo. Su promotor solo se enciende cuando encuentra la sustancia que queremos detectar.'),
    org('biosensor', 'Sensor bacteria', 'Bacterias sensoras', 'Escherichia coli', B('A bacterium that glows when it senses something.', 'Una bacteria que brilla cuando detecta algo.'), ['Bacteria', 'Pseudomonadota', 'Gammaproteobacteria', 'Enterobacterales', 'Enterobacteriaceae', 'Escherichia'], tissue='single cell'),
    [('bacterium', B('Biosensor', 'Biosensor'), B('A detector made of cells', 'Un detector hecho de células'), B('Some bacteria can be built to light up when a substance is in the water, which helps to test samples cheaply.', 'Se pueden construir bacterias que se iluminen cuando haya una sustancia en el agua, lo que ayuda a analizar muestras con poco coste.')),
     ('dna', B('The circuit', 'El circuito'), B('The promoter decides', 'El promotor decide'), B('The promoter is a switch: if it is always on the bacteria glow all the time and the sensor is useless.', 'El promotor es un interruptor: si está siempre encendido, las bacterias brillan siempre y el sensor no sirve.'))],
    dict(solution=['p_sugar', 'rbs', 'gfp', 'term'], parts=[
        ('p_sugar', 'promoter', B('Sugar-responsive promoter', 'Promotor que responde al azúcar'), B('Switches on only when the sugar is present.', 'Se enciende solo cuando hay azúcar.'), None),
        ('p_const', 'promoter', B('Always-on promoter', 'Promotor siempre encendido'), B('Switched on whatever the conditions.', 'Encendido pase lo que pase.'),
         B('This promoter is always on, so the bacteria would glow all the time. A sensor must only glow when the sugar is there.', 'Este promotor está siempre encendido, así que las bacterias brillarían todo el tiempo. Un sensor solo debe brillar cuando está el azúcar.')),
        ('rbs', 'rbs', B('Ribosome binding site (RBS)', 'Sitio de unión del ribosoma (RBS)'), B('The landing strip where the ribosome starts reading.', 'La pista de aterrizaje donde el ribosoma empieza a leer.'), None),
        ('gfp', 'gene', B('gfp gene', 'Gen gfp'), B('Recipe for the green fluorescent protein.', 'Receta de la proteína verde fluorescente.'), None),
        ('lacz', 'gene', B('lacZ gene', 'Gen lacZ'), B('Recipe for an enzyme that digests lactose.', 'Receta de una enzima que digiere lactosa.'),
         B('lacZ makes an enzyme that digests lactose. It does not make anything glow: for that you need gfp.', 'lacZ fabrica una enzima que digiere lactosa. No hace brillar nada: para eso hace falta gfp.')),
        ('term', 'terminator', B('Terminator', 'Terminador'), B('Marks where the reading stops.', 'Marca dónde termina la lectura.'), None)]),
    [B('A circuit starts with a promoter and ends with a terminator. In between go the landing strip and the gene.', 'Un circuito empieza con un promotor y acaba con un terminador. En medio van la pista de aterrizaje y el gen.'),
     B('A sensor must only glow when the sugar is there, so its promoter must be the one that responds to the sugar.', 'Un sensor solo debe brillar cuando está el azúcar, así que su promotor tiene que ser el que responde al azúcar.'),
     B('Promoter that responds to sugar → RBS → gfp gene → terminator.', 'Promotor que responde al azúcar → RBS → gen gfp → terminador.')],
    'bacterium', B('A living detector', 'Un detector vivo'),
    B('You built a circuit that lights up only in the presence of the sugar, a simple living sensor.', 'Has construido un circuito que se ilumina solo en presencia del azúcar, un sensor vivo sencillo.'),
    B('Biosensors are being developed to detect pollutants in water, spoiled food and many other things.', 'Se desarrollan biosensores para detectar contaminantes en el agua, alimentos en mal estado y muchas otras cosas.'),
    B('Bacteria that sense chemicals and report with a light have been used as biosensors since the 1990s.', 'Las bacterias que detectan sustancias químicas y avisan con luz se usan como biosensores desde los años noventa.'),
    B('Inducible promoters are controlled by repressor or activator proteins that bind a specific molecule, switching expression on or off.', 'Los promotores inducibles están controlados por proteínas represoras o activadoras que se unen a una molécula concreta y encienden o apagan la expresión.'),
    [B('Real biosensors need extra parts to make the signal stronger and clearer.', 'Los biosensores reales necesitan piezas extra para que la señal sea más fuerte y clara.')],
    STD_STEPS, B('Light', 'Luz'))

build_lactase = construct_spec('build-lactase', B('Yeast that makes lactase', 'Levadura que fabrica lactasa'), B('An enzyme that has to leave the cell', 'Una enzima que tiene que salir de la célula'), 'intermediate', 6,
    B('Assemble a DNA construct so that yeast makes lactase and sends it out of the cell.', 'Monta una construcción de ADN para que la levadura fabrique lactasa y la envíe fuera de la célula.'),
    B('Yeast cells read genes differently from bacteria, and an enzyme that has to leave the cell needs a signal at its start.', 'Las células de levadura leen los genes de forma distinta a las bacterias, y una enzima que tiene que salir de la célula necesita una señal al principio.'),
    org('yeast-lactase', 'Yeast', 'Levadura', 'Kluyveromyces lactis', B('A yeast that can make lactase.', 'Una levadura que puede fabricar lactasa.'), ['Fungi', 'Ascomycota', 'Saccharomycetes', 'Saccharomycetales', 'Saccharomycetaceae', 'Kluyveromyces'], tissue='single cell'),
    [('yeast', B('Yeast', 'Levadura'), B('A cell with a nucleus', 'Una célula con núcleo'), B('Yeast cells have a nucleus and their own way of reading genes: they do not use the bacterial landing strip.', 'Las células de levadura tienen núcleo y su propia forma de leer los genes: no usan la pista de aterrizaje de las bacterias.')),
     ('milk', B('Lactase', 'Lactasa'), B('An enzyme for milk', 'Una enzima para la leche'), B('Lactase breaks lactose into two simple sugars. To use it in milk, the yeast must release it outside.', 'La lactasa rompe la lactosa en dos azúcares sencillos. Para usarla en la leche, la levadura tiene que liberarla fuera.'))],
    dict(solution=['p_yeast', 'signal', 'lac4', 'term'], parts=[
        ('p_yeast', 'promoter', B('Strong yeast promoter', 'Promotor fuerte de levadura'), B('Switches on genes at a high level in yeast.', 'Enciende genes con intensidad en la levadura.'), None),
        ('p_bact', 'promoter', B('Bacterial promoter', 'Promotor bacteriano'), B('A promoter that works in bacteria.', 'Un promotor que funciona en bacterias.'),
         B('A bacterial promoter is not recognised by yeast cells, so the gene would never be read.', 'Los promotores bacterianos no los reconocen las células de levadura, así que el gen nunca se leería.')),
        ('signal', 'signal', B('Secretion signal', 'Señal de secreción'), B('A tag that sends the protein out of the cell.', 'Una etiqueta que envía la proteína fuera de la célula.'), None),
        ('rbs', 'rbs', B('Bacterial ribosome site (RBS)', 'Sitio ribosómico bacteriano (RBS)'), B('The landing strip of bacterial ribosomes.', 'La pista de aterrizaje de los ribosomas bacterianos.'),
         B('Yeast ribosomes do not use this bacterial landing strip.', 'Los ribosomas de levadura no usan esta pista de aterrizaje bacteriana.')),
        ('lac4', 'gene', B('LAC4 gene (lactase)', 'Gen LAC4 (lactasa)'), B('Recipe for the enzyme that digests lactose.', 'Receta de la enzima que digiere la lactosa.'), None),
        ('term', 'terminator', B('Terminator', 'Terminador'), B('Marks where the reading stops.', 'Marca dónde termina la lectura.'), None)]),
    [B('The enzyme has to leave the cell, so the construct needs a signal before the gene.', 'La enzima tiene que salir de la célula, así que la construcción necesita una señal antes del gen.'),
     B('Choose parts that work in yeast: a yeast promoter, and no bacterial landing strip.', 'Elige piezas que funcionen en levadura: un promotor de levadura y ninguna pista de aterrizaje bacteriana.'),
     B('Yeast promoter → secretion signal → LAC4 gene → terminator.', 'Promotor de levadura → señal de secreción → gen LAC4 → terminador.')],
    'yeast', B('An enzyme that leaves the cell', 'Una enzima que sale de la célula'),
    B('You built a construct that works in yeast and sends the enzyme out.', 'Has construido una construcción que funciona en levadura y envía la enzima fuera.'),
    B('Lactase made by microbes is added to milk to produce lactose-free milk.', 'La lactasa fabricada por microbios se añade a la leche para obtener leche sin lactosa.'),
    B('Kluyveromyces lactis is a yeast that naturally lives on milk sugar, and it has been used to produce lactase for many years.', 'Kluyveromyces lactis es una levadura que vive de forma natural del azúcar de la leche y se usa desde hace años para producir lactasa.'),
    B('In eukaryotes, secreted proteins carry an N-terminal signal peptide that sends them into the secretory pathway.', 'En eucariotas, las proteínas secretadas llevan un péptido señal en el extremo N que las envía a la vía secretora.'),
    [B('Real yeast constructs often include more parts to maintain them in the cell.', 'Las construcciones reales de levadura suelen incluir más piezas para mantenerlas en la célula.')],
    STD_STEPS, B('Lactase', 'Lactasa'))

build_pigment = construct_spec('build-pigment', B('Red bacteria', 'Bacterias rojas'), B('Two genes, one pigment', 'Dos genes, un pigmento'), 'intermediate', 7,
    B('Assemble a two-gene circuit: each gene needs its own landing strip for the ribosome.', 'Monta un circuito de dos genes: cada gen necesita su propia pista de aterrizaje para el ribosoma.'),
    B('Making a pigment often needs more than one enzyme, so more than one gene. In bacteria, each gene of the circuit has its own ribosome site.', 'Fabricar un pigmento suele necesitar más de una enzima, así que más de un gen. En bacterias, cada gen del circuito tiene su propio sitio para el ribosoma.'),
    org('pigment-bacteria', 'Pigment bacteria', 'Bacterias de pigmento', 'Escherichia coli', B('A bacterium that makes a red pigment.', 'Una bacteria que fabrica un pigmento rojo.'), ['Bacteria', 'Pseudomonadota', 'Gammaproteobacteria', 'Enterobacterales', 'Enterobacteriaceae', 'Escherichia'], tissue='single cell'),
    [('tomato', B('Pigment', 'Pigmento'), B('A chain of enzymes', 'Una cadena de enzimas'), B('The red of tomatoes, lycopene, is made by a short chain of enzymes. Bacteria with the same genes also turn red.', 'El rojo de los tomates, el licopeno, lo fabrica una cadena corta de enzimas. Las bacterias con los mismos genes también se vuelven rojas.')),
     ('dna', B('Two genes', 'Dos genes'), B('One after the other', 'Uno tras otro'), B('Genes placed one after the other under the same promoter are read together, but each needs its own landing strip.', 'Los genes colocados uno tras otro bajo el mismo promotor se leen juntos, pero cada uno necesita su pista de aterrizaje.'))],
    dict(solution=['p_ind', 'rbs1', 'crt1', 'rbs2', 'crt2', 'term'], parts=[
        ('p_ind', 'promoter', B('Inducible promoter', 'Promotor inducible'), B('Switches on when the chemical is added.', 'Se enciende cuando se añade el compuesto.'), None),
        ('p_off', 'promoter', B('Switched-off promoter', 'Promotor apagado'), B('A promoter that is never switched on here.', 'Un promotor que aquí nunca se enciende.'),
         B('This promoter is never switched on in this culture, so no pigment would be made.', 'Este promotor nunca se enciende en este cultivo, así que no se fabricaría pigmento.')),
        ('rbs1', 'rbs', B('RBS 1', 'RBS 1'), B('Landing strip for the first gene.', 'Pista de aterrizaje para el primer gen.'), None),
        ('crt1', 'gene', B('First pigment gene', 'Primer gen del pigmento'), B('Recipe for the first enzyme of the chain.', 'Receta de la primera enzima de la cadena.'), None),
        ('rbs2', 'rbs', B('RBS 2', 'RBS 2'), B('Landing strip for the second gene.', 'Pista de aterrizaje para el segundo gen.'), None),
        ('crt2', 'gene', B('Second pigment gene', 'Segundo gen del pigmento'), B('Recipe for the second enzyme of the chain.', 'Receta de la segunda enzima de la cadena.'), None),
        ('gfp', 'gene', B('gfp gene', 'Gen gfp'), B('Recipe for a green fluorescent protein.', 'Receta de una proteína verde fluorescente.'),
         B('gfp makes a protein that glows green. It is not part of the red pigment chain.', 'gfp fabrica una proteína que brilla en verde. No forma parte de la cadena del pigmento rojo.')),
        ('term', 'terminator', B('Terminator', 'Terminador'), B('Marks where the reading stops.', 'Marca dónde termina la lectura.'), None)]),
    [B('Both pigment genes go between the promoter and the terminator, and each gene needs its own landing strip before it.', 'Los dos genes del pigmento van entre el promotor y el terminador, y cada gen necesita su propia pista de aterrizaje antes.'),
     B('Use the promoter that can be switched on and leave out gfp, which makes something else.', 'Usa el promotor que se puede encender y deja fuera gfp, que fabrica otra cosa.'),
     B('Promoter → RBS 1 → first gene → RBS 2 → second gene → terminator.', 'Promotor → RBS 1 → primer gen → RBS 2 → segundo gen → terminador.')],
    'bacterium', B('A two-step pigment', 'Un pigmento en dos pasos'),
    B('You assembled two genes in a row, each with its own landing strip, to make a pigment in two steps.', 'Has montado dos genes seguidos, cada uno con su pista de aterrizaje, para fabricar un pigmento en dos pasos.'),
    B('Microbes are being engineered to make natural dyes and pigments for food and textiles.', 'Se modifican microbios para fabricar colorantes y pigmentos naturales para alimentos y textiles.'),
    B('Researchers have made E. coli produce lycopene and related pigments by adding genes from other organisms.', 'Los investigadores han hecho que E. coli produzca licopeno y pigmentos parecidos añadiéndole genes de otros organismos.'),
    B('Genes arranged one after another under a single promoter and read together are called an operon, a common arrangement in bacteria.', 'Los genes dispuestos uno tras otro bajo un solo promotor y leídos juntos forman un operón, una disposición frecuente en bacterias.'),
    [B('Real pathways for pigments can have many more steps and genes.', 'Las rutas reales de los pigmentos pueden tener muchos más pasos y genes.')],
    [(B('Promoter', 'Promotor'), B('The cell starts reading.', 'La célula empieza a leer.')), (B('Two enzymes', 'Dos enzimas'), B('Both are made.', 'Se fabrican las dos.')), (B('Pigment', 'Pigmento'), B('The cells turn red.', 'Las células se vuelven rojas.'))], B('Pigment', 'Pigmento'))

# ═════════════════════════ PAIRING ═════════════════════════

def pair_spec(id_, title, subtitle, diff, minutes, kind, template, story, objective, hints, extra_explore, summary):
    return dict(id=id_, mode='pairing', kind='dna', title=title, subtitle=subtitle, difficulty=diff, minutes=minutes,
        objective=objective,
        description=B('Strands pair with strict rules. Work out each partner letter by letter, as the cell does.', 'Las hebras se emparejan con reglas estrictas. Averigua cada pareja letra a letra, como hace la célula.'),
        organism=org('pair-' + id_, 'A strand of nucleic acid', 'Una hebra de ácido nucleico', 'Nucleic acids', B('DNA and RNA strands.', 'Hebras de ADN y ARN.'), ['Molecule'], tissue='nucleus', organelle='nucleus'),
        exploration=[('dna', B('Rules', 'Reglas'), B('Pairs that never change', 'Parejas que nunca cambian'), B('A pairs with T in DNA and with U in RNA; C always pairs with G.', 'La A se une con T en el ADN y con U en el ARN; la C siempre se une con G.')),
                      ('cell', B('Why it matters', 'Por qué importa'), B('Copying without mistakes', 'Copiar sin errores'), B('Because every base has one partner, a cell can copy a strand again and again, and use it to read a gene.', 'Como cada base tiene una sola pareja, una célula puede copiar una hebra una y otra vez, y usarla para leer un gen.'))] + extra_explore,
        pairing=dict(kind=kind, template=template, story=story),
        product=B('Strand', 'Hebra'),
        steps=[(B('Template', 'Molde'), B('The strand that exists.', 'La hebra que ya existe.')), (B('Pairs', 'Parejas'), B('Each base finds its partner.', 'Cada base encuentra a su pareja.')), (B('Strand', 'Hebra'), B('The new strand is complete.', 'La hebra nueva está completa.'))],
        hints=hints, done_title=B('Strands in step', 'Hebras a la par'), summary=summary,
        impact=B('Every time a cell copies its DNA or reads a gene it applies these rules billions of times.', 'Cada vez que una célula copia su ADN o lee un gen aplica estas reglas miles de millones de veces.'),
        case=B('Base pairing was explained in 1953 by James Watson and Francis Crick, who built the double helix model.', 'El emparejamiento de bases lo explicaron en 1953 James Watson y Francis Crick, que construyeron el modelo de la doble hélice.'),
        context=B('Hydrogen bonds hold A with T (two bonds) and G with C (three bonds). In RNA, uracil takes the place of thymine.', 'Los enlaces de hidrógeno mantienen unidas A con T (dos enlaces) y G con C (tres enlaces). En el ARN el uracilo ocupa el lugar de la timina.'),
        simplify=[B('Strands are written in the same direction to keep it simple.', 'Las hebras se escriben en el mismo sentido para simplificar.')],
        refs=[{'authors': ['Watson, J. D.', 'Crick, F. H. C.'], 'year': 1953, 'title': 'Molecular structure of nucleic acids: a structure for deoxyribose nucleic acid', 'journal': 'Nature', 'doi': '10.1038/171737a0', 'type': 'paper'}])

pair_dna2 = pair_spec('pair-dna-2', B('A longer strand', 'Una hebra más larga'), B('Fourteen letters to pair', 'Catorce letras que emparejar'), 'beginner', 5, 'dna', 'TACGGATCCGATGC',
    B('A longer strand of DNA, with repeated letters. Take your time and pair each one.', 'Una hebra de ADN más larga, con letras repetidas. Tómate tu tiempo y empareja cada una.'),
    B('Write the second strand of this DNA, letter by letter.', 'Escribe la segunda hebra de este ADN, letra a letra.'),
    [B('Go from left to right and pair each letter on its own.', 'Ve de izquierda a derecha y empareja cada letra por separado.'), B('A pairs with T and C pairs with G, in both directions.', 'A se une con T y C con G, en los dos sentidos.'), B('The partners are: A T G C C T A G G C T A C G.', 'Las parejas son: A T G C C T A G G C T A C G.')], [],
    B('You paired a longer strand: the rules are the same no matter how long it is.', 'Has emparejado una hebra más larga: las reglas son las mismas sea cual sea su longitud.'))
pair_rna2 = pair_spec('pair-rna-2', B('Copy a longer message', 'Copia un mensaje más largo'), B('Fifteen letters into RNA', 'Quince letras a ARN'), 'beginner', 5, 'rna', 'TACCACGTTTGAATT',
    B('The cell copies this stretch of DNA into messenger RNA. Remember: there is no T in RNA.', 'La célula copia este tramo de ADN en ARN mensajero. Recuerda: el ARN no tiene T.'),
    B('Write the messenger RNA that is copied from this DNA template.', 'Escribe el ARN mensajero que se copia de esta molde de ADN.'),
    [B('RNA copies the template letter by letter. Mind the A: its partner is U.', 'El ARN copia la molde letra a letra. Ojo con la A: su pareja es U.'), B('A→U, T→A, C→G, G→C.', 'A→U, T→A, C→G, G→C.'), B('The message is: A U G G U G C A A A C U U A A.', 'El mensaje es: A U G G U G C A A A C U U A A.')], [],
    B('You copied a longer gene into RNA. Notice that the message starts with AUG, the start signal.', 'Has copiado un gen más largo en ARN. Fíjate en que el mensaje empieza por AUG, la señal de inicio.'))
pair_protein2 = pair_spec('pair-protein-2', B('Another protein', 'Otra proteína'), B('Five codons and a stop', 'Cinco codones y una parada'), 'intermediate', 6, 'protein', 'AUGUGGCACGAAUAG',
    B('A short message that ends with a stop. Which amino acids does it make?', 'Un mensaje corto que acaba con una parada. ¿Qué aminoácidos fabrica?'),
    B('Read this messenger RNA three letters at a time and find the amino acid of each codon.', 'Lee este ARN mensajero de tres en tres letras y busca el aminoácido de cada codón.'),
    [B('Split the message into groups of three and look each one up in the table.', 'Divide el mensaje en grupos de tres y busca cada uno en la tabla.'), B('The first codon is AUG and the last is a stop.', 'El primer codón es AUG y el último es de parada.'), B('AUG = Met, UGG = Trp, CAC = His, GAA = Glu, UAG = Stop.', 'AUG = Met, UGG = Trp, CAC = His, GAA = Glu, UAG = Fin.')],
    [('cell', B('Stop', 'Parada'), B('Three ways to end', 'Tres formas de acabar'), B('UAA, UAG and UGA are stop codons: no amino acid is added and the protein is released.', 'UAA, UAG y UGA son codones de parada: no se añade ningún aminoácido y la proteína se libera.'))],
    B('You translated a second message, ending with a stop signal.', 'Has traducido un segundo mensaje, que acaba con una señal de parada.'))

# ═════════════════════════ CUT ═════════════════════════

def cut_spec(id_, title, subtitle, diff, minutes, objective, story, gene, length, enzymes, hints, explore, done_title, summary, impact, organism, kind='dna'):
    return dict(id=id_, mode='cut', kind=kind, title=title, subtitle=subtitle, difficulty=diff, minutes=minutes, objective=objective,
        description=B('Restriction enzymes are molecular scissors that cut at their own sequences. You need a cut right at each end of the gene and none inside it.', 'Las enzimas de restricción son tijeras moleculares que cortan en sus propias secuencias. Necesitas un corte justo en cada extremo del gen y ninguno dentro.'),
        organism=organism, exploration=explore,
        cut=dict(length=length, gene=gene, enzymes=enzymes, story=story),
        product=B('Gene', 'Gen'),
        steps=[(B('Cut', 'Cortar'), B('The enzymes cut the DNA at their sites.', 'Las enzimas cortan el ADN en sus sitios.')), (B('Run the gel', 'Correr el gel'), B('The pieces separate by size.', 'Los trozos se separan por tamaño.')), (B('Gene free', 'Gen libre'), B('The gene is a piece of its own.', 'El gen es un trozo por sí solo.'))],
        hints=hints, done_title=done_title, summary=summary, impact=impact,
        case=B('Werner Arber, Daniel Nathans and Hamilton Smith received the 1978 Nobel Prize in Physiology or Medicine for the discovery and use of restriction enzymes.', 'Werner Arber, Daniel Nathans y Hamilton Smith recibieron el Premio Nobel de Fisiología o Medicina de 1978 por el descubrimiento y la aplicación de las enzimas de restricción.'),
        context=B('Each restriction enzyme recognises a short sequence of DNA, usually 4 to 8 letters, and cuts there. Gel electrophoresis separates the fragments by length.', 'Cada enzima de restricción reconoce una secuencia corta de ADN, normalmente de 4 a 8 letras, y corta ahí. La electroforesis en gel separa los fragmentos por longitud.'),
        simplify=[B('The DNA is drawn as a straight stretch and the cutting positions are invented.', 'El ADN se dibuja como un trozo recto y las posiciones de corte son inventadas.'), B('Sizes are in kilobases (kb), thousands of letters.', 'Los tamaños están en kilobases (kb), miles de letras.')],
        refs=[])

ENZ = lambda eid, label, rec, sites: (eid, label, B('Recognises ' + rec + '.', 'Reconoce ' + rec + '.'), sites)

cut_lactase = cut_spec('cut-lactase', B('One scissors or two?', '¿Unas tijeras o dos?'), B('Sometimes one enzyme is enough', 'A veces basta una enzima'), 'intermediate', 6,
    B('Cut out the lactase gene. Look for the enzyme that cuts at both ends of the gene by itself.', 'Saca el gen de la lactasa. Busca la enzima que corta ella sola en los dos extremos del gen.'),
    B('Some enzymes cut at many places. One may cut exactly on both sides of the gene.', 'Algunas enzimas cortan en varios sitios. Una puede cortar justo a los dos lados del gen.'),
    (B('Lactase gene', 'Gen de la lactasa'), 3, 7), 11,
    [ENZ('eco', 'EcoRI', 'GAATTC', [3, 9]), ENZ('bam', 'BamHI', 'GGATCC', [7]), ENZ('hind', 'HindIII', 'AAGCTT', [5]), ENZ('xho', 'XhoI', 'CTCGAG', [3, 7])],
    [B('The gene needs a cut at each end and none inside. One enzyme can do both at once.', 'El gen necesita un corte en cada extremo y ninguno dentro. Una enzima puede hacer las dos cosas a la vez.'),
     B('Look at the map: which enzyme has a mark at the start of the gene and another at its end?', 'Mira el mapa: ¿qué enzima tiene una marca al principio del gen y otra al final?'),
     B('XhoI alone cuts at both ends. EcoRI and BamHI together also work.', 'XhoI sola corta en los dos extremos. EcoRI y BamHI juntas también valen.')],
    [('dna', B('Sites', 'Sitios'), B('One sequence, several places', 'Una secuencia, varios sitios'), B('An enzyme cuts wherever its sequence appears. If it appears on both sides of a gene, a single enzyme frees it.', 'Una enzima corta donde aparezca su secuencia. Si aparece a los dos lados de un gen, una sola enzima lo libera.')),
     ('milk', B('The gene', 'El gen'), B('A gene for lactase', 'Un gen para la lactasa'), B('The gene of an enzyme that digests lactose is the piece we want to isolate.', 'El gen de una enzima que digiere la lactosa es el trozo que queremos aislar.'))],
    B('Fewer cuts, cleaner result', 'Menos cortes, resultado más limpio'),
    B('You found that a single enzyme can cut a gene out when its sequence flanks the gene, and that a band the right size is not enough.', 'Has descubierto que una sola enzima puede sacar un gen si su secuencia lo rodea, y que una banda del tamaño correcto no basta.'),
    B('Using fewer enzymes simplifies a protocol and lowers its cost, which matters when it is repeated many times.', 'Usar menos enzimas simplifica un protocolo y reduce su coste, lo que importa cuando se repite muchas veces.'),
    org('lactase-dna', 'DNA with the lactase gene', 'ADN con el gen de la lactasa', 'Kluyveromyces lactis', B('A stretch of DNA that contains the lactase gene.', 'Un trozo de ADN que contiene el gen de la lactasa.'), ['Fungi', 'Ascomycota'], tissue='nucleus', organelle='nucleus'), 'milk')

cut_plasmid = cut_spec('cut-plasmid', B('A crowded map', 'Un mapa lleno'), B('Five enzymes, one gene', 'Cinco enzimas, un gen'), 'advanced', 8,
    B('Choose among five enzymes to isolate the gene. Some cut inside the gene, and one gives a band that looks right but is not.', 'Elige entre cinco enzimas para aislar el gen. Algunas cortan dentro del gen y una da una banda que parece correcta pero no lo es.'),
    B('A real map has many cutting sites. Reading it carefully is part of the work.', 'Un mapa real tiene muchos sitios de corte. Leerlo con cuidado es parte del trabajo.'),
    (B('Target gene', 'Gen objetivo'), 5, 10), 15,
    [ENZ('eco', 'EcoRI', 'GAATTC', [5, 13]), ENZ('bam', 'BamHI', 'GGATCC', [10, 2]), ENZ('hind', 'HindIII', 'AAGCTT', [7.5]), ENZ('xho', 'XhoI', 'CTCGAG', [3.5, 12]), ENZ('sal', 'SalI', 'GTCGAC', [1, 14])],
    [B('Same rule as always: one cut at each end of the gene and none inside. The gel can fool you.', 'La misma regla de siempre: un corte en cada extremo del gen y ninguno dentro. El gel puede engañarte.'),
     B('One enzyme cuts only at the end of the gene and leaves a piece with the same size as the gene. Check the map, not just the sizes.', 'Una enzima corta solo en el final del gen y deja un trozo con el mismo tamaño que el gen. Mira el mapa, no solo los tamaños.'),
     B('EcoRI cuts at the start and BamHI at the end. HindIII cuts inside.', 'EcoRI corta al principio y BamHI al final. HindIII corta dentro.')],
    [('dna', B('The map', 'El mapa'), B('Many sites', 'Muchos sitios'), B('The longer the DNA, the more places an enzyme finds. Researchers choose enzymes that cut where they want and nowhere else.', 'Cuanto más largo es el ADN, más sitios encuentra una enzima. Los investigadores eligen las que cortan donde quieren y en ningún otro lugar.')),
     ('bacterium', B('The goal', 'El objetivo'), B('A gene for a carrier', 'Un gen para un vehículo'), B('The isolated gene will be joined to a plasmid so that bacteria can copy and use it.', 'El gen aislado se unirá a un plásmido para que las bacterias puedan copiarlo y usarlo.'))],
    B('Reading the map well', 'Leer bien el mapa'),
    B('Among five enzymes you found the pair that isolates the gene and avoided the band that only looked right.', 'Entre cinco enzimas has encontrado la pareja que aísla el gen y has evitado la banda que solo lo parecía.'),
    B('Careful choice of enzymes is a daily task in any laboratory that works with genes.', 'Elegir bien las enzimas es una tarea diaria en cualquier laboratorio que trabaje con genes.'),
    org('plasmid-map', 'DNA with a target gene', 'ADN con un gen objetivo', 'Cloning vector', B('A stretch of DNA with several cutting sites.', 'Un trozo de ADN con varios sitios de corte.'), ['Method'], tissue='nucleus', organelle='nucleus'), 'bacterium')

write_levels([tune_yogurt, tune_biogas, tune_pcr, tune_algae, build_sensor, build_lactase, build_pigment, pair_dna2, pair_rna2, pair_protein2, cut_lactase, cut_plasmid])
