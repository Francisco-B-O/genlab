import type { LevelData, LevelSummary } from '../types/level.types';
import type { BiologicalEdge, BiologicalNode } from '../types/biology.types';
import { validateLevelSchema } from './LevelSchema';
import { LevelValidator } from './LevelValidator';
import { BiologicalGraph } from '../biology/BiologicalGraph';
import { localize, type Language } from '../i18n';

// Static registry of available levels, in play order (add new levels here).
// Summaries are duplicated here so the menu can render without loading every level.
interface LevelIndexEntry {
  id: string;
  loader: () => Promise<unknown>;
  summary: Omit<LevelSummary, 'id' | 'order' | 'mode'> & { mode?: LevelSummary['mode'] } & Record<string, unknown>;
}

const LEVEL_REGISTRY: LevelIndexEntry[] = [
  {
    id: 'tutorial',
    loader: () => import('../data/levels/tutorial.json'),
    summary: {
      title: 'Lactose-free milk', title_es: 'Leche sin lactosa',
      subtitle: 'Learn how genes, enzymes and molecules fit together',
      subtitle_es: 'Aprende cómo encajan genes, enzimas y moléculas',
      organism: 'Kluyveromyces lactis',
      difficulty: 'beginner', isTutorial: true, estimatedDuration: 3, connections: 5, kind: 'milk',
    },
  },
  {
    id: 'fix-bread',
    loader: () => import('../data/levels/fix-bread.json'),
    summary: {
      title: 'The bread that did not rise', title_es: 'El pan que no sube',
      subtitle: 'Find the broken piece in the fermentation pathway',
      subtitle_es: 'Encuentra la pieza rota en la ruta de la fermentación',
      organism: 'Saccharomyces cerevisiae',
      difficulty: 'beginner', isTutorial: false, mode: 'diagnose', estimatedDuration: 5, connections: 0, kind: 'bread',
    },
  },
  {
    id: 'tune-dough',
    loader: () => import('../data/levels/tune-dough.json'),
    summary: {
      title: 'Tune the dough', title_es: 'Ajusta la masa',
      subtitle: 'Four settings, one loaf that rises',
      subtitle_es: 'Cuatro ajustes, un pan que sube',
      organism: 'Saccharomyces cerevisiae',
      difficulty: 'beginner', isTutorial: false, mode: 'tune', estimatedDuration: 5, connections: 0, kind: 'bread',
    },
  },
  {
    id: 'seq-bread',
    loader: () => import('../data/levels/seq-bread.json'),
    summary: {
      title: 'How bread is made', title_es: 'Cómo se hace el pan',
      subtitle: 'Each step prepares the next',
      subtitle_es: 'Cada paso prepara el siguiente',
      organism: 'Saccharomyces cerevisiae',
      difficulty: 'beginner', isTutorial: false, mode: 'sequence', estimatedDuration: 4, connections: 6, kind: 'bread',
    },
  },
  {
    id: 'cheese',
    loader: () => import('../data/levels/cheese.json'),
    summary: {
      title: 'Cheese without calves', title_es: 'Queso sin terneros',
      subtitle: 'Chymosin, the first GM ingredient approved for food',
      subtitle_es: 'La quimosina, el primer ingrediente transgénico aprobado',
      organism: 'Aspergillus niger',
      difficulty: 'beginner', isTutorial: false, estimatedDuration: 5, connections: 6, kind: 'cheese',
    },
  },
  {
    id: 'seq-yogurt',
    loader: () => import('../data/levels/seq-yogurt.json'),
    summary: {
      title: 'From milk to yogurt', title_es: 'De la leche al yogur',
      subtitle: 'Bacteria that thicken milk',
      subtitle_es: 'Bacterias que espesan la leche',
      organism: 'Lactobacillus delbrueckii + Streptococcus thermophilus',
      difficulty: 'beginner', isTutorial: false, mode: 'sequence', estimatedDuration: 5, connections: 6, kind: 'milk',
    },
  },
  {
    id: 'tune-yogurt',
    loader: () => import('../data/levels/tune-yogurt.json'),
    summary: {
      title: 'Tune the yogurt', title_es: 'Ajusta el yogur',
      subtitle: 'Warm enough, not too hot',
      subtitle_es: 'Templado, pero no demasiado',
      organism: 'Lactobacillus delbrueckii',
      difficulty: 'beginner', isTutorial: false, mode: 'tune', estimatedDuration: 5, connections: 0, kind: 'milk',
    },
  },
  {
    id: 'fix-yogurt',
    loader: () => import('../data/levels/fix-yogurt.json'),
    summary: {
      title: 'The yogurt that did not set', title_es: 'El yogur que no cuajó',
      subtitle: 'A jar in the fridge',
      subtitle_es: 'Un tarro en la nevera',
      organism: 'Lactobacillus delbrueckii',
      difficulty: 'beginner', isTutorial: false, mode: 'diagnose', estimatedDuration: 5, connections: 0, kind: 'milk',
    },
  },
  {
    id: 'seq-pasteur',
    loader: () => import('../data/levels/seq-pasteur.json'),
    summary: {
      title: 'The swan-neck flask', title_es: 'El matraz de cuello de cisne',
      subtitle: 'Where do microbes come from?',
      subtitle_es: '¿De dónde salen los microbios?',
      organism: 'Spontaneous generation',
      difficulty: 'beginner', isTutorial: false, mode: 'sequence', estimatedDuration: 5, connections: 6, kind: 'flask',
    },
  },
  {
    id: 'seq-beer',
    loader: () => import('../data/levels/seq-beer.json'),
    summary: {
      title: 'How beer is made', title_es: 'Cómo se hace la cerveza',
      subtitle: 'From barley to a fizzy drink',
      subtitle_es: 'De la cebada a una bebida con burbujas',
      organism: 'Saccharomyces cerevisiae',
      difficulty: 'beginner', isTutorial: false, mode: 'sequence', estimatedDuration: 5, connections: 7, kind: 'wheat',
    },
  },
  {
    id: 'tune-sourdough',
    loader: () => import('../data/levels/tune-sourdough.json'),
    summary: {
      title: 'Tune the sourdough', title_es: 'Ajusta la masa madre',
      subtitle: 'A living starter',
      subtitle_es: 'Un cultivo vivo',
      organism: 'Yeast and lactic acid bacteria',
      difficulty: 'beginner', isTutorial: false, mode: 'tune', estimatedDuration: 5, connections: 0, kind: 'bread',
    },
  },
  {
    id: 'seq-wine',
    loader: () => import('../data/levels/seq-wine.json'),
    summary: {
      title: 'From grapes to red wine', title_es: 'De la uva al vino tinto',
      subtitle: 'Yeast does the middle of the work',
      subtitle_es: 'La levadura hace la parte central del trabajo',
      organism: 'Saccharomyces cerevisiae',
      difficulty: 'beginner', isTutorial: false, mode: 'sequence', estimatedDuration: 5, connections: 7, kind: 'bottle',
    },
  },
  {
    id: 'fix-sourdough',
    loader: () => import('../data/levels/fix-sourdough.json'),
    summary: {
      title: 'The starter that does not rise', title_es: 'La masa madre que no sube',
      subtitle: 'A jar forgotten in the fridge',
      subtitle_es: 'Un tarro olvidado en la nevera',
      organism: 'Yeast and lactic acid bacteria',
      difficulty: 'beginner', isTutorial: false, mode: 'diagnose', estimatedDuration: 5, connections: 0, kind: 'bread',
    },
  },
  {
    id: 'inh-peas',
    loader: () => import('../data/levels/inh-peas.json'),
    summary: {
      title: 'The peas that started genetics', title_es: 'Los guisantes que empezaron la genética',
      subtitle: 'One dominant allele, one hidden',
      subtitle_es: 'Un alelo dominante y otro escondido',
      organism: 'Pisum sativum',
      difficulty: 'beginner', isTutorial: false, mode: 'inherit', estimatedDuration: 5, connections: 3, kind: 'plant',
    },
  },
  {
    id: 'inh-corn',
    loader: () => import('../data/levels/inh-corn.json'),
    summary: {
      title: 'Sweet corn or starchy corn', title_es: 'Maíz dulce o maíz harinoso',
      subtitle: 'A hidden recessive allele',
      subtitle_es: 'Un alelo recesivo escondido',
      organism: 'Zea mays',
      difficulty: 'beginner', isTutorial: false, mode: 'inherit', estimatedDuration: 5, connections: 3, kind: 'wheat',
    },
  },
  {
    id: 'inh-dogs',
    loader: () => import('../data/levels/inh-dogs.json'),
    summary: {
      title: 'Short coat or long coat', title_es: 'Pelo corto o pelo largo',
      subtitle: 'Dogs and a recessive allele',
      subtitle_es: 'Perros y un alelo recesivo',
      organism: 'Canis familiaris',
      difficulty: 'beginner', isTutorial: false, mode: 'inherit', estimatedDuration: 5, connections: 3, kind: 'dna',
    },
  },
  {
    id: 'inh-pea-height',
    loader: () => import('../data/levels/inh-pea-height.json'),
    summary: {
      title: 'Tall peas and dwarf peas', title_es: 'Guisantes altos y guisantes enanos',
      subtitle: 'Mendel\'s count: 787 to 277',
      subtitle_es: 'El recuento de Mendel: 787 a 277',
      organism: 'Pisum sativum',
      difficulty: 'beginner', isTutorial: false, mode: 'inherit', estimatedDuration: 5, connections: 3, kind: 'plant',
    },
  },
  {
    id: 'inh-polled',
    loader: () => import('../data/levels/inh-polled.json'),
    summary: {
      title: 'Cattle without horns', title_es: 'Vacas sin cuernos',
      subtitle: 'A dominant allele that farmers look for',
      subtitle_es: 'Un alelo dominante que buscan los ganaderos',
      organism: 'Bos taurus',
      difficulty: 'beginner', isTutorial: false, mode: 'inherit', estimatedDuration: 5, connections: 3, kind: 'cheese',
    },
  },
  {
    id: 'inh-tomato',
    loader: () => import('../data/levels/inh-tomato.json'),
    summary: {
      title: 'Red tomatoes and yellow tomatoes', title_es: 'Tomates rojos y tomates amarillos',
      subtitle: 'A recessive allele that stops the red',
      subtitle_es: 'Un alelo recesivo que impide el rojo',
      organism: 'Solanum lycopersicum',
      difficulty: 'beginner', isTutorial: false, mode: 'inherit', estimatedDuration: 5, connections: 3, kind: 'tomato',
    },
  },
  {
    id: 'inh-earwax',
    loader: () => import('../data/levels/inh-earwax.json'),
    summary: {
      title: 'Wet or dry earwax', title_es: 'Cera de oído húmeda o seca',
      subtitle: 'A trait you can check on yourself',
      subtitle_es: 'Un rasgo que puedes comprobar en ti',
      organism: 'Homo sapiens',
      difficulty: 'beginner', isTutorial: false, mode: 'inherit', estimatedDuration: 5, connections: 3, kind: 'cell',
    },
  },
  {
    id: 'pair-dna',
    loader: () => import('../data/levels/pair-dna.json'),
    summary: {
      title: 'The two strands of DNA', title_es: 'Las dos hebras del ADN',
      subtitle: 'Every base has a partner',
      subtitle_es: 'Cada base tiene su pareja',
      organism: 'Deoxyribonucleic acid',
      difficulty: 'beginner', isTutorial: false, mode: 'pairing', estimatedDuration: 4, connections: 8, kind: 'dna',
    },
  },
  {
    id: 'pair-dna-2',
    loader: () => import('../data/levels/pair-dna-2.json'),
    summary: {
      title: 'A longer strand', title_es: 'Una hebra más larga',
      subtitle: 'Fourteen letters to pair',
      subtitle_es: 'Catorce letras que emparejar',
      organism: 'Nucleic acids',
      difficulty: 'beginner', isTutorial: false, mode: 'pairing', estimatedDuration: 5, connections: 14, kind: 'dna',
    },
  },
  {
    id: 'pair-rna',
    loader: () => import('../data/levels/pair-rna.json'),
    summary: {
      title: 'From DNA to a message', title_es: 'De ADN a mensaje',
      subtitle: 'Copying a gene into RNA',
      subtitle_es: 'Copiar un gen en ARN',
      organism: 'Ribonucleic acid',
      difficulty: 'beginner', isTutorial: false, mode: 'pairing', estimatedDuration: 5, connections: 12, kind: 'dna',
    },
  },
  {
    id: 'pair-rna-2',
    loader: () => import('../data/levels/pair-rna-2.json'),
    summary: {
      title: 'Copy a longer message', title_es: 'Copia un mensaje más largo',
      subtitle: 'Fifteen letters into RNA',
      subtitle_es: 'Quince letras a ARN',
      organism: 'Nucleic acids',
      difficulty: 'beginner', isTutorial: false, mode: 'pairing', estimatedDuration: 5, connections: 15, kind: 'dna',
    },
  },
  {
    id: 'mut-hbb',
    loader: () => import('../data/levels/mut-hbb.json'),
    summary: {
      title: 'One letter in haemoglobin', title_es: 'Una letra en la hemoglobina',
      subtitle: 'Find the change behind sickle cell disease',
      subtitle_es: 'Encuentra el cambio que está detrás de la anemia falciforme',
      organism: 'Homo sapiens',
      difficulty: 'beginner', isTutorial: false, mode: 'mutation', estimatedDuration: 5, connections: 0, kind: 'dna',
    },
  },
  {
    id: 'mut-flower',
    loader: () => import('../data/levels/mut-flower.json'),
    summary: {
      title: 'A white petunia', title_es: 'Una petunia blanca',
      subtitle: 'One letter, one amino acid',
      subtitle_es: 'Una letra, un aminoácido',
      organism: 'Petunia × hybrida',
      difficulty: 'beginner', isTutorial: false, mode: 'mutation', estimatedDuration: 4, connections: 0, kind: 'flower',
    },
  },
  {
    id: 'mut-silent',
    loader: () => import('../data/levels/mut-silent.json'),
    summary: {
      title: 'A letter that changes nothing', title_es: 'Una letra que no cambia nada',
      subtitle: 'Some mutations are silent',
      subtitle_es: 'Algunas mutaciones son silenciosas',
      organism: 'Illustrative example',
      difficulty: 'beginner', isTutorial: false, mode: 'mutation', estimatedDuration: 4, connections: 0, kind: 'dna',
    },
  },
  {
    id: 'mut-pepper',
    loader: () => import('../data/levels/mut-pepper.json'),
    summary: {
      title: 'A pepper that stays red', title_es: 'Un pimiento que sigue rojo',
      subtitle: 'A change that changes nothing',
      subtitle_es: 'Un cambio que no cambia nada',
      organism: 'Capsicum annuum',
      difficulty: 'beginner', isTutorial: false, mode: 'mutation', estimatedDuration: 4, connections: 0, kind: 'tomato',
    },
  },
  {
    id: 'cut-gfp',
    loader: () => import('../data/levels/cut-gfp.json'),
    summary: {
      title: 'Scissors for a glowing gene', title_es: 'Tijeras para un gen que brilla',
      subtitle: 'Cutting DNA exactly where it matters',
      subtitle_es: 'Cortar el ADN justo donde importa',
      organism: 'Aequorea victoria',
      difficulty: 'beginner', isTutorial: false, mode: 'cut', estimatedDuration: 5, connections: 0, kind: 'jellyfish',
    },
  },
  {
    id: 'build-glow',
    loader: () => import('../data/levels/build-glow.json'),
    summary: {
      title: 'An on/off switch for light', title_es: 'Un interruptor de luz',
      subtitle: 'Assemble the DNA that makes bacteria glow on demand',
      subtitle_es: 'Monta el ADN que hace brillar a las bacterias cuando tú quieras',
      organism: 'Escherichia coli',
      difficulty: 'beginner', isTutorial: false, mode: 'construct', estimatedDuration: 4, connections: 4, kind: 'jellyfish',
    },
  },
  {
    id: 'insulin',
    loader: () => import('../data/levels/insulin.json'),
    summary: {
      title: 'Insulin from bacteria', title_es: 'Insulina en bacterias',
      subtitle: 'The first medicine made by genetic engineering',
      subtitle_es: 'El primer medicamento de la ingeniería genética',
      organism: 'Escherichia coli',
      difficulty: 'beginner', isTutorial: false, estimatedDuration: 5, connections: 5, kind: 'bacterium',
    },
  },
  {
    id: 'seq-pcr',
    loader: () => import('../data/levels/seq-pcr.json'),
    summary: {
      title: 'Copying DNA with PCR', title_es: 'Copiar ADN con la PCR',
      subtitle: 'Put the three temperatures of the cycle in the right order',
      subtitle_es: 'Pon en orden las tres temperaturas del ciclo',
      organism: 'Laboratory technique',
      difficulty: 'beginner', isTutorial: false, mode: 'sequence', estimatedDuration: 5, connections: 6, kind: 'dna',
    },
  },
  {
    id: 'gfp',
    loader: () => import('../data/levels/gfp.json'),
    summary: {
      title: 'Glowing bacteria', title_es: 'Bacterias que brillan',
      subtitle: 'A jellyfish gene that lights up cells',
      subtitle_es: 'Un gen de medusa que ilumina células',
      organism: 'Escherichia coli + Aequorea victoria',
      difficulty: 'beginner', isTutorial: false, estimatedDuration: 6, connections: 6, kind: 'jellyfish',
    },
  },
  {
    id: 'fix-gfp',
    loader: () => import('../data/levels/fix-gfp.json'),
    summary: {
      title: 'Colonies that do not glow', title_es: 'Colonias que no brillan',
      subtitle: 'The gene is fine, but is it on?',
      subtitle_es: 'El gen está bien, pero ¿está encendido?',
      organism: 'Escherichia coli',
      difficulty: 'beginner', isTutorial: false, mode: 'diagnose', estimatedDuration: 5, connections: 0, kind: 'bacterium',
    },
  },
  {
    id: 'build-sensor',
    loader: () => import('../data/levels/build-sensor.json'),
    summary: {
      title: 'Bacteria that warn you', title_es: 'Bacterias que avisan',
      subtitle: 'A switch that listens for sugar',
      subtitle_es: 'Un interruptor que escucha el azúcar',
      organism: 'Escherichia coli',
      difficulty: 'beginner', isTutorial: false, mode: 'construct', estimatedDuration: 5, connections: 4, kind: 'bacterium',
    },
  },
  {
    id: 'ice-minus',
    loader: () => import('../data/levels/ice-minus.json'),
    summary: {
      title: 'Bacteria against frost', title_es: 'Bacterias contra la helada',
      subtitle: 'Ice that begins on a leaf',
      subtitle_es: 'Hielo que empieza en una hoja',
      organism: 'Pseudomonas syringae',
      difficulty: 'beginner', isTutorial: false, estimatedDuration: 6, connections: 5, kind: 'plant',
    },
  },
  {
    id: 'asm-1',
    loader: () => import('../data/levels/asm-1.json'),
    summary: {
      title: 'A gene in three pieces', title_es: 'Un gen en tres trozos',
      subtitle: 'Pieces that overlap',
      subtitle_es: 'Trozos que se solapan',
      organism: 'Genome assembly',
      difficulty: 'beginner', isTutorial: false, mode: 'assemble', estimatedDuration: 4, connections: 0, kind: 'dna',
    },
  },
  {
    id: 'asm-2',
    loader: () => import('../data/levels/asm-2.json'),
    summary: {
      title: 'A longer gene', title_es: 'Un gen más largo',
      subtitle: 'Five pieces to chain',
      subtitle_es: 'Cinco trozos que encadenar',
      organism: 'Genome assembly',
      difficulty: 'beginner', isTutorial: false, mode: 'assemble', estimatedDuration: 5, connections: 0, kind: 'dna',
    },
  },
  {
    id: 'pair-barcode',
    loader: () => import('../data/levels/pair-barcode.json'),
    summary: {
      title: 'A barcode for fish', title_es: 'Un código de barras para pescado',
      subtitle: 'Fifteen letters of a barcode gene',
      subtitle_es: 'Quince letras de un gen código de barras',
      organism: 'Nucleic acids',
      difficulty: 'beginner', isTutorial: false, mode: 'pairing', estimatedDuration: 5, connections: 15, kind: 'dna',
    },
  },
  {
    id: 'build-banana',
    loader: () => import('../data/levels/build-banana.json'),
    summary: {
      title: 'Bacteria that smell of banana', title_es: 'Bacterias con olor a plátano',
      subtitle: 'A scent factory: choose the right DNA parts',
      subtitle_es: 'Una fábrica de aromas: elige las piezas de ADN correctas',
      organism: 'Escherichia coli',
      difficulty: 'beginner', isTutorial: false, mode: 'construct', estimatedDuration: 5, connections: 4, kind: 'banana',
    },
  },
  {
    id: 'crispr-1',
    loader: () => import('../data/levels/crispr-1.json'),
    summary: {
      title: 'A guide for Cas9', title_es: 'Una guía para Cas9',
      subtitle: 'Cut where you mean to',
      subtitle_es: 'Cortar justo donde quieres',
      organism: 'Cas9 target',
      difficulty: 'beginner', isTutorial: false, mode: 'crispr', estimatedDuration: 5, connections: 0, kind: 'dna',
    },
  },
  {
    id: 'crispr-2',
    loader: () => import('../data/levels/crispr-2.json'),
    summary: {
      title: 'The PAM matters', title_es: 'El PAM importa',
      subtitle: 'A match is not enough',
      subtitle_es: 'Coincidir no basta',
      organism: 'Cas9 target',
      difficulty: 'beginner', isTutorial: false, mode: 'crispr', estimatedDuration: 6, connections: 0, kind: 'dna',
    },
  },
  {
    id: 'glucose-strip',
    loader: () => import('../data/levels/glucose-strip.json'),
    summary: {
      title: 'Measuring blood sugar', title_es: 'Medir el azúcar en sangre',
      subtitle: 'Two enzymes that turn glucose into a colour',
      subtitle_es: 'Dos enzimas que convierten la glucosa en un color',
      organism: 'Aspergillus niger',
      difficulty: 'beginner', isTutorial: false, estimatedDuration: 6, connections: 11, kind: 'strip',
    },
  },
  {
    id: 'veggie-burger',
    loader: () => import('../data/levels/veggie-burger.json'),
    summary: {
      title: 'A burger that bleeds', title_es: 'Una hamburguesa que sangra',
      subtitle: 'The molecule that makes meat taste like meat',
      subtitle_es: 'La molécula que hace que la carne sepa a carne',
      organism: 'Komagataella phaffii',
      difficulty: 'beginner', isTutorial: false, estimatedDuration: 6, connections: 10, kind: 'burger',
    },
  },
  {
    id: 'browning',
    loader: () => import('../data/levels/browning.json'),
    summary: {
      title: 'Why a cut apple turns brown', title_es: 'Por qué se pone marrón una manzana cortada',
      subtitle: 'An enzyme, a gas and a snack',
      subtitle_es: 'Una enzima, un gas y una merienda',
      organism: 'Malus domestica',
      difficulty: 'beginner', isTutorial: false, estimatedDuration: 6, connections: 6, kind: 'plant',
    },
  },
  {
    id: 'denim',
    loader: () => import('../data/levels/denim.json'),
    summary: {
      title: 'Soft, faded jeans', title_es: 'Vaqueros suaves y desgastados',
      subtitle: 'An enzyme from a fungus does the washing',
      subtitle_es: 'Una enzima de un hongo hace el lavado',
      organism: 'Trichoderma reesei',
      difficulty: 'beginner', isTutorial: false, estimatedDuration: 6, connections: 5, kind: 'jeans',
    },
  },
  {
    id: 'detergent',
    loader: () => import('../data/levels/detergent.json'),
    summary: {
      title: 'Enzymes in the washing machine', title_es: 'Enzimas en la lavadora',
      subtitle: 'Two enzymes that eat stains at low temperature',
      subtitle_es: 'Dos enzimas que se comen las manchas en agua fría',
      organism: 'Bacillus licheniformis',
      difficulty: 'beginner', isTutorial: false, estimatedDuration: 5, connections: 10, kind: 'shirt',
    },
  },
  {
    id: 'seq-factory',
    loader: () => import('../data/levels/seq-factory.json'),
    summary: {
      title: 'From a gene to a product', title_es: 'De un gen a un producto',
      subtitle: 'The steps of a protein factory, in order',
      subtitle_es: 'Los pasos de una fábrica de proteínas, en orden',
      organism: 'Escherichia coli',
      difficulty: 'beginner', isTutorial: false, mode: 'sequence', estimatedDuration: 5, connections: 6, kind: 'flask',
    },
  },
  {
    id: 'yogurt',
    loader: () => import('../data/levels/yogurt.json'),
    summary: {
      title: 'The microbes inside yogurt', title_es: 'Los microbios del yogur',
      subtitle: 'From lactose to lactic acid',
      subtitle_es: 'De la lactosa al ácido láctico',
      organism: 'Lactobacillus delbrueckii subsp. bulgaricus',
      difficulty: 'intermediate', isTutorial: false, estimatedDuration: 9, connections: 9, kind: 'milk',
    },
  },
  {
    id: 'kimchi',
    loader: () => import('../data/levels/kimchi.json'),
    summary: {
      title: 'Kimchi and sauerkraut', title_es: 'Kimchi y chucrut',
      subtitle: 'Bacteria that sour a cabbage on purpose',
      subtitle_es: 'Bacterias que agrian una col a propósito',
      organism: 'Leuconostoc mesenteroides',
      difficulty: 'intermediate', isTutorial: false, estimatedDuration: 6, connections: 5, kind: 'plant',
    },
  },
  {
    id: 'cocoa',
    loader: () => import('../data/levels/cocoa.json'),
    summary: {
      title: 'How cocoa beans learn to taste of chocolate', title_es: 'Cómo aprenden a saber a chocolate los granos de cacao',
      subtitle: 'A team of microbes in a heap of pulp',
      subtitle_es: 'Un equipo de microbios en un montón de pulpa',
      organism: 'Theobroma cacao',
      difficulty: 'intermediate', isTutorial: false, estimatedDuration: 9, connections: 10, kind: 'plant',
    },
  },
  {
    id: 'tune-kimchi',
    loader: () => import('../data/levels/tune-kimchi.json'),
    summary: {
      title: 'Tune the kimchi', title_es: 'Ajusta el kimchi',
      subtitle: 'Salt, temperature, time and brine',
      subtitle_es: 'Sal, temperatura, tiempo y salmuera',
      organism: 'Leuconostoc mesenteroides',
      difficulty: 'intermediate', isTutorial: false, mode: 'tune', estimatedDuration: 6, connections: 0, kind: 'plant',
    },
  },
  {
    id: 'tune-cheese',
    loader: () => import('../data/levels/tune-cheese.json'),
    summary: {
      title: 'Tune the dairy', title_es: 'Ajusta la quesería',
      subtitle: 'Temperature, rennet, waiting and cutting',
      subtitle_es: 'Temperatura, cuajo, espera y corte',
      organism: 'Bos taurus',
      difficulty: 'intermediate', isTutorial: false, mode: 'tune', estimatedDuration: 7, connections: 0, kind: 'cheese',
    },
  },
  {
    id: 'beer',
    loader: () => import('../data/levels/beer.json'),
    summary: {
      title: 'From barley to beer', title_es: 'De la cebada a la cerveza',
      subtitle: 'Two chains of enzymes in a row',
      subtitle_es: 'Dos cadenas de enzimas seguidas',
      organism: 'Saccharomyces cerevisiae',
      difficulty: 'intermediate', isTutorial: false, estimatedDuration: 8, connections: 9, kind: 'wheat',
    },
  },
  {
    id: 'tune-beer',
    loader: () => import('../data/levels/tune-beer.json'),
    summary: {
      title: 'Tune the brewery', title_es: 'Ajusta la cervecería',
      subtitle: 'Strength, temperature, yeast and time',
      subtitle_es: 'Fuerza, temperatura, levadura y tiempo',
      organism: 'Saccharomyces cerevisiae',
      difficulty: 'intermediate', isTutorial: false, mode: 'tune', estimatedDuration: 6, connections: 0, kind: 'wheat',
    },
  },
  {
    id: 'fix-beer',
    loader: () => import('../data/levels/fix-beer.json'),
    summary: {
      title: 'The fermentation that stopped', title_es: 'La fermentación que se paró',
      subtitle: 'Sugar left, yeast tired',
      subtitle_es: 'Queda azúcar, la levadura está cansada',
      organism: 'Saccharomyces cerevisiae',
      difficulty: 'intermediate', isTutorial: false, mode: 'diagnose', estimatedDuration: 6, connections: 0, kind: 'wheat',
    },
  },
  {
    id: 'inh-snapdragon',
    loader: () => import('../data/levels/inh-snapdragon.json'),
    summary: {
      title: 'Pink flowers from red and white', title_es: 'Flores rosas de rojas y blancas',
      subtitle: 'When neither allele wins',
      subtitle_es: 'Cuando ningún alelo gana',
      organism: 'Antirrhinum majus',
      difficulty: 'intermediate', isTutorial: false, mode: 'inherit', estimatedDuration: 6, connections: 3, kind: 'flower',
    },
  },
  {
    id: 'inh-siamese',
    loader: () => import('../data/levels/inh-siamese.json'),
    summary: {
      title: 'Why Siamese cats have dark paws', title_es: 'Por qué los gatos siameses tienen las patas oscuras',
      subtitle: 'A recessive allele that likes the cold',
      subtitle_es: 'Un alelo recesivo al que le gusta el frío',
      organism: 'Felis catus',
      difficulty: 'intermediate', isTutorial: false, mode: 'inherit', estimatedDuration: 6, connections: 3, kind: 'cell',
    },
  },
  {
    id: 'inh-palomino',
    loader: () => import('../data/levels/inh-palomino.json'),
    summary: {
      title: 'Palomino horses', title_es: 'Caballos palominos',
      subtitle: 'Two copies, three colours',
      subtitle_es: 'Dos copias, tres colores',
      organism: 'Equus caballus',
      difficulty: 'intermediate', isTutorial: false, mode: 'inherit', estimatedDuration: 6, connections: 3, kind: 'cell',
    },
  },
  {
    id: 'inh-flies',
    loader: () => import('../data/levels/inh-flies.json'),
    summary: {
      title: 'White-eyed flies', title_es: 'Moscas de ojos blancos',
      subtitle: 'The fly that showed that genes sit on chromosomes',
      subtitle_es: 'La mosca que demostró que los genes están en los cromosomas',
      organism: 'Drosophila melanogaster',
      difficulty: 'intermediate', isTutorial: false, mode: 'inherit', estimatedDuration: 7, connections: 3, kind: 'flask',
    },
  },
  {
    id: 'inh-blood',
    loader: () => import('../data/levels/inh-blood.json'),
    summary: {
      title: 'How blood groups are inherited', title_es: 'Cómo se heredan los grupos sanguíneos',
      subtitle: 'Three alleles, four groups',
      subtitle_es: 'Tres alelos, cuatro grupos',
      organism: 'Homo sapiens',
      difficulty: 'intermediate', isTutorial: false, mode: 'inherit', estimatedDuration: 8, connections: 3, kind: 'blood',
    },
  },
  {
    id: 'seq-translation',
    loader: () => import('../data/levels/seq-translation.json'),
    summary: {
      title: 'How a gene is read', title_es: 'Cómo se lee un gen',
      subtitle: 'From DNA to protein, step by step',
      subtitle_es: 'Del ADN a la proteína, paso a paso',
      organism: 'Gene expression',
      difficulty: 'intermediate', isTutorial: false, mode: 'sequence', estimatedDuration: 5, connections: 6, kind: 'dna',
    },
  },
  {
    id: 'pair-protein',
    loader: () => import('../data/levels/pair-protein.json'),
    summary: {
      title: 'From a message to a protein', title_es: 'Del mensaje a la proteína',
      subtitle: 'Reading the genetic code',
      subtitle_es: 'Leer el código genético',
      organism: 'Translation',
      difficulty: 'intermediate', isTutorial: false, mode: 'pairing', estimatedDuration: 6, connections: 6, kind: 'dna',
    },
  },
  {
    id: 'seq-hershey',
    loader: () => import('../data/levels/seq-hershey.json'),
    summary: {
      title: 'DNA or protein?', title_es: '¿ADN o proteína?',
      subtitle: 'The blender experiment of 1952',
      subtitle_es: 'El experimento de la batidora de 1952',
      organism: 'Bacteriophage T2',
      difficulty: 'intermediate', isTutorial: false, mode: 'sequence', estimatedDuration: 6, connections: 6, kind: 'dna',
    },
  },
  {
    id: 'seq-meselson',
    loader: () => import('../data/levels/seq-meselson.json'),
    summary: {
      title: 'How DNA copies itself', title_es: 'Cómo se copia el ADN',
      subtitle: 'The heavy nitrogen experiment of 1958',
      subtitle_es: 'El experimento del nitrógeno pesado de 1958',
      organism: 'Escherichia coli',
      difficulty: 'intermediate', isTutorial: false, mode: 'sequence', estimatedDuration: 7, connections: 7, kind: 'dna',
    },
  },
  {
    id: 'pair-gfp',
    loader: () => import('../data/levels/pair-gfp.json'),
    summary: {
      title: 'The first words of a glowing protein', title_es: 'Las primeras palabras de una proteína que brilla',
      subtitle: 'Eight codons of the jellyfish protein',
      subtitle_es: 'Ocho codones de la proteína de medusa',
      organism: 'Nucleic acids',
      difficulty: 'intermediate', isTutorial: false, mode: 'pairing', estimatedDuration: 6, connections: 9, kind: 'dna',
    },
  },
  {
    id: 'pair-protein-2',
    loader: () => import('../data/levels/pair-protein-2.json'),
    summary: {
      title: 'Another protein', title_es: 'Otra proteína',
      subtitle: 'Five codons and a stop',
      subtitle_es: 'Cinco codones y una parada',
      organism: 'Nucleic acids',
      difficulty: 'intermediate', isTutorial: false, mode: 'pairing', estimatedDuration: 6, connections: 5, kind: 'dna',
    },
  },
  {
    id: 'mut-stop',
    loader: () => import('../data/levels/mut-stop.json'),
    summary: {
      title: 'A letter that stops the protein', title_es: 'Una letra que detiene la proteína',
      subtitle: 'The most drastic single change',
      subtitle_es: 'El cambio de una letra más drástico',
      organism: 'Illustrative example',
      difficulty: 'intermediate', isTutorial: false, mode: 'mutation', estimatedDuration: 4, connections: 0, kind: 'dna',
    },
  },
  {
    id: 'mut-rice',
    loader: () => import('../data/levels/mut-rice.json'),
    summary: {
      title: 'Fragrant rice', title_es: 'Arroz aromático',
      subtitle: 'Switching off a gene gives a scent',
      subtitle_es: 'Apagar un gen da un aroma',
      organism: 'Oryza sativa',
      difficulty: 'intermediate', isTutorial: false, mode: 'mutation', estimatedDuration: 5, connections: 0, kind: 'grain',
    },
  },
  {
    id: 'mut-gfp65',
    loader: () => import('../data/levels/mut-gfp65.json'),
    summary: {
      title: 'A brighter jellyfish protein', title_es: 'Una proteína de medusa más brillante',
      subtitle: 'One amino acid, a better glow',
      subtitle_es: 'Un aminoácido, mejor brillo',
      organism: 'Aequorea victoria',
      difficulty: 'intermediate', isTutorial: false, mode: 'mutation', estimatedDuration: 5, connections: 0, kind: 'jellyfish',
    },
  },
  {
    id: 'mut-bitter',
    loader: () => import('../data/levels/mut-bitter.json'),
    summary: {
      title: 'Why broccoli tastes bitter to some', title_es: 'Por qué el brócoli sabe amargo a algunos',
      subtitle: 'A swap in a taste receptor',
      subtitle_es: 'Un cambio en un receptor del gusto',
      organism: 'Homo sapiens',
      difficulty: 'intermediate', isTutorial: false, mode: 'mutation', estimatedDuration: 5, connections: 0, kind: 'plant',
    },
  },
  {
    id: 'mut-mc1r',
    loader: () => import('../data/levels/mut-mc1r.json'),
    summary: {
      title: 'The gene behind red hair', title_es: 'El gen del pelo rojo',
      subtitle: 'A swap that turns the pigment down',
      subtitle_es: 'Un cambio que baja el pigmento',
      organism: 'Homo sapiens',
      difficulty: 'intermediate', isTutorial: false, mode: 'mutation', estimatedDuration: 5, connections: 0, kind: 'cell',
    },
  },
  {
    id: 'mut-tiger',
    loader: () => import('../data/levels/mut-tiger.json'),
    summary: {
      title: 'Why some tigers are white', title_es: 'Por qué algunos tigres son blancos',
      subtitle: 'A swap in a pigment transporter',
      subtitle_es: 'Un cambio en un transportador de pigmento',
      organism: 'Panthera tigris',
      difficulty: 'intermediate', isTutorial: false, mode: 'mutation', estimatedDuration: 5, connections: 0, kind: 'cell',
    },
  },
  {
    id: 'mut-dogfur',
    loader: () => import('../data/levels/mut-dogfur.json'),
    summary: {
      title: 'Why some dogs have long hair', title_es: 'Por qué algunos perros tienen el pelo largo',
      subtitle: 'A swap in a hair growth gene',
      subtitle_es: 'Un cambio en un gen del crecimiento del pelo',
      organism: 'Canis lupus familiaris',
      difficulty: 'intermediate', isTutorial: false, mode: 'mutation', estimatedDuration: 5, connections: 0, kind: 'cell',
    },
  },
  {
    id: 'mut-muscle',
    loader: () => import('../data/levels/mut-muscle.json'),
    summary: {
      title: 'Cattle with double muscle', title_es: 'Vacas de doble músculo',
      subtitle: 'A swap in the brake of muscle growth',
      subtitle_es: 'Un cambio en el freno del crecimiento muscular',
      organism: 'Bos taurus',
      difficulty: 'intermediate', isTutorial: false, mode: 'mutation', estimatedDuration: 5, connections: 0, kind: 'cell',
    },
  },
  {
    id: 'mut-apple',
    loader: () => import('../data/levels/mut-apple.json'),
    summary: {
      title: 'An apple that does not brown', title_es: 'Una manzana que no se oscurece',
      subtitle: 'A letter that cuts the protein short',
      subtitle_es: 'Una letra que corta la proteína',
      organism: 'Malus domestica',
      difficulty: 'intermediate', isTutorial: false, mode: 'mutation', estimatedDuration: 4, connections: 0, kind: 'tomato',
    },
  },
  {
    id: 'cut-insulin',
    loader: () => import('../data/levels/cut-insulin.json'),
    summary: {
      title: 'Cutting out the insulin gene', title_es: 'Recortar el gen de la insulina',
      subtitle: 'Same size, different piece',
      subtitle_es: 'Mismo tamaño, otro trozo',
      organism: 'Homo sapiens',
      difficulty: 'intermediate', isTutorial: false, mode: 'cut', estimatedDuration: 6, connections: 0, kind: 'dna',
    },
  },
  {
    id: 'cut-lactase',
    loader: () => import('../data/levels/cut-lactase.json'),
    summary: {
      title: 'One scissors or two?', title_es: '¿Unas tijeras o dos?',
      subtitle: 'Sometimes one enzyme is enough',
      subtitle_es: 'A veces basta una enzima',
      organism: 'Kluyveromyces lactis',
      difficulty: 'intermediate', isTutorial: false, mode: 'cut', estimatedDuration: 6, connections: 0, kind: 'milk',
    },
  },
  {
    id: 'seq-plasmid',
    loader: () => import('../data/levels/seq-plasmid.json'),
    summary: {
      title: 'Putting a gene into a bacterium', title_es: 'Meter un gen en una bacteria',
      subtitle: 'Cut, glue, transform, select',
      subtitle_es: 'Cortar, pegar, transformar, seleccionar',
      organism: 'Escherichia coli',
      difficulty: 'intermediate', isTutorial: false, mode: 'sequence', estimatedDuration: 6, connections: 6, kind: 'bacterium',
    },
  },
  {
    id: 'build-lactase',
    loader: () => import('../data/levels/build-lactase.json'),
    summary: {
      title: 'Yeast that makes lactase', title_es: 'Levadura que fabrica lactasa',
      subtitle: 'An enzyme that has to leave the cell',
      subtitle_es: 'Una enzima que tiene que salir de la célula',
      organism: 'Kluyveromyces lactis',
      difficulty: 'intermediate', isTutorial: false, mode: 'construct', estimatedDuration: 6, connections: 4, kind: 'yeast',
    },
  },
  {
    id: 'build-secretion',
    loader: () => import('../data/levels/build-secretion.json'),
    summary: {
      title: 'Yeast that sends the enzyme out', title_es: 'Levadura que suelta la enzima fuera',
      subtitle: 'Put a shipping label on the protein',
      subtitle_es: 'Ponle a la proteína una etiqueta de envío',
      organism: 'Saccharomyces cerevisiae',
      difficulty: 'intermediate', isTutorial: false, mode: 'construct', estimatedDuration: 6, connections: 4, kind: 'yeast',
    },
  },
  {
    id: 'seq-sanger',
    loader: () => import('../data/levels/seq-sanger.json'),
    summary: {
      title: 'Reading DNA letter by letter', title_es: 'Leer el ADN letra a letra',
      subtitle: 'The method of Sanger, 1977',
      subtitle_es: 'El método de Sanger, 1977',
      organism: 'Sanger sequencing',
      difficulty: 'intermediate', isTutorial: false, mode: 'sequence', estimatedDuration: 6, connections: 6, kind: 'dna',
    },
  },
  {
    id: 'cut-chymosin',
    loader: () => import('../data/levels/cut-chymosin.json'),
    summary: {
      title: 'Taking the rennet gene out', title_es: 'Sacar el gen del cuajo',
      subtitle: 'Two enzymes for one gene',
      subtitle_es: 'Dos enzimas para un gen',
      organism: 'Bos taurus',
      difficulty: 'intermediate', isTutorial: false, mode: 'cut', estimatedDuration: 7, connections: 0, kind: 'cheese',
    },
  },
  {
    id: 'build-rennet',
    loader: () => import('../data/levels/build-rennet.json'),
    summary: {
      title: 'Rennet made by microbes', title_es: 'Cuajo fabricado por microbios',
      subtitle: 'The calf gene, in a bacterium',
      subtitle_es: 'El gen del ternero, en una bacteria',
      organism: 'Escherichia coli',
      difficulty: 'intermediate', isTutorial: false, mode: 'construct', estimatedDuration: 7, connections: 4, kind: 'cheese',
    },
  },
  {
    id: 'tune-pcr',
    loader: () => import('../data/levels/tune-pcr.json'),
    summary: {
      title: 'Tune the PCR', title_es: 'Ajusta la PCR',
      subtitle: 'Copies without mistakes',
      subtitle_es: 'Copias sin errores',
      organism: 'Polymerase chain reaction',
      difficulty: 'intermediate', isTutorial: false, mode: 'tune', estimatedDuration: 7, connections: 0, kind: 'flask',
    },
  },
  {
    id: 'lac-operon',
    loader: () => import('../data/levels/lac-operon.json'),
    summary: {
      title: 'Blue colonies: the lac switch', title_es: 'Colonias azules: el interruptor lac',
      subtitle: 'A gene that switches itself on and off',
      subtitle_es: 'Un gen que se enciende y se apaga solo',
      organism: 'Escherichia coli',
      difficulty: 'intermediate', isTutorial: false, estimatedDuration: 9, connections: 7, kind: 'bacterium',
    },
  },
  {
    id: 'firefly',
    loader: () => import('../data/levels/firefly.json'),
    summary: {
      title: 'Cold light: the firefly', title_es: 'Luz fría: la luciérnaga',
      subtitle: 'An enzyme that makes light',
      subtitle_es: 'Una enzima que fabrica luz',
      organism: 'Photinus pyralis',
      difficulty: 'intermediate', isTutorial: false, estimatedDuration: 7, connections: 7, kind: 'jellyfish',
    },
  },
  {
    id: 'flavr-savr',
    loader: () => import('../data/levels/flavr-savr.json'),
    summary: {
      title: 'The tomato that lasts', title_es: 'El tomate que dura',
      subtitle: 'Switching off one enzyme to slow the softening',
      subtitle_es: 'Apagar una enzima para frenar el ablandamiento',
      organism: 'Solanum lycopersicum',
      difficulty: 'intermediate', isTutorial: false, estimatedDuration: 7, connections: 5, kind: 'tomato',
    },
  },
  {
    id: 'pair-primer',
    loader: () => import('../data/levels/pair-primer.json'),
    summary: {
      title: 'The primer that finds its place', title_es: 'El cebador que encuentra su sitio',
      subtitle: 'Sixteen letters to match a template',
      subtitle_es: 'Dieciséis letras para casar con un molde',
      organism: 'Nucleic acids',
      difficulty: 'intermediate', isTutorial: false, mode: 'pairing', estimatedDuration: 5, connections: 16, kind: 'dna',
    },
  },
  {
    id: 'petunia',
    loader: () => import('../data/levels/petunia.json'),
    summary: {
      title: 'A plant that glows', title_es: 'Una planta que brilla',
      subtitle: 'A mushroom\'s light inside a petunia',
      subtitle_es: 'La luz de una seta dentro de una petunia',
      organism: 'Petunia × atkinsiana',
      difficulty: 'intermediate', isTutorial: false, estimatedDuration: 10, connections: 13, kind: 'flower',
    },
  },
  {
    id: 'asm-3',
    loader: () => import('../data/levels/asm-3.json'),
    summary: {
      title: 'The repeat that fools you', title_es: 'El repetido que engaña',
      subtitle: 'Same letters, two places',
      subtitle_es: 'Mismas letras, dos sitios',
      organism: 'Genome assembly',
      difficulty: 'intermediate', isTutorial: false, mode: 'assemble', estimatedDuration: 7, connections: 0, kind: 'dna',
    },
  },
  {
    id: 'asm-4',
    loader: () => import('../data/levels/asm-4.json'),
    summary: {
      title: 'Reading a small genome', title_es: 'Leer un genoma pequeño',
      subtitle: 'Seven pieces, one repeat',
      subtitle_es: 'Siete trozos, un repetido',
      organism: 'Genome assembly',
      difficulty: 'intermediate', isTutorial: false, mode: 'assemble', estimatedDuration: 9, connections: 0, kind: 'dna',
    },
  },
  {
    id: 'golden-rice',
    loader: () => import('../data/levels/golden-rice.json'),
    summary: {
      title: 'Golden Rice', title_es: 'Arroz Dorado',
      subtitle: 'Provitamin A in the rice grain',
      subtitle_es: 'Provitamina A en el grano de arroz',
      organism: 'Oryza sativa',
      difficulty: 'intermediate', isTutorial: false, estimatedDuration: 12, connections: 13, kind: 'grain',
    },
  },
  {
    id: 'purple-tomato',
    loader: () => import('../data/levels/purple-tomato.json'),
    summary: {
      title: 'Purple tomato', title_es: 'Tomate morado',
      subtitle: 'Two snapdragon genes that switch on a whole pathway',
      subtitle_es: 'Dos genes de boca de dragón que encienden una ruta entera',
      organism: 'Solanum lycopersicum',
      difficulty: 'intermediate', isTutorial: false, estimatedDuration: 10, connections: 13, kind: 'tomato',
    },
  },
  {
    id: 'build-pigment',
    loader: () => import('../data/levels/build-pigment.json'),
    summary: {
      title: 'Red bacteria', title_es: 'Bacterias rojas',
      subtitle: 'Two genes, one pigment',
      subtitle_es: 'Dos genes, un pigmento',
      organism: 'Escherichia coli',
      difficulty: 'intermediate', isTutorial: false, mode: 'construct', estimatedDuration: 7, connections: 6, kind: 'bacterium',
    },
  },
  {
    id: 'seq-barcode',
    loader: () => import('../data/levels/seq-barcode.json'),
    summary: {
      title: 'Is it the fish on the label?', title_es: '¿Es el pescado de la etiqueta?',
      subtitle: 'From a fillet to a name, step by step',
      subtitle_es: 'De un filete a un nombre, paso a paso',
      organism: 'DNA barcoding',
      difficulty: 'intermediate', isTutorial: false, mode: 'sequence', estimatedDuration: 6, connections: 7, kind: 'dna',
    },
  },
  {
    id: 'asm-mammoth',
    loader: () => import('../data/levels/asm-mammoth.json'),
    summary: {
      title: 'DNA from the ice age', title_es: 'ADN de la edad de hielo',
      subtitle: 'A mammoth, in very short pieces',
      subtitle_es: 'Un mamut, en trozos muy cortos',
      organism: 'Mammuthus primigenius',
      difficulty: 'intermediate', isTutorial: false, mode: 'assemble', estimatedDuration: 6, connections: 0, kind: 'dna',
    },
  },
  {
    id: 'seq-crispr',
    loader: () => import('../data/levels/seq-crispr.json'),
    summary: {
      title: 'How CRISPR edits a gene', title_es: 'Cómo edita CRISPR un gen',
      subtitle: 'Guide, cut, repair',
      subtitle_es: 'Guía, corte, reparación',
      organism: 'CRISPR-Cas9',
      difficulty: 'intermediate', isTutorial: false, mode: 'sequence', estimatedDuration: 5, connections: 6, kind: 'dna',
    },
  },
  {
    id: 'crispr-3',
    loader: () => import('../data/levels/crispr-3.json'),
    summary: {
      title: 'Cutting only once', title_es: 'Cortar una sola vez',
      subtitle: 'The danger of look-alikes',
      subtitle_es: 'El peligro de los parecidos',
      organism: 'Cas9 target',
      difficulty: 'intermediate', isTutorial: false, mode: 'crispr', estimatedDuration: 7, connections: 0, kind: 'dna',
    },
  },
  {
    id: 'crispr-7',
    loader: () => import('../data/levels/crispr-7.json'),
    summary: {
      title: 'Corn for a better starch', title_es: 'Maíz para un almidón mejor',
      subtitle: 'Switching off one gene of the starch',
      subtitle_es: 'Apagar un gen del almidón',
      organism: 'Zea mays',
      difficulty: 'intermediate', isTutorial: false, mode: 'crispr', estimatedDuration: 7, connections: 0, kind: 'grain',
    },
  },
  {
    id: 'crispr-8',
    loader: () => import('../data/levels/crispr-8.json'),
    summary: {
      title: 'A tomato with more GABA', title_es: 'Un tomate con más GABA',
      subtitle: 'Cutting the brake of an enzyme',
      subtitle_es: 'Cortar el freno de una enzima',
      organism: 'Solanum lycopersicum',
      difficulty: 'intermediate', isTutorial: false, mode: 'crispr', estimatedDuration: 8, connections: 0, kind: 'tomato',
    },
  },
  {
    id: 'mut-crispr-edit',
    loader: () => import('../data/levels/mut-crispr-edit.json'),
    summary: {
      title: 'What a CRISPR cut leaves behind', title_es: 'Lo que deja un corte de CRISPR',
      subtitle: 'One extra letter, and the gene is off',
      subtitle_es: 'Una letra de más y el gen se apaga',
      organism: 'Genome editing',
      difficulty: 'intermediate', isTutorial: false, mode: 'mutation', estimatedDuration: 6, connections: 0, kind: 'dna',
    },
  },
  {
    id: 'blood-groups',
    loader: () => import('../data/levels/blood-groups.json'),
    summary: {
      title: 'Blood groups: A, B and AB', title_es: 'Grupos sanguíneos: A, B y AB',
      subtitle: 'One gene, two versions, two sugars',
      subtitle_es: 'Un gen, dos versiones, dos azúcares',
      organism: 'Homo sapiens',
      difficulty: 'intermediate', isTutorial: false, mode: 'pathway', estimatedDuration: 8, connections: 12, kind: 'blood',
    },
  },
  {
    id: 'inh-pku',
    loader: () => import('../data/levels/inh-pku.json'),
    summary: {
      title: 'How PKU is inherited', title_es: 'Cómo se hereda la PKU',
      subtitle: 'Punnett squares for a recessive condition',
      subtitle_es: 'Cuadros de Punnett para una condición recesiva',
      organism: 'Homo sapiens',
      difficulty: 'intermediate', isTutorial: false, mode: 'inherit', estimatedDuration: 7, connections: 3, kind: 'blood',
    },
  },
  {
    id: 'fix-pku',
    loader: () => import('../data/levels/fix-pku.json'),
    summary: {
      title: 'A missing enzyme: phenylketonuria', title_es: 'Una enzima que falta: la fenilcetonuria',
      subtitle: 'Follow the pathway and find where it stops',
      subtitle_es: 'Sigue la ruta y descubre dónde se detiene',
      organism: 'Homo sapiens',
      difficulty: 'intermediate', isTutorial: false, mode: 'diagnose', estimatedDuration: 7, connections: 0, kind: 'blood',
    },
  },
  {
    id: 'fix-antibiotic',
    loader: () => import('../data/levels/fix-antibiotic.json'),
    summary: {
      title: 'The treatment that stopped working', title_es: 'El tratamiento que dejó de funcionar',
      subtitle: 'Why does an antibiotic fail, and what is the right response?',
      subtitle_es: '¿Por qué falla un antibiótico y cuál es la respuesta correcta?',
      organism: 'Bacteria',
      difficulty: 'intermediate', isTutorial: false, mode: 'diagnose', estimatedDuration: 7, connections: 0, kind: 'bacterium',
    },
  },
  {
    id: 'mrna-vaccine',
    loader: () => import('../data/levels/mrna-vaccine.json'),
    summary: {
      title: 'How an mRNA vaccine works', title_es: 'Cómo funciona una vacuna de ARNm',
      subtitle: 'A message that teaches the body to recognise a virus',
      subtitle_es: 'Un mensaje que enseña al cuerpo a reconocer un virus',
      organism: 'Homo sapiens',
      difficulty: 'intermediate', isTutorial: false, mode: 'pathway', estimatedDuration: 9, connections: 9, kind: 'cell',
    },
  },
  {
    id: 'tune-yeast',
    loader: () => import('../data/levels/tune-yeast.json'),
    summary: {
      title: 'Tune the enzyme factory', title_es: 'Ajusta la fábrica de enzimas',
      subtitle: 'Output versus a healthy culture, within a budget',
      subtitle_es: 'Producción frente a un cultivo sano, con un presupuesto',
      organism: 'Saccharomyces cerevisiae',
      difficulty: 'intermediate', isTutorial: false, mode: 'tune', estimatedDuration: 7, connections: 0, kind: 'yeast',
    },
  },
  {
    id: 'stevia',
    loader: () => import('../data/levels/stevia.json'),
    summary: {
      title: 'A sweetener from a leaf', title_es: 'Un edulcorante de una hoja',
      subtitle: 'Adding sugar units to a bitter molecule',
      subtitle_es: 'Añadir unidades de azúcar a una molécula amarga',
      organism: 'Stevia rebaudiana',
      difficulty: 'intermediate', isTutorial: false, estimatedDuration: 7, connections: 6, kind: 'plant',
    },
  },
  {
    id: 'build-sweet',
    loader: () => import('../data/levels/build-sweet.json'),
    summary: {
      title: 'A sweet protein from yeast', title_es: 'Una proteína dulce hecha por levadura',
      subtitle: 'Brazzein, secreted by a yeast',
      subtitle_es: 'Braceína, secretada por una levadura',
      organism: 'Saccharomyces cerevisiae',
      difficulty: 'intermediate', isTutorial: false, mode: 'construct', estimatedDuration: 7, connections: 4, kind: 'yeast',
    },
  },
  {
    id: 'fix-cheese',
    loader: () => import('../data/levels/fix-cheese.json'),
    summary: {
      title: 'The milk that would not curdle', title_es: 'La leche que no cuajaba',
      subtitle: 'Find what blocks the chymosin',
      subtitle_es: 'Encuentra qué le impide trabajar a la quimosina',
      organism: 'Bos taurus (milk)',
      difficulty: 'intermediate', isTutorial: false, mode: 'diagnose', estimatedDuration: 6, connections: 0, kind: 'cheese',
    },
  },
  {
    id: 'build-silk',
    loader: () => import('../data/levels/build-silk.json'),
    summary: {
      title: 'Spider silk from bacteria', title_es: 'Seda de araña de bacterias',
      subtitle: 'A tough fibre, grown in a tank',
      subtitle_es: 'Una fibra muy resistente, cultivada en un tanque',
      organism: 'Escherichia coli',
      difficulty: 'intermediate', isTutorial: false, mode: 'construct', estimatedDuration: 6, connections: 4, kind: 'silk',
    },
  },
  {
    id: 'plastic',
    loader: () => import('../data/levels/plastic.json'),
    summary: {
      title: 'Plastic-eating bacteria', title_es: 'Bacterias come-plástico',
      subtitle: 'Two enzymes that take a PET bottle apart',
      subtitle_es: 'Dos enzimas que desmontan una botella de PET',
      organism: 'Ideonella sakaiensis',
      difficulty: 'intermediate', isTutorial: false, estimatedDuration: 9, connections: 11, kind: 'bottle',
    },
  },
  {
    id: 'bioplastic',
    loader: () => import('../data/levels/bioplastic.json'),
    summary: {
      title: 'Plastic that bacteria make', title_es: 'Plástico que fabrican las bacterias',
      subtitle: 'PHB, a plastic that nature can digest',
      subtitle_es: 'El PHB, un plástico que la naturaleza puede digerir',
      organism: 'Escherichia coli',
      difficulty: 'intermediate', isTutorial: false, estimatedDuration: 9, connections: 13, kind: 'bacterium',
    },
  },
  {
    id: 'indigo',
    loader: () => import('../data/levels/indigo.json'),
    summary: {
      title: 'Bacterial blue jeans', title_es: 'Vaqueros azules bacterianos',
      subtitle: 'Indigo dye made by E. coli',
      subtitle_es: 'Tinte índigo fabricado por E. coli',
      organism: 'Escherichia coli',
      difficulty: 'intermediate', isTutorial: false, estimatedDuration: 9, connections: 12, kind: 'jeans',
    },
  },
  {
    id: 'fix-indigo',
    loader: () => import('../data/levels/fix-indigo.json'),
    summary: {
      title: 'Bacteria that stay white', title_es: 'Bacterias que se quedan blancas',
      subtitle: 'Why does the indigo culture not turn blue?',
      subtitle_es: '¿Por qué el cultivo de índigo no se pone azul?',
      organism: 'Escherichia coli',
      difficulty: 'intermediate', isTutorial: false, mode: 'diagnose', estimatedDuration: 7, connections: 0, kind: 'jeans',
    },
  },
  {
    id: 'cut-cellulase',
    loader: () => import('../data/levels/cut-cellulase.json'),
    summary: {
      title: 'Taking out the gene of the jeans enzyme', title_es: 'Sacar el gen de la enzima de los vaqueros',
      subtitle: 'A look-alike band in the gel',
      subtitle_es: 'Una banda parecida en el gel',
      organism: 'Trichoderma reesei',
      difficulty: 'intermediate', isTutorial: false, mode: 'cut', estimatedDuration: 7, connections: 0, kind: 'jeans',
    },
  },
  {
    id: 'straw-fuel',
    loader: () => import('../data/levels/straw-fuel.json'),
    summary: {
      title: 'Fuel from straw', title_es: 'Combustible de paja',
      subtitle: 'Unlocking the sugar hidden in plant fibres',
      subtitle_es: 'Liberar el azúcar escondido en las fibras vegetales',
      organism: 'Trichoderma reesei + S. cerevisiae',
      difficulty: 'intermediate', isTutorial: false, estimatedDuration: 10, connections: 12, kind: 'wheat',
    },
  },
  {
    id: 'seq-biogas',
    loader: () => import('../data/levels/seq-biogas.json'),
    summary: {
      title: 'From food scraps to gas', title_es: 'De los restos de comida al gas',
      subtitle: 'A chain of microbes',
      subtitle_es: 'Una cadena de microbios',
      organism: 'Anaerobic digestion',
      difficulty: 'intermediate', isTutorial: false, mode: 'sequence', estimatedDuration: 5, connections: 6, kind: 'flask',
    },
  },
  {
    id: 'biogas',
    loader: () => import('../data/levels/biogas.json'),
    summary: {
      title: 'A chain of microbes: biogas', title_es: 'Una cadena de microbios: el biogás',
      subtitle: 'From waste to methane',
      subtitle_es: 'De los residuos al metano',
      organism: 'Anaerobic microbial community',
      difficulty: 'intermediate', isTutorial: false, estimatedDuration: 9, connections: 10, kind: 'flask',
    },
  },
  {
    id: 'tune-biogas',
    loader: () => import('../data/levels/tune-biogas.json'),
    summary: {
      title: 'Tune the digester', title_es: 'Ajusta el digestor',
      subtitle: 'Heat, feed and stirring',
      subtitle_es: 'Calor, alimento y mezcla',
      organism: 'Anaerobic digestion',
      difficulty: 'intermediate', isTutorial: false, mode: 'tune', estimatedDuration: 6, connections: 0, kind: 'flask',
    },
  },
  {
    id: 'fix-biogas',
    loader: () => import('../data/levels/fix-biogas.json'),
    summary: {
      title: 'The digester that gives no gas', title_es: 'El digestor que no da gas',
      subtitle: 'Sour smell, no methane',
      subtitle_es: 'Olor ácido, sin metano',
      organism: 'Anaerobic microbial community',
      difficulty: 'intermediate', isTutorial: false, mode: 'diagnose', estimatedDuration: 6, connections: 0, kind: 'flask',
    },
  },
  {
    id: 'tune-algae',
    loader: () => import('../data/levels/tune-algae.json'),
    summary: {
      title: 'Tune the algae pond', title_es: 'Ajusta el estanque de algas',
      subtitle: 'Light, gas and food',
      subtitle_es: 'Luz, gas y alimento',
      organism: 'Chlorella vulgaris',
      difficulty: 'intermediate', isTutorial: false, mode: 'tune', estimatedDuration: 6, connections: 0, kind: 'plant',
    },
  },
  {
    id: 'nitrogen-fixation',
    loader: () => import('../data/levels/nitrogen-fixation.json'),
    summary: {
      title: 'Living fertiliser: nitrogen fixation', title_es: 'Abono vivo: la fijación de nitrógeno',
      subtitle: 'Making ammonia from air',
      subtitle_es: 'Fabricar amoníaco a partir del aire',
      organism: 'Rhizobium leguminosarum',
      difficulty: 'intermediate', isTutorial: false, estimatedDuration: 7, connections: 6, kind: 'plant',
    },
  },
  {
    id: 'seq-legume',
    loader: () => import('../data/levels/seq-legume.json'),
    summary: {
      title: 'Plants that make their own fertiliser', title_es: 'Plantas que fabrican su propio abono',
      subtitle: 'A conversation between a root and a bacterium',
      subtitle_es: 'Una conversación entre una raíz y una bacteria',
      organism: 'Rhizobium leguminosarum',
      difficulty: 'intermediate', isTutorial: false, mode: 'sequence', estimatedDuration: 6, connections: 7, kind: 'plant',
    },
  },
  {
    id: 'fix-nodule',
    loader: () => import('../data/levels/fix-nodule.json'),
    summary: {
      title: 'Soybeans without nodules', title_es: 'Soja sin nódulos',
      subtitle: 'The bacteria are there, but the plant ignores them',
      subtitle_es: 'Las bacterias están, pero la planta las ignora',
      organism: 'Glycine max',
      difficulty: 'intermediate', isTutorial: false, mode: 'diagnose', estimatedDuration: 6, connections: 0, kind: 'plant',
    },
  },
  {
    id: 'tune-compost',
    loader: () => import('../data/levels/tune-compost.json'),
    summary: {
      title: 'A heap that gets hot', title_es: 'Un montón que se calienta',
      subtitle: 'Food scraps, water, size and air',
      subtitle_es: 'Restos de comida, agua, tamaño y aire',
      organism: 'Compost microbes',
      difficulty: 'intermediate', isTutorial: false, mode: 'tune', estimatedDuration: 6, connections: 0, kind: 'plant',
    },
  },
  {
    id: 'seq-cheese',
    loader: () => import('../data/levels/seq-cheese.json'),
    summary: {
      title: 'From milk to cheese', title_es: 'De la leche al queso',
      subtitle: 'Eight steps, each one needs the one before',
      subtitle_es: 'Ocho pasos, cada uno necesita el anterior',
      organism: 'Lactococcus lactis',
      difficulty: 'intermediate', isTutorial: false, mode: 'sequence', estimatedDuration: 6, connections: 8, kind: 'cheese',
    },
  },
  {
    id: 'inh-rabbit',
    loader: () => import('../data/levels/inh-rabbit.json'),
    summary: {
      title: 'Three coats in one rabbit gene', title_es: 'Tres pelajes en un gen de conejo',
      subtitle: 'A ladder of dominance: C, h, c',
      subtitle_es: 'Una escalera de dominancia: C, h, c',
      organism: 'Oryctolagus cuniculus',
      difficulty: 'advanced', isTutorial: false, mode: 'inherit', estimatedDuration: 8, connections: 3, kind: 'cell',
    },
  },
  {
    id: 'inh-calico',
    loader: () => import('../data/levels/inh-calico.json'),
    summary: {
      title: 'Why calico cats are almost always female', title_es: 'Por qué los gatos calicó casi siempre son hembras',
      subtitle: 'A coat colour gene on the X chromosome',
      subtitle_es: 'Un gen del color del pelaje en el cromosoma X',
      organism: 'Felis catus',
      difficulty: 'advanced', isTutorial: false, mode: 'inherit', estimatedDuration: 8, connections: 3, kind: 'cell',
    },
  },
  {
    id: 'pair-insulin',
    loader: () => import('../data/levels/pair-insulin.json'),
    summary: {
      title: 'The first words of insulin', title_es: 'Las primeras palabras de la insulina',
      subtitle: 'Thirteen codons and a stop',
      subtitle_es: 'Trece codones y una parada',
      organism: 'Nucleic acids',
      difficulty: 'advanced', isTutorial: false, mode: 'pairing', estimatedDuration: 8, connections: 14, kind: 'dna',
    },
  },
  {
    id: 'mut-wheat',
    loader: () => import('../data/levels/mut-wheat.json'),
    summary: {
      title: 'The short wheat that fed millions', title_es: 'El trigo bajo que alimentó a millones',
      subtitle: 'A stop codon at the start of a growth gene',
      subtitle_es: 'Un codón de fin al comienzo de un gen del crecimiento',
      organism: 'Triticum aestivum',
      difficulty: 'advanced', isTutorial: false, mode: 'mutation', estimatedDuration: 6, connections: 0, kind: 'wheat',
    },
  },
  {
    id: 'mut-belgian',
    loader: () => import('../data/levels/mut-belgian.json'),
    summary: {
      title: 'The lost letter of the Belgian Blue', title_es: 'La letra perdida de la vaca azul belga',
      subtitle: 'A deletion that doubles the muscle',
      subtitle_es: 'Una deleción que duplica el músculo',
      organism: 'Bos taurus',
      difficulty: 'advanced', isTutorial: false, mode: 'mutation', estimatedDuration: 7, connections: 0, kind: 'cell',
    },
  },
  {
    id: 'cut-plasmid',
    loader: () => import('../data/levels/cut-plasmid.json'),
    summary: {
      title: 'A crowded map', title_es: 'Un mapa lleno',
      subtitle: 'Five enzymes, one gene',
      subtitle_es: 'Cinco enzimas, un gen',
      organism: 'Cloning vector',
      difficulty: 'advanced', isTutorial: false, mode: 'cut', estimatedDuration: 8, connections: 0, kind: 'bacterium',
    },
  },
  {
    id: 'cut-heme',
    loader: () => import('../data/levels/cut-heme.json'),
    summary: {
      title: 'The gene of a red protein', title_es: 'El gen de una proteína roja',
      subtitle: 'Five enzymes and a band that lies',
      subtitle_es: 'Cinco enzimas y una banda que miente',
      organism: 'Glycine max',
      difficulty: 'advanced', isTutorial: false, mode: 'cut', estimatedDuration: 8, connections: 0, kind: 'burger',
    },
  },
  {
    id: 'fix-lac',
    loader: () => import('../data/levels/fix-lac.json'),
    summary: {
      title: 'Colonies that stay white', title_es: 'Colonias que se quedan blancas',
      subtitle: 'A repressor that never lets go',
      subtitle_es: 'Un represor que nunca suelta',
      organism: 'Escherichia coli',
      difficulty: 'advanced', isTutorial: false, mode: 'diagnose', estimatedDuration: 7, connections: 0, kind: 'bacterium',
    },
  },
  {
    id: 'build-lux',
    loader: () => import('../data/levels/build-lux.json'),
    summary: {
      title: 'Bacteria that make their own light', title_es: 'Bacterias que fabrican su propia luz',
      subtitle: 'The lux genes of a glowing bacterium',
      subtitle_es: 'Los genes lux de una bacteria luminosa',
      organism: 'Vibrio fischeri',
      difficulty: 'advanced', isTutorial: false, mode: 'construct', estimatedDuration: 8, connections: 6, kind: 'bacterium',
    },
  },
  {
    id: 'quorum',
    loader: () => import('../data/levels/quorum.json'),
    summary: {
      title: 'Bacteria that talk: the squid and its light', title_es: 'Bacterias que hablan: el calamar y su luz',
      subtitle: 'Light only when there are many',
      subtitle_es: 'Luz solo cuando son muchas',
      organism: 'Vibrio fischeri',
      difficulty: 'advanced', isTutorial: false, estimatedDuration: 9, connections: 8, kind: 'jellyfish',
    },
  },
  {
    id: 'seq-crop',
    loader: () => import('../data/levels/seq-crop.json'),
    summary: {
      title: 'How a new crop variety is made', title_es: 'Cómo se hace una nueva variedad de cultivo',
      subtitle: 'From a gene to a field',
      subtitle_es: 'De un gen a un campo',
      organism: 'Plant biotechnology',
      difficulty: 'advanced', isTutorial: false, mode: 'sequence', estimatedDuration: 9, connections: 8, kind: 'plant',
    },
  },
  {
    id: 'asm-yeast',
    loader: () => import('../data/levels/asm-yeast.json'),
    summary: {
      title: 'The genome of bread yeast', title_es: 'El genoma de la levadura del pan',
      subtitle: 'The first genome of a cell with a nucleus',
      subtitle_es: 'El primer genoma de una célula con núcleo',
      organism: 'Saccharomyces cerevisiae',
      difficulty: 'advanced', isTutorial: false, mode: 'assemble', estimatedDuration: 9, connections: 0, kind: 'yeast',
    },
  },
  {
    id: 'seq-swab',
    loader: () => import('../data/levels/seq-swab.json'),
    summary: {
      title: 'A DNA test for your cat', title_es: 'Un test de ADN para tu gato',
      subtitle: 'From a cheek swab to a genotype',
      subtitle_es: 'De un frotis de la mejilla a un genotipo',
      organism: 'Felis catus',
      difficulty: 'advanced', isTutorial: false, mode: 'sequence', estimatedDuration: 8, connections: 8, kind: 'dna',
    },
  },
  {
    id: 'asm-neandertal',
    loader: () => import('../data/levels/asm-neandertal.json'),
    summary: {
      title: 'DNA from a cousin who is gone', title_es: 'ADN de un primo que ya no está',
      subtitle: 'A Neandertal, in short broken pieces',
      subtitle_es: 'Un neandertal, en trozos cortos y rotos',
      organism: 'Homo neanderthalensis',
      difficulty: 'advanced', isTutorial: false, mode: 'assemble', estimatedDuration: 9, connections: 0, kind: 'dna',
    },
  },
  {
    id: 'crispr-5',
    loader: () => import('../data/levels/crispr-5.json'),
    summary: {
      title: 'Rice that resists blight', title_es: 'Arroz que resiste el tizón',
      subtitle: 'Editing the door the bacteria use',
      subtitle_es: 'Editar la puerta que usa la bacteria',
      organism: 'Oryza sativa',
      difficulty: 'advanced', isTutorial: false, mode: 'crispr', estimatedDuration: 9, connections: 0, kind: 'grain',
    },
  },
  {
    id: 'crispr-6',
    loader: () => import('../data/levels/crispr-6.json'),
    summary: {
      title: 'A mushroom that stays white', title_es: 'Una seta que sigue blanca',
      subtitle: 'Turning down the browning enzyme',
      subtitle_es: 'Bajar la enzima del pardeamiento',
      organism: 'Agaricus bisporus',
      difficulty: 'advanced', isTutorial: false, mode: 'crispr', estimatedDuration: 9, connections: 0, kind: 'plant',
    },
  },
  {
    id: 'crispr-9',
    loader: () => import('../data/levels/crispr-9.json'),
    summary: {
      title: 'A pig that the virus cannot enter', title_es: 'Un cerdo en el que el virus no puede entrar',
      subtitle: 'Editing the door that a virus uses',
      subtitle_es: 'Editar la puerta que usa un virus',
      organism: 'Sus scrofa',
      difficulty: 'advanced', isTutorial: false, mode: 'crispr', estimatedDuration: 9, connections: 0, kind: 'cell',
    },
  },
  {
    id: 'crispr-4',
    loader: () => import('../data/levels/crispr-4.json'),
    summary: {
      title: 'A guide for a big genome', title_es: 'Una guía para un genoma grande',
      subtitle: 'Many look-alikes',
      subtitle_es: 'Muchos parecidos',
      organism: 'Cas9 target',
      difficulty: 'advanced', isTutorial: false, mode: 'crispr', estimatedDuration: 9, connections: 0, kind: 'dna',
    },
  },
  {
    id: 'artemisinin',
    loader: () => import('../data/levels/artemisinin.json'),
    summary: {
      title: 'Antimalarial yeast', title_es: 'Levadura antimalaria',
      subtitle: 'Brewing the precursor of artemisinin',
      subtitle_es: 'Fermentar el precursor de la artemisinina',
      organism: 'Saccharomyces cerevisiae',
      difficulty: 'advanced', isTutorial: false, estimatedDuration: 15, connections: 17, kind: 'yeast',
    },
  },
  {
    id: 'crispr-sickle',
    loader: () => import('../data/levels/crispr-sickle.json'),
    summary: {
      title: 'CRISPR against sickle cell', title_es: 'CRISPR contra la anemia falciforme',
      subtitle: 'Switching a backup haemoglobin back on',
      subtitle_es: 'Volver a encender una hemoglobina de reserva',
      organism: 'Homo sapiens',
      difficulty: 'advanced', isTutorial: false, estimatedDuration: 14, connections: 12, kind: 'blood',
    },
  },
  {
    id: 'vanillin',
    loader: () => import('../data/levels/vanillin.json'),
    summary: {
      title: 'Vanilla from yeast', title_es: 'Vainilla de levadura',
      subtitle: 'Brewing the world\'s favourite flavour',
      subtitle_es: 'Fermentar el sabor favorito del mundo',
      organism: 'Saccharomyces cerevisiae',
      difficulty: 'advanced', isTutorial: false, estimatedDuration: 12, connections: 13, kind: 'vanilla',
    },
  },
  {
    id: 'build-pha',
    loader: () => import('../data/levels/build-pha.json'),
    summary: {
      title: 'Bacteria that make plastic', title_es: 'Bacterias que fabrican plástico',
      subtitle: 'Three genes for a biodegradable plastic',
      subtitle_es: 'Tres genes para un plástico biodegradable',
      organism: 'Escherichia coli',
      difficulty: 'advanced', isTutorial: false, mode: 'construct', estimatedDuration: 9, connections: 8, kind: 'bacterium',
    },
  },
  {
    id: 'tune-ethanol',
    loader: () => import('../data/levels/tune-ethanol.json'),
    summary: {
      title: 'Fuel from sugar cane', title_es: 'Combustible de caña de azúcar',
      subtitle: 'Ethanol as in Brazil',
      subtitle_es: 'Etanol como en Brasil',
      organism: 'Saccharomyces cerevisiae',
      difficulty: 'advanced', isTutorial: false, mode: 'tune', estimatedDuration: 7, connections: 0, kind: 'wheat',
    },
  },
  {
    id: 'oil-eaters',
    loader: () => import('../data/levels/oil-eaters.json'),
    summary: {
      title: 'Bacteria that eat oil', title_es: 'Bacterias que comen petróleo',
      subtitle: 'Cleaning a spill with microbes',
      subtitle_es: 'Limpiar un vertido con microbios',
      organism: 'Alcanivorax borkumensis',
      difficulty: 'advanced', isTutorial: false, estimatedDuration: 9, connections: 8, kind: 'bacterium',
    },
  },
  {
    id: 'inh-dihybrid-peas',
    loader: () => import('../data/levels/inh-dihybrid-peas.json'),
    summary: {
      title: 'Round and yellow: the 9:3:3:1 peas', title_es: 'Redondo y amarillo: los guisantes 9:3:3:1',
      subtitle: 'Two genes at once, as Mendel did',
      subtitle_es: 'Dos genes a la vez, como hizo Mendel',
      organism: 'Pisum sativum',
      difficulty: 'advanced', isTutorial: false, mode: 'inherit', estimatedDuration: 9, connections: 3, kind: 'plant',
    },
  },
  {
    id: 'inh-dihybrid-tomato',
    loader: () => import('../data/levels/inh-dihybrid-tomato.json'),
    summary: {
      title: 'Red tomatoes for a small garden', title_es: 'Tomates rojos para un huerto pequeño',
      subtitle: 'Colour and height, planned together',
      subtitle_es: 'Color y altura, planificados juntos',
      organism: 'Solanum lycopersicum',
      difficulty: 'advanced', isTutorial: false, mode: 'inherit', estimatedDuration: 8, connections: 3, kind: 'tomato',
    },
  },
  {
    id: 'inh-dihybrid-cat',
    loader: () => import('../data/levels/inh-dihybrid-cat.json'),
    summary: {
      title: 'The Himalayan cat', title_es: 'El gato himalayo',
      subtitle: 'Siamese colour and long hair together',
      subtitle_es: 'Color siamés y pelo largo juntos',
      organism: 'Felis catus',
      difficulty: 'advanced', isTutorial: false, mode: 'inherit', estimatedDuration: 8, connections: 3, kind: 'cell',
    },
  },
];

