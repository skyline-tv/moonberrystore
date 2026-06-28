import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export function Breadcrumbs({ items = [] }) {
  if (!items.length) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-1.5 text-sm text-moonberry-mauve">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
            {index > 0 ? <ChevronRight size={14} className="text-moonberry-rose/50" aria-hidden /> : null}
            {item.to && !isLast ? (
              <Link to={item.to} className="transition hover:text-moonberry-brown">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-moonberry-brown' : undefined}>{item.label}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}

export function PageHero({ eyebrow, title, description, align = 'left' }) {
  const centered = align === 'center'

  return (
    <header className={`page-hero ${centered ? 'mx-auto text-center' : ''}`}>
      {eyebrow ? <p className={`eyebrow ${centered ? 'eyebrow-center' : ''}`}>{eyebrow}</p> : null}
      <h1 className={`page-title ${centered ? 'mx-auto' : ''}`}>{title}</h1>
      {description ? (
        <p className={`page-description ${centered ? 'mx-auto' : ''}`}>{description}</p>
      ) : null}
    </header>
  )
}

export function EmptyState({ eyebrow, title, description, action }) {
  return (
    <div className="empty-state">
      {eyebrow ? <p className="eyebrow mx-auto">{eyebrow}</p> : null}
      <h2 className="font-serif text-3xl text-moonberry-brown md:text-4xl">{title}</h2>
      {description ? <p className="mt-3 text-moonberry-mauve">{description}</p> : null}
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  )
}

export function ProseArticle({ children }) {
  return <article className="prose-luxury mx-auto max-w-3xl">{children}</article>
}

export function LuxeAccordion({ items = [] }) {
  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {items.map((item) => (
        <details key={item.q} className="accordion-luxury group">
          <summary className="cursor-pointer list-none font-medium text-moonberry-brown [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-4">
              {item.q}
              <span className="text-moonberry-rose/60 transition group-open:rotate-45">+</span>
            </span>
          </summary>
          <p className="mt-4 text-sm leading-relaxed text-moonberry-mauve">{item.a}</p>
        </details>
      ))}
    </div>
  )
}

export function ContactCard({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-moonberry-rose/15 bg-white/60 p-5">
      {Icon ? (
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-moonberry-cream text-moonberry-rose">
          <Icon size={18} aria-hidden />
        </span>
      ) : null}
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-moonberry-mauve">{label}</p>
        <div className="mt-1 text-moonberry-brown">{children}</div>
      </div>
    </div>
  )
}

export function CheckoutSection({ step, title, children }) {
  return (
    <section className="checkout-section">
      <div className="mb-5 flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-moonberry-brown text-xs font-medium text-white">
          {step}
        </span>
        <h2 className="font-serif text-xl text-moonberry-brown">{title}</h2>
      </div>
      {children}
    </section>
  )
}
