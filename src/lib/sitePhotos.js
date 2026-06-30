/**
 * Site photos — drop files in public/photos/ and set filenames here.
 *
 * Examples:
 *   hero: 'hero.jpg'           → served as /photos/hero.jpg
 *   story: 'story.webp'
 *   categories.perfumes: 'categories/perfumes.jpg'
 *
 * Leave a slot as '' to skip it (gradient / product image fallback is used).
 * Optional env override: VITE_SITE_PHOTO_HERO=/photos/my-hero.jpg
 */

import { SHOP_CATEGORIES } from './categories.js'

const PHOTOS_BASE = '/photos'

export const SITE_PHOTOS = {
  hero: '',
  story: '',
  about: '',
  shop: '',
  contact: '',
  categories: {
    perfumes: '',
    nails: 'categories/nails.jpeg',
    'nail-accessories': '',
    'hair-care': 'categories/hair-care.jpeg',
  },
}

function envPhotoKey(slot) {
  return `VITE_SITE_PHOTO_${slot.toUpperCase().replace(/-/g, '_')}`
}

function fromEnv(slot) {
  const value = import.meta.env[envPhotoKey(slot)]?.trim()
  return value || null
}

function toPublicPath(filename) {
  if (!filename?.trim()) return null
  const trimmed = filename.trim()
  if (trimmed.startsWith('/')) return trimmed
  return `${PHOTOS_BASE}/${trimmed.replace(/^\//, '')}`
}

/**
 * Resolve a photo slot to a public URL, or return fallback when unset.
 * @param {'hero'|'story'|'about'|'shop'|'contact'|string} slot
 * @param {string|null|undefined} fallback
 */
export function getSitePhoto(slot, fallback = null) {
  const envValue = fromEnv(slot)
  if (envValue) return envValue

  const categoryFile = SITE_PHOTOS.categories?.[slot]
  if (categoryFile !== undefined) {
    const path = toPublicPath(categoryFile)
    if (path) return path
    return fallback
  }

  const file = SITE_PHOTOS[slot]
  const path = toPublicPath(file)
  if (path) return path
  return fallback
}

export function hasSitePhoto(slot) {
  return Boolean(getSitePhoto(slot))
}

/**
 * Hero carousel slides — one per shop category.
 * Uses category site photo, then first product image in that category, then gradient fallback.
 */
export function getCategoryHeroSlides(products = []) {
  return SHOP_CATEGORIES.map((cat) => {
    const sitePhoto = getSitePhoto(cat.id)
    const productImage = products.find((product) => product.categoryId === cat.id)?.images?.[0]
    return {
      id: cat.id,
      label: cat.label,
      src: sitePhoto || productImage || null,
      gradient: cat.gradient,
      shopUrl: `/shop?category=${cat.id}`,
      objectPosition: cat.id === 'nails' ? 'center 20%' : 'center center',
    }
  })
}
