import { Link } from 'react-router-dom'
import { formatINR } from '../lib/currency'

function SwatchRow({ shades = [] }) {
  if (!shades.length) return null

  return (
    <div className="mt-3 flex items-center gap-2">
      {shades.slice(0, 4).map((shade) => (
        <span
          key={shade}
          className="h-4 w-4 rounded-full border border-white/80 shadow-sm"
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
    <article className="group rounded-3xl border border-white/60 bg-white/70 p-3 soft-shadow transition duration-500 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(74,59,61,0.16)]">
      <Link to={`/product/${product.slug}`} className="relative block overflow-hidden rounded-2xl">
        <div className="absolute left-3 top-3 z-10 flex gap-2">
          {product.bestSeller ? (
            <span className="rounded-full bg-moonberry-brown px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-white">
              Bestseller
            </span>
          ) : null}
          {hasDiscount ? (
            <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-moonberry-brown">
              {discountPercent}% Off
            </span>
          ) : null}
        </div>
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-[360px] w-full object-cover transition duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </Link>
      <div className="px-1 pb-2 pt-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-2xl leading-tight text-moonberry-brown">
              <Link to={`/product/${product.slug}`}>{product.name}</Link>
            </h3>
            <p className="text-xs uppercase tracking-[0.15em] text-moonberry-mauve">
              {product.collection}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-moonberry-brown/70">
              {product.category}
            </p>
          </div>
          <div className="text-right">
            <span className="text-moonberry-brown">{formatINR(product.price)}</span>
            {hasDiscount ? (
              <p className="text-xs text-moonberry-mauve line-through">{formatINR(product.compareAtPrice)}</p>
            ) : null}
          </div>
        </div>
        <SwatchRow shades={product.shadeHex} />
        <button
          type="button"
          onClick={() => onQuickAdd(product)}
          className="mt-3 w-full rounded-full border border-moonberry-rose/40 px-4 py-2 text-sm tracking-[0.11em] uppercase transition hover:bg-moonberry-brown hover:text-white"
        >
          Add to Bag
        </button>
      </div>
    </article>
  )
}

export function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-10 max-w-3xl">
      <p className="mb-3 text-xs uppercase tracking-[0.28em] text-moonberry-mauve">{eyebrow}</p>
      <h2 className="font-serif text-4xl leading-[1] text-moonberry-brown md:text-5xl">{title}</h2>
      {description ? <p className="mt-3 text-moonberry-mauve">{description}</p> : null}
    </div>
  )
}
