import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { formatINR } from '../lib/currency'

function SwatchRow({ shades = [] }) {
  if (!shades.length) return null

  return (
    <div className="mt-3 flex items-center gap-1.5">
      {shades.slice(0, 4).map((shade) => (
        <span
          key={shade}
          className="h-4 w-4 rounded-full border border-white/90 shadow-sm ring-1 ring-moonberry-rose/15"
          style={{ backgroundColor: shade }}
          aria-hidden
        />
      ))}
    </div>
  )
}

export function ProductCard({ product, onQuickAdd }) {
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  return (
    <article className="group card-surface p-3 transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_22px_60px_rgba(74,59,61,0.13)]">
      <div className="relative overflow-hidden rounded-2xl bg-moonberry-cream/40">
        <Link to={`/product/${product.slug}`} className="relative block">
          <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
            {product.bestSeller ? (
              <span className="rounded-full bg-moonberry-brown px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white shadow-sm">
                Bestseller
              </span>
            ) : null}
            {hasDiscount ? (
              <span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-moonberry-brown shadow-sm">
                {discountPercent}% Off
              </span>
            ) : null}
          </div>
          <img
            src={product.images[0]}
            alt={product.name}
            className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.04]"
            loading="lazy"
          />
        </Link>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-moonberry-brown/40 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
        <button
          type="button"
          onClick={() => onQuickAdd(product)}
          className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 translate-y-3 items-center gap-2 rounded-full border border-white/60 bg-white/75 px-5 py-2.5 text-[10px] font-medium uppercase tracking-[0.14em] text-moonberry-brown opacity-0 shadow-lg backdrop-blur-md transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-white/90"
        >
          <ShoppingBag size={14} aria-hidden />
          Quick add
        </button>
      </div>
      <div className="px-1 pb-2 pt-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-moonberry-mauve">
              {product.category}
            </p>
            <h3 className="mt-1 font-serif text-2xl leading-tight text-moonberry-brown">
              <Link to={`/product/${product.slug}`} className="transition hover:text-moonberry-rose">
                {product.name}
              </Link>
            </h3>
          </div>
          <div className="shrink-0 text-right">
            <span className="font-serif text-lg text-moonberry-brown">{formatINR(product.price)}</span>
            {hasDiscount ? (
              <p className="text-xs text-moonberry-mauve line-through">
                {formatINR(product.compareAtPrice)}
              </p>
            ) : null}
          </div>
        </div>
        <SwatchRow shades={product.shadeHex} />
        <button type="button" onClick={() => onQuickAdd(product)} className="btn-ghost mt-4 w-full">
          Add to Bag
        </button>
      </div>
    </article>
  )
}

export function SectionHeading({ eyebrow, title, description, align = 'left', action }) {
  const centered = align === 'center'

  return (
    <header
      className={`mb-12 ${centered ? 'mx-auto max-w-3xl text-center' : 'flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'}`}
    >
      <div className={`max-w-3xl ${centered ? 'mx-auto' : ''}`}>
        {eyebrow ? (
          <p className={`eyebrow ${centered ? 'eyebrow-center' : ''}`}>{eyebrow}</p>
        ) : null}
        <h2 className="font-serif text-4xl leading-[1.02] text-moonberry-brown md:text-5xl">{title}</h2>
        {description ? (
          <p className={`mt-4 text-base leading-relaxed text-moonberry-mauve ${centered ? 'mx-auto' : ''}`}>
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className={centered ? 'mt-6 flex justify-center' : 'shrink-0'}>{action}</div> : null}
    </header>
  )
}
