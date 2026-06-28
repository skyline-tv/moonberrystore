import { Droplets, Gem, Scissors, Sparkles } from 'lucide-react'

export const SHOP_CATEGORIES = [
  {
    id: 'perfumes',
    label: 'Perfumes',
    description: 'Signature scents and fine fragrances.',
    icon: Sparkles,
    gradient: 'from-[#f3e8e4] via-[#e8d5d8] to-[#d4b8bc]',
    keywords: ['perfume', 'fragrance', 'parfum', 'eau', 'cologne', 'scent', 'mist'],
  },
  {
    id: 'nails',
    label: 'Nails',
    description: 'Polishes, gels, and salon-quality colour.',
    icon: Droplets,
    gradient: 'from-[#f5eef0] via-[#ecdde3] to-[#dfb8c4]',
    keywords: ['nail polish', 'nail colour', 'nail color', 'gel nail', 'manicure', 'nails'],
  },
  {
    id: 'nail-accessories',
    label: 'Nail Accessories',
    description: 'Tools, art, and care essentials.',
    icon: Gem,
    gradient: 'from-[#f2eceb] via-[#e6d8dc] to-[#cdb0b8]',
    keywords: [
      'nail accessory',
      'nail accessories',
      'nail art',
      'nail tool',
      'cuticle',
      'nail file',
      'buffer',
      'nail kit',
    ],
  },
  {
    id: 'hair-care',
    label: 'Hair Care',
    description: 'Shampoos, treatments, and styling rituals.',
    icon: Scissors,
    gradient: 'from-[#f4f0ee] via-[#e9e0dc] to-[#d9c4bc]',
    keywords: ['hair', 'shampoo', 'conditioner', 'hair oil', 'hair serum', 'hair mask', 'styling'],
  },
]

const CATEGORY_BY_ID = Object.fromEntries(SHOP_CATEGORIES.map((c) => [c.id, c]))

export function getCategoryById(id) {
  return CATEGORY_BY_ID[id] || null
}

export function getCategoryLabel(id) {
  return CATEGORY_BY_ID[id]?.label || id
}

/** Map Shopify productType + tags + title to a canonical category id. */
export function resolveCategoryId(productType = '', tags = [], title = '') {
  const haystack = [productType, title, ...tags].join(' ').toLowerCase()

  // Nail accessories before generic nails
  const ordered = ['nail-accessories', 'nails', 'perfumes', 'hair-care']
  for (const id of ordered) {
    const cat = CATEGORY_BY_ID[id]
    if (cat.keywords.some((kw) => haystack.includes(kw.toLowerCase()))) {
      return id
    }
  }

  const type = productType.trim().toLowerCase()
  if (type) {
    for (const cat of SHOP_CATEGORIES) {
      if (cat.keywords.some((kw) => type.includes(kw) || kw.includes(type))) {
        return cat.id
      }
    }
  }

  return 'perfumes'
}

export function resolveCategory(productType = '', tags = [], title = '') {
  const id = resolveCategoryId(productType, tags, title)
  const meta = CATEGORY_BY_ID[id]
  return { categoryId: id, category: meta.label }
}

export function productMatchesCategory(product, categoryId) {
  if (!categoryId || categoryId === 'All') return true
  return product.categoryId === categoryId
}
