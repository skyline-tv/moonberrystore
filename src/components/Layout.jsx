import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  CreditCard,
  Menu,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Search,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from 'lucide-react'
import { BrandMark } from './BrandMark'
import { formatINR } from '../lib/currency'
import { calculateOrderTotals } from '../lib/pricing'
import { CONTACT_EMAIL } from '../lib/site'
import { SHOP_CATEGORIES } from '../lib/categories'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'About', to: '/about' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact', to: '/contact' },
]

export function Navbar({
  onOpenCart,
  onOpenMobile,
  onOpenSearch,
  cartCount = 0,
  loggedIn = false,
  onLogout,
}) {
  const [scrolled, setScrolled] = useState(false)

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
          className={`glass relative flex items-center justify-between rounded-2xl border px-4 py-3 md:px-6 ${
            scrolled ? 'border-white/70 shadow-[0_10px_40px_rgba(74,59,61,0.1)]' : 'border-white/40'
          } transition-all duration-500`}
        >
          <div className="flex min-w-[42px] items-center md:min-w-0 md:flex-1">
            <button
              type="button"
              className="glass-icon inline-flex md:hidden"
              onClick={onOpenMobile}
              aria-label="Open mobile menu"
            >
              <Menu />
            </button>

            <Link to="/" className="hidden text-moonberry-brown md:block">
              <BrandMark size="md" />
            </Link>
          </div>

          <Link to="/" className="absolute left-1/2 -translate-x-1/2 text-moonberry-brown md:hidden">
            <BrandMark size="sm" />
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
            <div className="hidden items-center gap-3 md:flex">
              {loggedIn ? (
                <>
                  <NavLink
                    to="/account"
                    className={({ isActive }) =>
                      `whitespace-nowrap pb-1 text-xs tracking-[0.12em] uppercase transition-colors ${
                        isActive
                          ? 'text-moonberry-brown'
                          : 'text-moonberry-mauve hover:text-moonberry-brown'
                      }`
                    }
                  >
                    Account
                  </NavLink>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="whitespace-nowrap pb-1 text-xs tracking-[0.12em] uppercase text-moonberry-mauve transition hover:text-moonberry-brown"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="whitespace-nowrap pb-1 text-xs tracking-[0.12em] uppercase text-moonberry-mauve transition hover:text-moonberry-brown"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="whitespace-nowrap pb-1 text-xs tracking-[0.12em] uppercase text-moonberry-mauve transition hover:text-moonberry-brown"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
            <button
              type="button"
              className="glass-icon"
              onClick={onOpenSearch}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button
              type="button"
              className="glass-icon relative"
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
  const trustItems = [
    { icon: CreditCard, label: 'UPI & Cards' },
    { icon: Package, label: 'COD Available' },
    { icon: Truck, label: 'Free Shipping above Rs. 999' },
    { icon: RotateCcw, label: 'Easy 7-day Returns' },
  ]

  return (
    <div className="section-shell mt-2 md:mt-3">
      <div className="glass overflow-hidden rounded-2xl">
        <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 px-4 py-2.5">
          {trustItems.map((item, index) => (
            <span key={item.label} className="inline-flex items-center">
              {index > 0 ? <span className="divider-dot" aria-hidden /> : null}
              <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-moonberry-mauve sm:text-[11px]">
                <item.icon size={13} className="shrink-0 text-moonberry-rose/80" aria-hidden />
                {item.label}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function MobileMenu({ open, onClose, loggedIn = false, onLogout }) {
  return (
    <div
      className={`fixed inset-0 z-50 transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`absolute left-0 top-0 flex h-full w-[min(100vw,20rem)] flex-col border-r border-white/50 p-6 shadow-[8px_0_40px_rgba(74,59,61,0.08)] backdrop-blur-xl transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(24px) saturate(180%)',
        }}
      >
        <div className="mb-10 flex items-center justify-between">
          <BrandMark size="lg" />
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
                `rounded-xl px-4 py-3 font-serif text-xl transition ${
                  isActive ? 'glass font-medium text-moonberry-brown shadow-sm' : 'text-moonberry-brown/85 hover:bg-white/35'
                }`
              }
              onClick={onClose}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="mt-8 border-t border-moonberry-rose/25 pt-6">
            {loggedIn ? (
              <div className="flex flex-col gap-2">
                <NavLink
                  to="/account"
                  className="rounded-xl px-3 py-2 text-lg text-moonberry-brown/90"
                  onClick={onClose}
                >
                  Account
                </NavLink>
                <button
                  type="button"
                  className="rounded-xl px-3 py-2 text-left text-lg text-moonberry-brown/90"
                  onClick={() => {
                    onClose()
                    onLogout?.()
                  }}
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <NavLink
                  to="/login"
                  className="rounded-xl px-3 py-2 text-lg text-moonberry-brown/90"
                  onClick={onClose}
                >
                  Log in
                </NavLink>
                <NavLink
                  to="/signup"
                  className="rounded-xl px-3 py-2 text-lg text-moonberry-brown/90"
                  onClick={onClose}
                >
                  Sign up
                </NavLink>
              </div>
            )}
          </div>
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
        <div className="glass-strong mx-auto w-full max-w-3xl rounded-4xl p-6">
          <div className="glass flex items-center gap-3 rounded-2xl px-4">
            <Search size={18} className="text-moonberry-mauve" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search perfumes, nails, hair care..."
              className="input-field h-12 border-0 bg-transparent shadow-none focus:border-0 focus:shadow-none"
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
                  className="glass flex w-full items-center gap-4 rounded-2xl p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <img src={product.images[0]} alt={product.name} className="h-16 w-14 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="font-serif text-lg text-moonberry-brown">{product.name}</p>
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
  const { subtotal, shipping, gst, total } = calculateOrderTotals(
    items.map((item) => ({ price: item.price, qty: item.qty })),
  )
  const remainingForFreeShipping = Math.max(999 - subtotal, 0)

  return (
    <div
      className={`fixed inset-0 z-50 transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`glass-strong absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/50 p-6 shadow-[-12px_0_40px_rgba(74,59,61,0.08)] transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <h3 className="font-serif text-3xl text-moonberry-brown">Your Cart</h3>
          <button type="button" onClick={onClose} aria-label="Close cart">
            <X />
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto pr-1">
          {items.length === 0 && (
            <div className="empty-state border-dashed p-8">
              <p className="font-serif text-2xl text-moonberry-brown">Your bag is empty</p>
              <p className="mt-2 text-sm text-moonberry-mauve">Discover something beautiful to add.</p>
            </div>
          )}
          {items.map((item) => (
            <div key={item.lineId || item.id} className="glass flex gap-4 rounded-2xl p-4">
              <img src={item.image} alt={item.name} className="h-24 w-20 rounded-xl object-cover" />
              <div className="flex-1">
                <h4 className="font-serif text-lg leading-tight text-moonberry-brown">{item.name}</h4>
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
        <div className="mt-auto border-t border-moonberry-rose/30 pt-5">
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
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
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
          <p className="mt-3 text-center text-xs text-moonberry-mauve">
            Secure checkout powered by Shopify.
          </p>
        </div>
      </aside>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="glass-strong relative mt-28 overflow-hidden border-t border-white/40">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-moonberry-blush to-transparent" />
      <div className="section-shell grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <BrandMark size="md" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-moonberry-mauve">
            Perfumes, nails, nail accessories, and hair care — curated with boutique-quality care.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-medium tracking-[0.2em] uppercase text-moonberry-mauve">Shop</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-moonberry-brown">
            <li>
              <Link to="/shop" className="transition hover:text-moonberry-rose">
                All products
              </Link>
            </li>
            {SHOP_CATEGORIES.map((cat) => (
              <li key={cat.id}>
                <Link to={`/shop?category=${cat.id}`} className="transition hover:text-moonberry-rose">
                  {cat.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/about" className="transition hover:text-moonberry-rose">
                About us
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-medium tracking-[0.2em] uppercase text-moonberry-mauve">Customer Care</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-moonberry-brown">
            <li>
              <Link to="/shipping-returns" className="transition hover:text-moonberry-rose">
                Shipping & returns
              </Link>
            </li>
            <li>
              <Link to="/ingredients" className="transition hover:text-moonberry-rose">
                Ingredients & usage
              </Link>
            </li>
            <li>
              <Link to="/faq" className="transition hover:text-moonberry-rose">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="transition hover:text-moonberry-rose">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="transition hover:text-moonberry-rose">
                Terms of use
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-medium tracking-[0.2em] uppercase text-moonberry-mauve">Connect</h4>
          <p className="mt-4 text-sm text-moonberry-brown">
            <a href={`mailto:${CONTACT_EMAIL}`} className="transition hover:text-moonberry-rose">
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </div>
      <div className="glass-strong border-t border-white/40">
        <div className="section-shell flex flex-col items-center justify-between gap-2 py-5 text-center text-xs text-moonberry-mauve sm:flex-row sm:text-left">
          <p>&copy; {new Date().getFullYear()} Moonberry. All rights reserved.</p>
          <p className="tracking-wide">Crafted with care in India</p>
        </div>
      </div>
    </footer>
  )
}

export function CatalogSkeleton() {
  return (
    <div className="section-shell py-16">
      <div className="mx-auto mb-12 max-w-md">
        <div className="skeleton h-3 w-24 rounded-full" />
        <div className="skeleton mt-4 h-10 w-full rounded-xl" />
        <div className="skeleton mt-3 h-4 w-3/4 rounded-lg" />
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="card-surface p-3">
            <div className="skeleton h-[320px] rounded-2xl" />
            <div className="mt-4 space-y-2 px-1">
              <div className="skeleton h-5 w-2/3 rounded-lg" />
              <div className="skeleton h-3 w-1/3 rounded-lg" />
              <div className="skeleton mt-4 h-10 w-full rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