/** Level ids in play order. */
export const LEVEL_ORDER: string[] = LEVEL_REGISTRY.map(r => r.id);

export class LevelLoadError extends Error {
  constructor(levelId: string, reason: string) {
    super(`Failed to load level "${levelId}": ${reason}`);
    this.name = 'LevelLoadError';
  }
}

export class LevelLoader {
  private cache: Map<string, LevelData> = new Map();

  /**
   * Loads, validates, and caches a level by ID.
   * Throws LevelLoadError if the level is not found or fails validation.
   */
  async loadLevel(levelId: string): Promise<LevelData> {
    if (this.cache.has(levelId)) {
      return this.cache.get(levelId)!;
    }

    const registry = LEVEL_REGISTRY.find(r => r.id === levelId);
    if (!registry) {
      throw new LevelLoadError(levelId, `Level ID "${levelId}" is not registered.`);
    }

    let rawData: unknown;
    try {
      const module = await registry.loader();
      // JSON imports expose the default export
      rawData = (module as { default?: unknown }).default ?? module;
    } catch (err) {
      throw new LevelLoadError(levelId, `Failed to import level data: ${String(err)}`);
    }

    const levelData = this.validateLevel(rawData);

    // Validate internal integrity
    const integrityResult = LevelValidator.validateIntegrity(levelData);
    if (!integrityResult.isValid) {
      const errorList = integrityResult.errors.join('\n  - ');
      throw new LevelLoadError(levelId, `Level integrity check failed:\n  - ${errorList}`);
    }

    if (integrityResult.warnings.length > 0) {
      console.warn(`[LevelLoader] Warnings for level "${levelId}":\n`, integrityResult.warnings);
    }

    this.cache.set(levelId, levelData);
    return levelData;
  }

