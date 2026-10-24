import { doc, robot, type Chapter } from '../dsl';

export const medicine: Chapter = {
  id: 'medicine',
  kind: 'blood',
  era: 'Today',
  era_es: 'Hoy',
  title: 'Biotechnology for health',
  title_es: 'Biotecnología para la salud',
  scenes: [
      {
        id: 'med-blood',
        title: 'Blood groups',
        title_es: 'Grupos sanguíneos',
        level: 'blood-groups',
        before: [
          doc('happy',
            'Biotechnology also looks after people. Start with something everyone has: a blood group, decided by one enzyme.',
            'La biotecnología también cuida de las personas. Empecemos por algo que todos tenemos: un grupo sanguíneo, decidido por una enzima.'),
          robot('neutral',
            'A tiny difference in a sugar, a big difference for a transfusion.',
            'Una pequeña diferencia en un azúcar, una gran diferencia en una transfusión.'),
        ],
        after: [
          doc('thinking',
            'Knowing the pathway explains why some groups can be mixed and others cannot.',
            'Conocer la ruta explica por qué unos grupos se pueden mezclar y otros no.'),
        ],
      },
      {
        id: 'med-pku-inherit',
        title: 'A trait in the family',
        title_es: 'Un rasgo en la familia',
        level: 'inh-pku',
        before: [
          doc('thinking',
            'Some conditions come from a recessive allele that two healthy carriers can pass on. The Punnett square tells the odds.',
            'Algunas condiciones vienen de un alelo recesivo que dos portadores sanos pueden transmitir. El cuadro de Punnett dice las probabilidades.'),
        ],
        after: [
          robot('happy',
            'Odds, not destiny. A very good lesson.',
            'Probabilidades, no destino. Una muy buena lección.'),
        ],
      },
      {
        id: 'med-pku-fix',
        title: 'A missing enzyme',
        title_es: 'Una enzima que falta',
        level: 'fix-pku',
        before: [
          robot('worried',
            'In this pathway one enzyme does not work. Use the kit to find which piece fails and what helps.',
            'En esta ruta una enzima no funciona. Usa el kit para encontrar qué pieza falla y qué ayuda.'),
        ],
        after: [
          doc('happy',
            'Finding the cause early lets people manage it with diet. That is why newborns are tested.',
            'Encontrar la causa pronto permite manejarla con la dieta. Por eso se analiza a los recién nacidos.'),
        ],
      },
      {
        id: 'med-glucose',
        title: 'Measuring sugar',
        title_es: 'Medir el azúcar',
        level: 'glucose-strip',
        before: [
          doc('happy',
            'A test strip uses an enzyme to turn sugar into a signal you can read. Biotechnology in a pocket.',
            'Una tira de análisis usa una enzima para convertir el azúcar en una señal que se puede leer. Biotecnología de bolsillo.'),
        ],
        after: [
          robot('neutral',
            'An enzyme, a colour and a number. Simple and useful.',
            'Una enzima, un color y un número. Sencillo y útil.'),
        ],
      },
      {
        id: 'med-antibiotic',
        title: 'A treatment that stopped working',
        title_es: 'Un tratamiento que dejó de funcionar',
        level: 'fix-antibiotic',
        before: [
          robot('worried',
            'Bacteria change over time, and a drug that worked can stop working. Use the kit to see which piece changed.',
            'Las bacterias cambian con el tiempo, y un fármaco que funcionaba puede dejar de hacerlo. Usa el kit para ver qué pieza cambió.'),
        ],
        after: [
          doc('thinking',
            'Evolution happens on a small scale and fast. That is why drugs must be used with care.',
            'La evolución ocurre a pequeña escala y rápido. Por eso los fármacos hay que usarlos con cuidado.'),
        ],
      },
      {
        id: 'med-artemisinin',
        title: 'Medicine made by yeast',
        title_es: 'Medicina hecha por levadura',
        level: 'artemisinin',
        before: [
          doc('happy',
            'A plant makes a useful compound in tiny amounts. Moving its pathway into yeast made it possible to produce it in tanks.',
            'Una planta fabrica un compuesto útil en cantidades pequeñas. Pasar su ruta a una levadura permitió producirlo en cubas.'),
        ],
        after: [
          robot('happy',
            'A garden inside a tank. Very efficient.',
            'Un huerto dentro de una cuba. Muy eficiente.'),
        ],
      },
      {
        id: 'med-mrna',
        title: 'Instructions on loan',
        title_es: 'Instrucciones prestadas',
        level: 'mrna-vaccine',
        before: [
          doc('thinking',
            'A message of RNA can tell cells to build one harmless piece of a germ, so the body learns to recognise it. The message then disappears.',
            'Un mensaje de ARN puede decir a las células que fabriquen una pieza inofensiva de un germen, para que el cuerpo aprenda a reconocerlo. Después el mensaje desaparece.'),
        ],
        after: [
          robot('neutral',
            'You already know transcription and translation. This is the same idea, used on purpose.',
            'Ya conoces la transcripción y la traducción. Es la misma idea, usada a propósito.'),
        ],
      },
      {
        id: 'med-sickle',
        title: 'Editing a single letter',
        title_es: 'Editar una sola letra',
        level: 'crispr-sickle',
        before: [
          doc('happy',
            'Remember the typo that changes a protein? With CRISPR, researchers have learned to correct a letter like that in cells.',
            '¿Recuerdas la errata que cambia una proteína? Con CRISPR, los investigadores han aprendido a corregir una letra así en células.'),
          robot('surprised',
            'From reading typos to fixing them. Promotion.',
            'De leer erratas a corregirlas. Ascenso.'),
        ],
        after: [
          doc('happy',
            'Careful science, slow and tested. The clock is shaking again: we go to the kitchen of today.',
            'Ciencia cuidadosa, lenta y comprobada. El reloj vuelve a temblar: vamos a la cocina de hoy.'),
        ],
      },
  ],
};
