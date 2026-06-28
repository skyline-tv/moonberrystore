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
              className="glass-category group relative overflow-hidden rounded-3xl p-6 transition duration-500 hover:-translate-y-1"
            >
              {categoryPhoto ? (
                <img
                  src={categoryPhoto}
                  alt=""
                  aria-hidden
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-35 transition duration-500 group-hover:opacity-45"
                />
              ) : null}
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80 ${cat.gradient} transition duration-500 group-hover:opacity-100`}
              />
              <div className="relative">
                <span className="glass-icon inline-flex">
                  <Icon size={20} aria-hidden />
                </span>
                <h3 className="mt-5 font-serif text-2xl text-moonberry-brown">{cat.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-moonberry-mauve">{cat.description}</p>
                <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-moonberry-mauve/80">
                  {count > 0 ? `${count} product${count === 1 ? '' : 's'}` : 'Explore'}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.14em] text-moonberry-brown opacity-0 transition duration-300 group-hover:opacity-100">
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
