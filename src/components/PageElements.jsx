import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export function Breadcrumbs({ items = [] }) {
  if (!items.length) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className="glass mb-8 inline-flex flex-wrap items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm text-moonberry-mauve"
    >
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

export function PageHero({ eyebrow, title, description, align = 'left', image, imageAlt }) {
  const centered = align === 'center'

  const textBlock = (
    <div className={centered ? 'text-center' : ''}>
      {eyebrow ? <p className={`eyebrow ${centered ? 'eyebrow-center' : ''}`}>{eyebrow}</p> : null}
      <h1 className={`page-title ${centered ? 'mx-auto' : ''}`}>{title}</h1>
      {description ? (
        <p className={`page-description ${centered ? 'mx-auto' : ''}`}>{description}</p>
      ) : null}
    </div>
  )

  if (image) {
    return (
      <header
        className={`page-hero mb-10 grid items-center gap-8 md:grid-cols-2 md:gap-10 ${
          centered ? 'text-center md:text-left' : ''
        }`}
      >
        <div className="glass-strong rounded-4xl p-8 md:p-10">{textBlock}</div>
        <img
          src={image}
          alt={imageAlt || title}
          className="soft-shadow h-[min(320px,50vh)] w-full rounded-4xl object-cover object-center md:h-[min(420px,55vh)]"
        />
      </header>
    )
  }

  return (
    <header className={`page-hero mb-10 ${centered ? 'mx-auto max-w-3xl' : ''}`}>
      <div className={`glass-strong rounded-4xl p-8 md:p-10 ${centered ? 'text-center' : ''}`}>
        {textBlock}
      </div>
    </header>
  )
}

export function PageLoading({ message = 'Loading…' }) {
  return (
    <div className="glass-strong mx-auto flex min-h-[30vh] max-w-lg items-center justify-center rounded-4xl p-10 text-center">
      <p className="text-moonberry-mauve">{message}</p>
    </div>
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
    <div className="glass flex gap-4 rounded-3xl p-5 transition duration-300 hover:-translate-y-0.5">
      {Icon ? (
        <span className="glass-icon shrink-0">
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
    <section className="glass-strong rounded-3xl p-6 md:p-8">
      <div className="mb-5 flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-moonberry-brown text-xs font-medium text-white shadow-sm">
          {step}
        </span>
        <h2 className="font-serif text-xl text-moonberry-brown md:text-2xl">{title}</h2>
      </div>
      {children}
    </section>
  )
}
