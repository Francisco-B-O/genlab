import { doc, robot, type Chapter } from '../dsl';

export const epilogue: Chapter = {
  id: 'epilogue',
  kind: 'flask',
  era: 'Tomorrow',
  era_es: 'Mañana',
  title: 'Your turn',
  title_es: 'Tu turno',
  scenes: [
      {
        id: 'epilogue-end',
        title: 'Your turn',
        title_es: 'Tu turno',
        before: [
          doc('happy',
            'We have crossed ten thousand years of biotechnology in a single afternoon, and your toolbox is full.',
            'Hemos cruzado diez mil años de biotecnología en una sola tarde, y tu caja de herramientas está llena.'),
          robot('happy',
            'I have updated the count. The Doctor lost only four thousand and twelve minutes.',
            'He actualizado la cuenta. El Doctor solo ha perdido cuatro mil doce minutos.'),
          doc('thinking',
            'The levels you did not play are in free play: more cases, with all your tools.',
            'Los niveles que no has jugado están en el juego libre: más casos, con todas tus herramientas.'),
          doc('happy',
            'Thank you, apprentice. The laboratory is yours!',
            '¡Gracias, aprendiz. El laboratorio es tuyo!'),
        ],
        after: [
        ],
      },
  ],
};
