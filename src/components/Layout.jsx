import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, Minus, Plus, Search, ShoppingBag, Trash2, X } from 'lucide-react'
import { formatINR } from '../lib/currency'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Collections', to: '/collections' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export function Navbar({
  onOpenCart,
  onOpenMobile,
  onOpenSearch,
  cartCount = 0,
}) {
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
                </div>
              ) : (
                <span className="sr-only">Moonberry</span>
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
              </div>
            ) : (
              <span className="sr-only">Moonberry</span>
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
              className="rounded-full border border-white/60 bg-white/65 p-2.5 text-moonberry-brown transition hover:bg-white"
              onClick={onOpenSearch}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button
              type="button"
              className="relative rounded-full border border-white/60 bg-white/65 p-2.5 text-moonberry-brown transition hover:bg-white"
              onClick={onOpenCart}
              aria-label="Open cart"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-moonberry-brown px-1 text-[10px] font-medium text-white">
                  {cartCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export function IndiaTrustBar() {
  const trustItems = ['UPI & Cards', 'COD Available', 'Free Shipping above Rs. 999', 'Easy 7-day Returns']

  return (
    <div className="section-shell mt-3">
      <div className="rounded-2xl border border-moonberry-rose/25 bg-white/70 px-4 py-2">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[11px] uppercase tracking-[0.14em] text-moonberry-mauve">
          {trustItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </div>
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

export function SearchModal({
  open,
  onClose,
  products = [],
  onSelectProduct,
}) {
  const [query, setQuery] = useState('')
  const handleClose = () => {
    setQuery('')
    onClose()
  }

  const visibleProducts = products
    .filter((product) =>
      `${product.name} ${product.category} ${product.collection}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
    )
    .slice(0, 6)

  return (
    <div
      className={`fixed inset-0 z-50 transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      <div
        className={`section-shell absolute inset-x-0 top-24 transition duration-300 ${open ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`}
      >
        <div className="mx-auto w-full max-w-3xl rounded-3xl border border-moonberry-rose/30 bg-white p-5 shadow-xl">
          <div className="flex items-center gap-3 rounded-2xl border border-moonberry-rose/30 px-4">
            <Search size={18} className="text-moonberry-mauve" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search perfumes, skincare, makeup..."
              className="h-12 w-full outline-none"
            />
            <button type="button" onClick={handleClose} aria-label="Close search">
              <X size={18} />
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {visibleProducts.length > 0 ? (
              visibleProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    setQuery('')
                    onSelectProduct(product.slug)
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-moonberry-rose/25 p-3 text-left transition hover:bg-moonberry-cream"
                >
                  <img src={product.images[0]} alt={product.name} className="h-14 w-12 rounded-md object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-moonberry-brown">{product.name}</p>
                    <p className="text-xs uppercase tracking-wide text-moonberry-mauve">{product.category}</p>
                  </div>
                  <p className="text-sm text-moonberry-brown">{formatINR(product.price)}</p>
                </button>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-moonberry-rose/40 p-4 text-sm text-moonberry-mauve">
                No matching products. Try a different keyword.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function CartDrawer({
  open,
  onClose,
  items = [],
  onQtyChange,
  onRemove,
  onClearCart,
  onCheckout,
}) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const freeShippingThreshold = 999
  const remainingForFreeShipping = Math.max(freeShippingThreshold - subtotal, 0)
  const shipping = subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : 99
  const gst = Math.round(subtotal * 0.18)
  const total = subtotal + shipping

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
          {items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-moonberry-rose/40 bg-white/80 p-5 text-center">
              <p className="text-moonberry-mauve">Your cart is currently empty.</p>
              <p className="mt-1 text-sm text-moonberry-mauve">Add your beauty picks to continue checkout.</p>
            </div>
          )}
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-2xl border border-moonberry-rose/30 p-3">
              <img src={item.image} alt={item.name} className="h-24 w-20 rounded-xl object-cover" />
              <div className="flex-1">
                <h4 className="font-medium text-moonberry-brown">{item.name}</h4>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-moonberry-rose/40"
                    onClick={() => onQtyChange(item.id, item.qty - 1)}
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm text-moonberry-mauve">Qty {item.qty}</span>
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-moonberry-rose/40"
                    onClick={() => onQtyChange(item.id, item.qty + 1)}
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    type="button"
                    className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full border border-moonberry-rose/40 text-moonberry-mauve"
                    onClick={() => onRemove(item.id)}
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="mt-2">{formatINR(item.price)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 border-t border-moonberry-rose/30 pt-5">
          <div className="mb-4 rounded-xl bg-moonberry-cream px-3 py-2 text-sm text-moonberry-brown">
            {remainingForFreeShipping > 0
              ? `${formatINR(remainingForFreeShipping)} away from free shipping in India`
              : 'You unlocked free shipping in India'}
          </div>
          <div className="mb-4 flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-medium">{formatINR(subtotal)}</span>
          </div>
          <div className="mb-2 flex items-center justify-between text-sm text-moonberry-mauve">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : formatINR(shipping)}</span>
          </div>
          <div className="mb-4 flex items-center justify-between text-sm text-moonberry-mauve">
            <span>Estimated GST (18%)</span>
            <span>{formatINR(gst)}</span>
          </div>
          <div className="mb-5 flex items-center justify-between border-t border-moonberry-rose/30 pt-4">
            <span className="font-medium">Total</span>
            <span className="text-lg font-semibold">{formatINR(total)}</span>
          </div>
          <p className="mb-4 text-xs text-moonberry-mauve">Final GST and shipping are confirmed at checkout.</p>
          <button
            type="button"
            disabled={items.length === 0}
            onClick={onCheckout}
            className="w-full rounded-full bg-moonberry-brown px-6 py-3 text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Proceed to Checkout
          </button>
          <button
            type="button"
            onClick={onClearCart}
            className="mt-2 w-full rounded-full border border-moonberry-rose/40 px-6 py-3 text-sm text-moonberry-brown transition hover:bg-moonberry-cream"
          >
            Clear Cart
          </button>
          <p className="mt-3 text-center text-xs text-moonberry-mauve">Pay securely via UPI, cards, net banking and wallets.</p>
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
            A modern beauty brand crafted for all identities, with refined self-care rituals.
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
