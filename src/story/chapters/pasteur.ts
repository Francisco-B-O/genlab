import { doc, robot, type Chapter } from '../dsl';

export const pasteur: Chapter = {
  id: 'pasteur',
  kind: 'flask',
  era: '1860s',
  era_es: 'Década de 1860',
  title: 'The invisible workers',
  title_es: 'Los obreros invisibles',
  scenes: [
      {
        id: 'pasteur-flask',
        title: 'Who makes the wine sour?',
        title_es: '¿Quién agria el vino?',
        level: 'seq-pasteur',
        before: [
          doc("happy",
            'A French chemist was asked why wine and beer turned sour. His answer: living things too small to see.',
            'A un químico francés le preguntaron por qué el vino y la cerveza se agriaban. Su respuesta: seres vivos demasiado pequeños para verse.'),
          robot("thinking",
            'Put his experiment in order. The famous flask has a long, curved neck.',
            'Pon su experimento en orden. El famoso matraz tiene un cuello largo y curvo.'),
        ],
        after: [
          doc("happy",
            'Air could come in, but the microbes stayed in the bend. Life does not appear from nothing.',
            'El aire podía entrar, pero los microbios se quedaban en la curva. La vida no aparece de la nada.'),
        ],
      },
      {
        id: 'pasteur-beer',
        title: 'Studying beer',
        title_es: 'Estudiando la cerveza',
        level: 'seq-beer',
        before: [
          doc("happy",
            'Brewing is a chain of steps that decide what you get. In what order do they go?',
            'Elaborar cerveza es una cadena de pasos que decide lo que obtienes. ¿En qué orden van?'),
        ],
        after: [
          robot("happy",
            'Order restored. The beer is relieved.',
            'Orden restaurado. La cerveza está aliviada.'),
        ],
      },
      {
        id: 'pasteur-pathway',
        title: 'From barley to beer',
        title_es: 'De la cebada a la cerveza',
        level: 'beer',
        before: [
          doc("thinking",
            'Two chains of enzymes in two organisms: the barley makes sugar and the yeast turns it into alcohol.',
            'Dos cadenas de enzimas en dos organismos: la cebada fabrica el azúcar y la levadura lo convierte en alcohol.'),
        ],
        after: [
          doc("happy",
            'He did not know about enzymes, but he saw that yeast was alive and did the work.',
            'Él no conocía las enzimas, pero vio que la levadura estaba viva y hacía el trabajo.'),
        ],
      },
      {
        id: 'pasteur-tune',
        title: 'The temperature of the beer',
        title_es: 'La temperatura de la cerveza',
        level: 'tune-beer',
        before: [
          robot("neutral",
            'Yeast has preferences. Too warm and the flavour goes strange, too cold and it sleeps.',
            'La levadura tiene preferencias. Con demasiado calor el sabor se vuelve raro, con demasiado frío duerme.'),
        ],
        after: [
          doc("happy",
            'Controlling the temperature was one of the first uses of microbiology.',
            'Controlar la temperatura fue uno de los primeros usos de la microbiología.'),
        ],
      },
      {
        id: 'pasteur-stuck',
        title: 'The fermentation that stopped',
        title_es: 'La fermentación que se paró',
        level: 'fix-beer',
        before: [
          robot("worried",
            'A beer that stopped halfway with sugar still left. Use the kit.',
            'Una cerveza que se paró a medias con azúcar todavía dentro. Usa el kit.'),
        ],
        after: [
          doc("happy",
            'The yeast needed more than sugar. Like all of us.',
            'La levadura necesitaba algo más que azúcar. Como todos.'),
        ],
      },
      {
        id: 'pasteur-sourdough',
        title: 'Sourdough starter',
        title_es: 'La masa madre',
        level: 'tune-sourdough',
        before: [
          doc("happy",
            'A sourdough starter is a living community of yeasts and bacteria. It keeps going if you tune it well.',
            'Una masa madre es una comunidad viva de levaduras y bacterias. Sigue adelante si la ajustas bien.'),
        ],
        after: [
          robot("happy",
            'The sourdough has a better personality than most people.',
            'La masa madre tiene mejor carácter que la mayoría de las personas.'),
        ],
      },
      {
        id: "pasteur-wine",
        title: "From grapes to wine",
        title_es: "De la uva al vino",
        level: "seq-wine",
        before: [
          doc("happy",
            "The French chemist was first asked about wine. Here is the process he studied, in order.",
            "Al químico francés le preguntaron primero por el vino. Este es el proceso que estudió, en orden."),
          robot("happy",
            "The yeast in the middle gets all the credit. I approve.",
            "La levadura del medio se lleva todo el mérito. Lo apruebo."),
        ],
        after: [
          doc("happy",
            "Yeast ferments, and other microbes spoil. He saw the difference, and that is the root of food safety.",
            "La levadura fermenta, y otros microbios estropean. Él vio la diferencia, y esa es la raíz de la seguridad alimentaria."),
        ],
      },
      {
        id: 'pasteur-hungry',
        title: 'The starter that does not rise',
        title_es: 'La masa madre que no sube',
        level: 'fix-sourdough',
        before: [
          robot("worried",
            'A forgotten jar, a grey liquid and no bubbles. Find the broken piece.',
            'Un tarro olvidado, un líquido gris y ninguna burbuja. Encuentra la pieza rota.'),
        ],
        after: [
          doc("happy",
            'Feed it and it wakes up. The clock is shaking again: next stop, a monastery garden and a monk with his peas.',
            'Aliméntala y despierta. El reloj vuelve a temblar: próxima parada, el huerto de un monasterio y un monje con sus guisantes.'),
        ],
      },
  ],
};
