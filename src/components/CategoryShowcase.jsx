import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { SHOP_CATEGORIES } from '../lib/categories'
import { getSitePhoto } from '../lib/sitePhotos'
import { SectionHeading } from './ProductCard'

export function CategoryShowcase({ products = [] }) {
  const counts = Object.fromEntries(
    SHOP_CATEGORIES.map((cat) => [
      cat.id,
      products.filter((p) => p.categoryId === cat.id).length,
    ]),
  )

  return (
    <section className="section-shell py-16 md:py-20">
      <SectionHeading
        eyebrow="Categories"
        title="Shop by Ritual"
        description="Perfumes, nails, nail accessories, and hair care — curated for modern beauty."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SHOP_CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const count = counts[cat.id] || 0
          const categoryPhoto = getSitePhoto(cat.id)

          return (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.id}`}
              className="group relative flex min-h-[19rem] flex-col overflow-hidden rounded-3xl border border-white/55 shadow-[0_10px_36px_rgba(74,59,61,0.08)] transition duration-500 hover:-translate-y-1"
            >
              {categoryPhoto ? (
                <img
                  src={categoryPhoto}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full object-cover object-center transition duration-700 group-hover:scale-[1.04]"
                  loading="lazy"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient}`} />
              )}

              <div
                className={`absolute inset-0 transition duration-500 ${
                  categoryPhoto
                    ? 'bg-gradient-to-t from-moonberry-brown/75 via-moonberry-brown/20 to-transparent group-hover:from-moonberry-brown/65'
                    : `bg-gradient-to-br opacity-95 ${cat.gradient}`
                }`}
              />

              <div
                className={`relative mt-auto p-6 ${
                  categoryPhoto ? 'text-white' : 'text-moonberry-brown'
                }`}
              >
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl backdrop-blur-sm ${
                    categoryPhoto
                      ? 'border border-white/30 bg-white/15 text-white'
                      : 'glass-icon'
                  }`}
                >
                  <Icon size={18} aria-hidden />
                </span>
                <h3 className="mt-4 font-serif text-2xl">{cat.label}</h3>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    categoryPhoto ? 'text-white/80' : 'text-moonberry-mauve'
                  }`}
                >
                  {cat.description}
                </p>
                <p
                  className={`mt-4 text-[10px] uppercase tracking-[0.18em] ${
                    categoryPhoto ? 'text-white/60' : 'text-moonberry-mauve/80'
                  }`}
                >
                  {count > 0 ? `${count} product${count === 1 ? '' : 's'}` : 'Explore'}
                </p>
                <span
                  className={`mt-4 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.14em] opacity-0 transition duration-300 group-hover:opacity-100 ${
                    categoryPhoto ? 'text-white/90' : 'text-moonberry-brown'
                  }`}
                >
                  Shop now
                  <ArrowUpRight size={14} aria-hidden />
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
