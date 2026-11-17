import { appendFiller, expandText } from '@/simulation/mutation';

export type Category = 'Home' | 'Kitchen' | 'Desk' | 'Textiles';
export type CategoryFilter = 'All' | Category;
export type Shape = 'circle' | 'square' | 'pill' | 'arch';

export const CATEGORY_FILTERS: readonly CategoryFilter[] = [
  'All',
  'Home',
  'Kitchen',
  'Desk',
  'Textiles',
];

type BaseProduct = {
  name: string;
  category: Category;
  price: number;
  tint: string;
  shape: Shape;
  description: string;
};

/** Deterministic mock catalog. Prices in euro. */
export const BASE_PRODUCTS: readonly BaseProduct[] = [
  {
    name: 'Ceramic Mug',
    category: 'Kitchen',
    price: 18,
    tint: '#F3E4D6',
    shape: 'circle',
    description: 'Stoneware with a soft matte glaze.',
  },
  {
    name: 'Linen Tote',
    category: 'Textiles',
    price: 32,
    tint: '#E2E8DA',
    shape: 'square',
    description: 'Washed linen, sized for groceries.',
  },
  {
    name: 'Desk Lamp',
    category: 'Desk',
    price: 64,
    tint: '#DCE4F2',
    shape: 'arch',
    description: 'Warm, dimmable light for late work.',
  },
  {
    name: 'Notebook Set',
    category: 'Desk',
    price: 14,
    tint: '#ECE4F5',
    shape: 'square',
    description: 'Three dotted notebooks, lay-flat.',
  },
  {
    name: 'Wool Throw',
    category: 'Textiles',
    price: 89,
    tint: '#F2DCDB',
    shape: 'pill',
    description: 'Heavy merino for cold evenings.',
  },
  {
    name: 'Glass Carafe',
    category: 'Kitchen',
    price: 27,
    tint: '#D7EEE9',
    shape: 'arch',
    description: 'Borosilicate, one litre.',
  },
  {
    name: 'Plant Pot',
    category: 'Home',
    price: 22,
    tint: '#E5EBD4',
    shape: 'circle',
    description: 'Terracotta with a drainage tray.',
  },
  {
    name: 'Wall Clock',
    category: 'Home',
    price: 45,
    tint: '#E8E5F7',
    shape: 'circle',
    description: 'Silent sweep, no ticking.',
  },
  {
    name: 'Pen Set',
    category: 'Desk',
    price: 12,
    tint: '#F4ECD5',
    shape: 'pill',
    description: 'Two fineliners and a brush pen.',
  },
  {
    name: 'Table Runner',
    category: 'Textiles',
    price: 29,
    tint: '#DCE7EF',
    shape: 'pill',
    description: 'Woven cotton, 180 cm long.',
  },
  {
    name: 'Salad Bowl',
    category: 'Kitchen',
    price: 36,
    tint: '#F1E5DA',
    shape: 'arch',
    description: 'Turned acacia wood.',
  },
  {
    name: 'Candle Duo',
    category: 'Home',
    price: 24,
    tint: '#F6E7DF',
    shape: 'square',
    description: 'Soy wax, fig and cedar.',
  },
];

/** Color variants used when the catalog is repeated past the 12 base products. */
const VARIANTS = [
  'Slate',
  'Moss',
  'Sand',
  'Ink',
  'Rust',
  'Fog',
  'Olive',
  'Navy',
  'Coal',
  'Rose',
  'Sage',
  'Clay',
  'Pearl',
  'Smoke',
  'Plum',
  'Ochre',
  'Teal',
  'Stone',
  'Berry',
  'Dune',
];

export type Product = {
  id: number;
  name: string;
  category: Category;
  price: number;
  tint: string;
  shape: Shape;
  description: string;
};

export function buildCatalog(itemCount: number): Product[] {
  const out: Product[] = [];
  for (let i = 0; i < itemCount; i++) {
    const base = BASE_PRODUCTS[i % BASE_PRODUCTS.length]!;
    const round = Math.floor(i / BASE_PRODUCTS.length);
    out.push({
      id: i,
      name: round === 0 ? base.name : `${base.name}, ${VARIANTS[(round - 1) % VARIANTS.length]}`,
      category: base.category,
      price: base.price,
      tint: base.tint,
      shape: base.shape,
      description: base.description,
    });
  }
  return out;
}

export type CatalogQuery = { query: string; category: CategoryFilter };

export function filterCatalog(
  products: readonly Product[],
  { query, category }: CatalogQuery,
): Product[] {
  const q = query.trim().toLowerCase();
  return products.filter(
    (p) =>
      (category === 'All' || p.category === category) &&
      (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)),
  );
}

export type MutationSettings = { contentLength: number; textExpansion: number };

/** Display copy with the UI-mutation experiments applied. Plain strings only. */
export function presentProduct(
  p: Product,
  m: MutationSettings,
): { name: string; description: string } {
  return {
    name: expandText(p.name, m.textExpansion),
    description: expandText(
      appendFiller(p.description, m.contentLength),
      Math.round(m.textExpansion / 2),
    ),
  };
}

export function productsPath({ query, category }: CatalogQuery, limit: number): string {
  const params = new URLSearchParams({ category: category.toLowerCase() });
  if (query) params.set('q', query);
  params.set('limit', String(limit));
  return `/api/products?${params.toString()}`;
}
