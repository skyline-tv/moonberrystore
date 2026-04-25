import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, Search, ShoppingBag, X } from 'lucide-react'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Collections', to: '/collections' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export function Navbar({ onOpenCart, onOpenMobile }) {
  const [scrolled, setScrolled] = useState(false)
  const [logoMissing, setLogoMissing] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="sticky top-0 z-40">
      <div
        className={`section-shell transition-all duration-500 ${
          scrolled ? 'pt-2 md:pt-3' : 'pt-4 md:pt-5'
        }`}
      >
        <div
          className={`relative flex items-center justify-between rounded-2xl border px-4 py-3 md:px-6 ${
            scrolled
              ? 'glass border-white/70 shadow-[0_8px_30px_rgba(74,59,61,0.12)]'
              : 'border-transparent bg-white/35 backdrop-blur-sm'
          } transition-all duration-500`}
        >
          <div className="flex min-w-[42px] items-center md:min-w-0 md:flex-1">
            <button
              type="button"
              className="inline-flex rounded-full border border-white/60 bg-white/60 p-2 text-moonberry-brown md:hidden"
              onClick={onOpenMobile}
              aria-label="Open mobile menu"
            >
              <Menu />
            </button>

            <Link to="/" className="hidden text-moonberry-brown md:block">
              {!logoMissing ? (
                <div className="flex items-center gap-3">
                  <img
                    src="/logo.png"
                    alt="Moonberry icon"
                    className="h-11 w-auto object-contain"
                    onError={() => setLogoMissing(true)}
                  />
                  <img
                    src="/namelogo.png"
                    alt="Moonberry"
                    className="h-8 w-auto object-contain"
                    onError={() => setLogoMissing(true)}
                  />
                </div>
              ) : (
                <span className="font-serif text-3xl tracking-wide">Moonberry</span>
              )}
            </Link>
          </div>

          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2 text-moonberry-brown md:hidden"
          >
            {!logoMissing ? (
              <div className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="Moonberry icon"
                  className="h-9 w-auto object-contain"
                  onError={() => setLogoMissing(true)}
                />
                <img
                  src="/namelogo.png"
                  alt="Moonberry"
                  className="h-4 w-auto object-contain"
                  onError={() => setLogoMissing(true)}
                />
              </div>
            ) : (
              <span className="font-serif text-3xl tracking-wide">Moonberry</span>
            )}
          </Link>

          <nav className="hidden items-center justify-center gap-7 md:absolute md:left-1/2 md:flex md:-translate-x-1/2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `relative pb-1 text-xs tracking-[0.2em] uppercase transition-colors ${
                    isActive
                      ? 'text-moonberry-brown after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-moonberry-brown'
                      : 'text-moonberry-mauve hover:text-moonberry-brown'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex min-w-[50px] items-center justify-end gap-2 md:min-w-0 md:flex-1 md:gap-3">
            <button
              type="button"
              className="hidden rounded-full border border-white/60 bg-white/65 p-2.5 text-moonberry-brown transition hover:bg-white md:inline-flex"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button
              type="button"
              className="rounded-full border border-white/60 bg-white/65 p-2.5 text-moonberry-brown transition hover:bg-white"
              onClick={onOpenCart}
              aria-label="Open cart"
            >
              <ShoppingBag size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export function MobileMenu({ open, onClose }) {
  return (
    <div
      className={`fixed inset-0 z-50 transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`absolute left-0 top-0 h-full w-80 border-r border-moonberry-rose/30 bg-moonberry-cream p-6 transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-10 flex items-center justify-between">
          <img src="/logo.png" alt="Moonberry icon" className="h-14 w-auto object-contain" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-full border border-moonberry-rose/40 p-2"
          >
            <X />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-lg ${
                  isActive ? 'bg-white/75 text-moonberry-brown' : 'text-moonberry-brown/90'
                }`
              }
              onClick={onClose}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </aside>
    </div>
  )
}

export function CartDrawer({ open, onClose, items = [] }) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)

  return (
    <div
      className={`fixed inset-0 z-50 transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-[#fffdfc] p-6 transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <h3 className="font-serif text-3xl">Your Cart</h3>
          <button type="button" onClick={onClose} aria-label="Close cart">
            <X />
          </button>
        </div>
        <div className="space-y-5">
          {items.length === 0 && <p className="text-moonberry-mauve">Your cart is currently empty.</p>}
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-2xl border border-moonberry-rose/30 p-3">
              <img src={item.image} alt={item.name} className="h-24 w-20 rounded-xl object-cover" />
              <div className="flex-1">
                <h4 className="font-medium text-moonberry-brown">{item.name}</h4>
                <p className="text-sm text-moonberry-mauve">Qty {item.qty}</p>
                <p className="mt-2">${item.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 border-t border-moonberry-rose/30 pt-5">
          <div className="mb-4 flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <button type="button" className="w-full rounded-full bg-moonberry-brown px-6 py-3 text-white transition hover:opacity-95">
            Checkout
          </button>
        </div>
      </aside>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-moonberry-rose/30 bg-white/70">
      <div className="section-shell grid gap-8 py-14 md:grid-cols-3">
        <div>
          <h3 className="font-serif text-3xl">Moonberry</h3>
          <p className="mt-2 max-w-sm text-sm text-moonberry-mauve">
            A modern luxury beauty brand crafted for soft femininity and refined self-care rituals.
          </p>
        </div>
        <div>
          <h4 className="text-xs tracking-[0.2em] uppercase text-moonberry-mauve">Customer Care</h4>
          <ul className="mt-3 space-y-2">
            <li>Shipping & Returns</li>
            <li>Ingredients & Usage</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs tracking-[0.2em] uppercase text-moonberry-mauve">Visit</h4>
          <p className="mt-3">support@moonberry.com</p>
          <p>Instagram: @moonberry</p>
        </div>
      </div>
    </footer>
  )
}