  /**
   * Validates raw data against the LevelData schema.
   * Throws LevelSchemaError if invalid.
   */
  validateLevel(data: unknown): LevelData {
    return validateLevelSchema(data);
  }

  /**
   * Builds a BiologicalGraph populated with all nodes from the level's
   * biological context. Does NOT add player connections.
   */
  buildGraphFromLevel(level: LevelData): BiologicalGraph {
    const graph = new BiologicalGraph();

    // Add all nodes from the biological context
    level.biologicalContext.nodes.forEach((node: BiologicalNode) => {
      graph.addNode(node);
    });

    // Note: Reference edges from biologicalContext are NOT added to the player graph.
    // They are used only for comparison when validating player-placed connections.

    return graph;
  }

  /**
   * Returns a map of required connection IDs to their definitions,
   * used by the PuzzleEngine for win condition evaluation.
   */
  buildRequiredConnectionMap(
    level: LevelData
  ): Map<string, { sourceId: string; targetId: string; edgeType: string; id: string }> {
    const map = new Map<string, { sourceId: string; targetId: string; edgeType: string; id: string }>();
    level.puzzle.requiredConnections.forEach(rc => {
      map.set(rc.id, {
        id: rc.id,
        sourceId: rc.sourceId,
        targetId: rc.targetId,
        edgeType: rc.edgeType,
      });
    });
    return map;
  }

  /**
   * Returns summary info for all registered levels, in play order.
   * Does not load the full level data.
   */
  getAvailableLevels(lang: Language = 'en'): LevelSummary[] {
    return LEVEL_REGISTRY.map((entry, index) => ({
      mode: 'pathway' as const,
      ...localize(entry.summary, lang),
      id: entry.id,
      order: index,
    }));
  }

  /** Returns the id of the level after `levelId`, if any. */
  getNextLevelId(levelId: string): string | null {
    const index = LEVEL_ORDER.indexOf(levelId);
    return index >= 0 && index < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[index + 1] : null;
  }

  /**
   * Clears the level cache (useful for development/hot reload).
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance for use throughout the app
export const levelLoader = new LevelLoader();
