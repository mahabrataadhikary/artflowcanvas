export interface Artwork {
  id: string;
  title: string;
  category: 'Sketches' | 'Watercolors' | 'Pen Art' | 'Oil Pastels';
  src: string;
  width: number;
  height: number;
  description: string;
}

export const ARTWORKS: Artwork[] = [
  {
    id: '1',
    title: 'The Silent Observer',
    category: 'Sketches',
    src: '/demo-photos/sketch.png',
    width: 800,
    height: 1200,
    description: 'Graphite on paper, exploring shadows and depth.'
  },
  {
    id: '2',
    title: 'Morning Mist',
    category: 'Watercolors',
    src: '/demo-photos/landscape.png',
    width: 1200,
    height: 800,
    description: 'Soft washes of blue and grey capturing a dawn landscape.'
  },
  {
    id: '3',
    title: 'Intricate Lines',
    category: 'Pen Art',
    src: 'https://picsum.photos/seed/pen1/900/900',
    width: 900,
    height: 900,
    description: 'Detailed ink work focusing on architectural patterns.'
  },
  {
    id: '4',
    title: 'Vibrant Soul',
    category: 'Oil Pastels',
    src: 'https://picsum.photos/seed/oil1/1000/1300',
    width: 1000,
    height: 1300,
    description: 'Bold color strokes representing emotional intensity.'
  },
  {
    id: '5',
    title: 'Urban Solitude',
    category: 'Sketches',
    src: 'https://picsum.photos/seed/sketch2/1100/800',
    width: 1100,
    height: 800,
    description: 'Quick charcoal study of city life.'
  },
  {
    id: '6',
    title: 'Floral Grace',
    category: 'Watercolors',
    src: 'https://picsum.photos/seed/water2/800/1000',
    width: 800,
    height: 1000,
    description: 'Delicate botanical illustration.'
  },
  {
    id: '7',
    title: 'Abstract Flow',
    category: 'Pen Art',
    src: '/demo-photos/abstract.png',
    width: 1200,
    height: 1200,
    description: 'Continuous line drawing exploring movement.'
  },
  {
    id: '8',
    title: 'Sunset Glow',
    category: 'Oil Pastels',
    src: 'https://picsum.photos/seed/oil2/1300/900',
    width: 1300,
    height: 900,
    description: 'Rich, textured landscape at dusk.'
  }
];

export const WIP_IMAGES = [
  'https://picsum.photos/seed/wip1/400/400',
  'https://picsum.photos/seed/wip2/400/400',
  'https://picsum.photos/seed/wip3/400/400',
  'https://picsum.photos/seed/wip4/400/400',
];
