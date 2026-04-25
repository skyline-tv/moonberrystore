export const collections = [
  {
    id: 'signature',
    name: 'Signature Scents',
    description: 'Elegant fragrance blends for day and evening rituals.',
    image:
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'loungewear',
    name: 'Radiant Skin',
    description: 'Hydrating skincare with a soft, luminous finish.',
    image:
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'evening',
    name: 'Nail Atelier',
    description: 'Salon-grade nail color and care in refined shades.',
    image:
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1400&q=80',
  },
]

export const products = [
  {
    id: 'p1',
    slug: 'moon-veil-eau-de-parfum',
    name: 'Moon Veil Eau De Parfum',
    price: 98,
    compareAtPrice: 120,
    category: 'Perfume',
    collection: 'Signature Scents',
    description:
      'A floral-amber signature perfume with soft rose, musk, and warm vanilla.',
    colors: ['50ml', '100ml'],
    sizes: ['50ml', '100ml'],
    notes: ['Rose Petal', 'White Musk', 'Warm Vanilla'],
    shadeHex: ['#8B6F74', '#B08D92', '#E9D6D2'],
    images: [
      'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=80',
    ],
    bestSeller: true,
  },
  {
    id: 'p2',
    slug: 'rose-cloud-face-serum',
    name: 'Rose Cloud Face Serum',
    price: 54,
    category: 'Skincare',
    collection: 'Radiant Skin',
    description: 'A silky brightening serum with rosewater and niacinamide.',
    colors: ['30ml'],
    sizes: ['30ml', '50ml'],
    notes: ['Rosewater', 'Niacinamide', 'Peptide Complex'],
    shadeHex: ['#D7A8A2', '#F5F1EE'],
    images: [
      'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1573575155376-b5010099301a?auto=format&fit=crop&w=1200&q=80',
    ],
    bestSeller: false,
  },
  {
    id: 'p3',
    slug: 'velvet-blush-palette',
    name: 'Velvet Blush Palette',
    price: 39,
    category: 'Makeup',
    collection: 'Radiant Skin',
    description:
      'A velvety trio of blush shades for a soft-lifted complexion.',
    colors: ['Rose', 'Mauve', 'Nude'],
    sizes: ['One Size'],
    notes: ['Soft Matte', 'Silk Pigment', 'Buildable Finish'],
    shadeHex: ['#B87D83', '#8B6F74', '#CFA997'],
    images: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=1200&q=80',
    ],
    bestSeller: true,
  },
  {
    id: 'p4',
    slug: 'mauve-gloss-gel-kit',
    name: 'Mauve Gloss Gel Kit',
    price: 46,
    category: 'Nails',
    collection: 'Nail Atelier',
    description: 'A premium gel nail set with high-shine, long-wear finish.',
    colors: ['Dusty Mauve', 'Muted Rose'],
    sizes: ['Starter Kit', 'Refill'],
    notes: ['Gel Shine', 'Long Wear', 'Quick Cure'],
    shadeHex: ['#8B6F74', '#B08D92'],
    images: [
      'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1631214524020-1e3f0f6f55c3?auto=format&fit=crop&w=1200&q=80',
    ],
    bestSeller: false,
  },
]

export const testimonials = [
  {
    id: 1,
    name: 'Aanya R.',
    quote:
      'Moonberry perfumes and beauty essentials feel so elegant and feminine.',
  },
  {
    id: 2,
    name: 'Lina M.',
    quote:
      'The colors, textures, and scents are premium. My nails and skin routine is complete.',
  },
  {
    id: 3,
    name: 'Sofia K.',
    quote:
      'From fragrance to skincare, everything matches the Moonberry luxury mood.',
  },
]
