import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Outlet, useNavigate, useOutletContext } from 'react-router-dom'
import { ArrowRight, LogOut, MapPin, Package, ShoppingBag, User } from 'lucide-react'
import { BrandMark } from '../components/BrandMark'
import { EmptyState, PageHero } from '../components/PageElements'
import {
  fetchCustomerAccountDetails,
  hasShopifyConfig,
  requestCustomerPasswordReset,
} from '../lib/shopify'

function AuthShell({ title, description, children }) {
  return (
    <main className="page-main">
      <div className="glass-strong grid min-h-[70vh] overflow-hidden rounded-4xl lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between hero-panel rounded-none border-0 lg:flex">
          <BrandMark size="lg" />
          <div>
            <p className="eyebrow">Your beauty ritual</p>
            <h2 className="mt-2 font-serif text-4xl leading-tight text-moonberry-brown md:text-5xl">{title}</h2>
            {description ? <p className="mt-4 max-w-sm leading-relaxed text-moonberry-mauve">{description}</p> : null}
          </div>
          <p className="text-sm text-moonberry-mauve/80">Orders, addresses, and account details in one place.</p>
        </div>
        <div className="flex flex-col justify-center p-8 md:p-12">
          <div className="mb-8 lg:hidden">
            <BrandMark size="md" className="mb-6" />
            <p className="eyebrow">Account</p>
            <h1 className="mt-2 font-serif text-3xl text-moonberry-brown">{title}</h1>
            {description ? <p className="mt-3 text-sm leading-relaxed text-moonberry-mauve">{description}</p> : null}
          </div>
          <div className="mx-auto w-full max-w-md">{children}</div>
        </div>
      </div>
    </main>
  )
}

export function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState({ type: '', message: '' })
  const [busy, setBusy] = useState(false)

  if (!hasShopifyConfig) {
    return (
      <main className="page-main">
        <EmptyState
          eyebrow="Account"
          title="Log in unavailable"
          description="Account login is not available right now. Please try again later."
        />
      </main>
    )
  }

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in with the email and password for your Moonberry account."
    >
      <form
        className="glass-strong space-y-4 p-8"
        onSubmit={async (event) => {
          event.preventDefault()
          setStatus({ type: '', message: '' })
          if (!email.includes('@') || password.length < 1) {
            setStatus({ type: 'error', message: 'Enter a valid email and password.' })
            return
          }
          setBusy(true)
          try {
            await onLogin({ email: email.trim(), password })
            navigate('/account')
          } catch (err) {
            setStatus({
              type: 'error',
              message: err?.message || 'Could not log in. Check your credentials.',
            })
          } finally {
            setBusy(false)
          }
        }}
      >
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-moonberry-mauve">Email</label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-moonberry-mauve">
            Password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-moonberry-brown underline underline-offset-[3px]">
            Forgot password?
          </Link>
        </div>
        <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
          {busy ? 'Signing in...' : 'Log in'}
        </button>
      </form>
      {status.message ? (
        <p
          className={`mt-4 text-sm ${status.type === 'error' ? 'text-red-600' : 'text-moonberry-mauve'}`}
          aria-live="polite"
        >
          {status.message}
        </p>
      ) : null}
      <p className="mt-6 text-center text-sm text-moonberry-mauve">
        No account yet?{' '}
        <Link to="/signup" className="font-medium text-moonberry-brown underline underline-offset-[3px]">
          Create one
        </Link>
      </p>
    </AuthShell>
  )
}

export function SignupPage({ onSignup }) {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState({ type: '', message: '' })
  const [busy, setBusy] = useState(false)

  if (!hasShopifyConfig) {
    return (
      <main className="page-main">
        <EmptyState
          eyebrow="Account"
          title="Sign up unavailable"
          description="Account sign up is not available right now. Please try again later."
        />
      </main>
    )
  }

  return (
    <AuthShell
      title="Join Moonberry"
      description="Create your account to track orders, save addresses, and shop faster."
    >
      <form
        className="glass-strong space-y-4 p-8"
        onSubmit={async (event) => {
          event.preventDefault()
          setStatus({ type: '', message: '' })
          if (!email.includes('@') || password.length < 5) {
            setStatus({
              type: 'error',
              message: 'Use a valid email and a password of at least 5 characters.',
            })
            return
          }
          setBusy(true)
          try {
            await onSignup({
              email: email.trim(),
              password,
              firstName: firstName.trim(),
              lastName: lastName.trim(),
            })
            navigate('/account')
          } catch (err) {
            setStatus({
              type: 'error',
              message: err?.message || 'Could not create account. Try a different email.',
            })
          } finally {
            setBusy(false)
          }
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-moonberry-mauve">
              First name
            </label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-moonberry-mauve">
              Last name
            </label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-field" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-moonberry-mauve">Email</label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-moonberry-mauve">
            Password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
        </div>
        <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
          {busy ? 'Creating...' : 'Create account'}
        </button>
      </form>
      {status.message ? (
        <p
          className={`mt-4 text-sm ${status.type === 'error' ? 'text-red-600' : 'text-moonberry-mauve'}`}
          aria-live="polite"
        >
          {status.message}
        </p>
      ) : null}
      <p className="mt-6 text-center text-sm text-moonberry-mauve">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-moonberry-brown underline underline-offset-[3px]">
          Log in
        </Link>
      </p>
    </AuthShell>
  )
}

const accountNavClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
    isActive
      ? 'glass bg-white/55 font-medium text-moonberry-brown shadow-sm'
      : 'text-moonberry-mauve hover:bg-white/35 hover:text-moonberry-brown'
  }`

function customerDisplayName(customer) {
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim()
  return name || customer.email
}

function customerInitials(customer) {
  const first = customer.firstName?.trim()?.[0] || ''
  const last = customer.lastName?.trim()?.[0] || ''
  if (first || last) return `${first}${last}`.toUpperCase()
  return customer.email?.[0]?.toUpperCase() || 'M'
}

function AccountHeader({ customer }) {
  const displayName = customerDisplayName(customer)

  return (
    <div className="glass-strong mb-8 rounded-4xl p-6 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/50 font-serif text-xl text-moonberry-brown shadow-sm backdrop-blur-sm">
            {customerInitials(customer)}
          </span>
          <div>
            <p className="eyebrow">My account</p>
            <h1 className="font-serif text-3xl text-moonberry-brown md:text-4xl">{displayName}</h1>
            <p className="mt-1 text-sm text-moonberry-mauve">{customer.email}</p>
          </div>
        </div>
        <Link to="/shop" className="btn-secondary shrink-0">
          Continue shopping
        </Link>
      </div>
    </div>
  )
}

function AccountNav({ onLogout }) {
  const links = [
    { to: '/account', end: true, label: 'Profile', icon: User },
    { to: '/account/orders', label: 'Orders', icon: Package },
    { to: '/account/addresses', label: 'Addresses', icon: MapPin },
  ]

  return (
    <nav className="glass-strong flex gap-1 overflow-x-auto rounded-2xl p-2 lg:flex-col lg:overflow-visible">
      {links.map((link) => (
        <NavLink key={link.to} to={link.to} end={link.end} className={accountNavClass}>
          <link.icon size={16} aria-hidden />
          {link.label}
        </NavLink>
      ))}
      <button
        type="button"
        onClick={onLogout}
        className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-moonberry-mauve transition hover:bg-white/35 hover:text-moonberry-brown lg:mt-1"
      >
        <LogOut size={16} aria-hidden />
        Log out
      </button>
    </nav>
  )
}

function AccountPageTitle({ eyebrow, title, description }) {
  return (
    <header className="mb-6">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="font-serif text-3xl text-moonberry-brown">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-relaxed text-moonberry-mauve">{description}</p> : null}
    </header>
  )
}

function AccountLoading({ message = 'Loading…' }) {
  return (
    <main className="page-main">
      <div className="glass-strong mx-auto max-w-lg rounded-3xl p-10 text-center">
        <p className="text-moonberry-mauve">{message}</p>
      </div>
    </main>
  )
}

function formatOrderMoney(amount, currencyCode) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode || 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${amount} ${currencyCode || ''}`
  }
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState({ type: '', message: '' })
  const [busy, setBusy] = useState(false)

  if (!hasShopifyConfig) {
    return (
      <main className="page-main">
        <EmptyState title="Reset unavailable" description="Please try again later." />
      </main>
    )
  }

  return (
    <main className="page-main">
      <PageHero
        eyebrow="Account"
        title="Forgot password"
        description="We'll email you a link to reset your password."
      />
      <div className="glass-strong mx-auto max-w-md rounded-4xl p-8">
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault()
            setStatus({ type: '', message: '' })
            if (!email.includes('@')) {
              setStatus({ type: 'error', message: 'Enter a valid email.' })
              return
            }
            setBusy(true)
            try {
              await requestCustomerPasswordReset(email.trim())
              setStatus({
                type: 'ok',
                message: 'If an account exists for that email, reset instructions will arrive shortly.',
              })
            } catch (err) {
              setStatus({ type: 'error', message: err?.message || 'Could not start reset. Try again later.' })
            } finally {
              setBusy(false)
            }
          }}
        >
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-moonberry-mauve">Email</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>
          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
            {busy ? 'Sending…' : 'Send reset email'}
          </button>
        </form>
        {status.message ? (
          <p
            className={`mt-4 text-sm ${status.type === 'error' ? 'text-red-600' : 'text-moonberry-mauve'}`}
            aria-live="polite"
          >
            {status.message}
          </p>
        ) : null}
        <p className="mt-6 text-center text-sm text-moonberry-mauve">
          <Link to="/login" className="text-moonberry-brown underline underline-offset-[3px]">
            Back to log in
          </Link>
        </p>
      </div>
    </main>
  )
}

export function AccountLayout({
  customer,
  sessionPending = false,
  customerToken,
  onLogout,
  catalogReady,
}) {
  if (!catalogReady) {
    return <AccountLoading message="Loading…" />
  }

  if (!hasShopifyConfig) {
    return (
      <main className="page-main">
        <EmptyState title="Account unavailable" description="Please try again later." />
      </main>
    )
  }

  if (sessionPending) {
    return <AccountLoading message="Loading your account…" />
  }

  if (!customer) {
    return <Navigate to="/login" replace />
  }

  return (
    <main className="page-main">
      <AccountHeader customer={customer} />
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="lg:w-56 lg:shrink-0 lg:sticky lg:top-28">
          <AccountNav onLogout={onLogout} />
        </aside>
        <div className="min-w-0 flex-1">
          <Outlet context={{ customer, customerToken, onLogout }} />
        </div>
      </div>
    </main>
  )
}

export function AccountOverviewPage() {
  const { customer } = useOutletContext()
  const displayName = customerDisplayName(customer)
  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim()

  const quickLinks = [
    {
      to: '/account/orders',
      label: 'Order history',
      description: 'Track purchases and order status',
      icon: Package,
    },
    {
      to: '/account/addresses',
      label: 'Saved addresses',
      description: 'Delivery addresses on your account',
      icon: MapPin,
    },
    {
      to: '/shop',
      label: 'Shop the catalog',
      description: 'Perfumes, nails, and hair care',
      icon: ShoppingBag,
    },
  ]

  return (
    <div>
      <AccountPageTitle
        eyebrow="Overview"
        title="Welcome back"
        description="Manage your profile, orders, and delivery details."
      />
      <div className="glass-strong mb-6 rounded-3xl p-6 md:p-8">
        <dl className="grid gap-6 sm:grid-cols-2">
          {fullName ? (
            <div>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-moonberry-mauve">Name</dt>
              <dd className="mt-1 font-serif text-xl text-moonberry-brown">{fullName}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-[11px] uppercase tracking-[0.16em] text-moonberry-mauve">Email</dt>
            <dd className="mt-1 text-moonberry-brown">{customer.email}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[11px] uppercase tracking-[0.16em] text-moonberry-mauve">Signed in as</dt>
            <dd className="mt-1 font-serif text-2xl text-moonberry-brown">{displayName}</dd>
          </div>
        </dl>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {quickLinks.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="glass group flex items-start justify-between gap-4 rounded-3xl p-5 transition duration-300 hover:-translate-y-0.5"
          >
            <div>
              <span className="glass-icon mb-4 inline-flex">
                <item.icon size={18} aria-hidden />
              </span>
              <h3 className="font-serif text-xl text-moonberry-brown">{item.label}</h3>
              <p className="mt-1 text-sm text-moonberry-mauve">{item.description}</p>
            </div>
            <ArrowRight
              size={18}
              className="mt-1 shrink-0 text-moonberry-rose/50 transition group-hover:translate-x-0.5 group-hover:text-moonberry-rose"
              aria-hidden
            />
          </Link>
        ))}
      </div>
    </div>
  )
}

export function AccountOrdersPage() {
  const { customerToken } = useOutletContext()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!customerToken) {
        if (!cancelled) {
          setOrders([])
          setLoadError('')
          setLoading(false)
        }
        return
      }
      if (!cancelled) {
        setLoading(true)
        setLoadError('')
      }
      try {
        const d = await fetchCustomerAccountDetails(customerToken)
        if (!cancelled) setOrders(d?.orders || [])
      } catch (err) {
        if (!cancelled) {
          setOrders([])
          setLoadError(err?.message || 'Could not load orders.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [customerToken])

  return (
    <div>
      <AccountPageTitle eyebrow="Orders" title="Order history" description="Purchases placed with this account." />
      {loadError ? (
        <p className="glass mb-4 rounded-2xl border border-amber-200/60 p-4 text-sm text-amber-950">
          {loadError}
        </p>
      ) : null}
      {loading ? (
        <div className="glass rounded-3xl p-8 text-center text-moonberry-mauve">Loading orders…</div>
      ) : !orders.length ? (
        <EmptyState
          title="No orders yet"
          description="Complete a purchase at checkout and your orders will appear here."
          action={
            <Link to="/shop" className="btn-primary">
              Start shopping
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li
              key={order.id}
              className="glass-strong flex flex-wrap items-center justify-between gap-4 rounded-3xl px-6 py-5"
            >
              <div className="flex items-start gap-4">
                <span className="glass-icon shrink-0">
                  <Package size={18} aria-hidden />
                </span>
                <div>
                  <p className="font-serif text-xl text-moonberry-brown">{order.name}</p>
                  <p className="mt-1 text-xs text-moonberry-mauve">
                    {order.processedAt
                      ? new Date(order.processedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—'}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {order.financialStatus ? (
                      <span className="rounded-full bg-white/50 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-moonberry-brown">
                        {order.financialStatus}
                      </span>
                    ) : null}
                    {order.fulfillmentStatus ? (
                      <span className="rounded-full bg-moonberry-cream/80 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-moonberry-mauve">
                        {order.fulfillmentStatus}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <p className="font-serif text-xl text-moonberry-brown">
                {formatOrderMoney(order.total, order.currencyCode)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function AccountAddressesPage() {
  const { customerToken } = useOutletContext()
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!customerToken) {
        if (!cancelled) {
          setDetails(null)
          setLoadError('')
          setLoading(false)
        }
        return
      }
      if (!cancelled) {
        setLoading(true)
        setLoadError('')
      }
      try {
        const d = await fetchCustomerAccountDetails(customerToken)
        if (!cancelled) setDetails(d)
      } catch (err) {
        if (!cancelled) {
          setDetails(null)
          setLoadError(err?.message || 'Could not load addresses.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [customerToken])

  const list = []
  if (details?.defaultAddress) list.push({ ...details.defaultAddress, isDefault: true })
  for (const addr of details?.addresses || []) {
    if (details?.defaultAddress?.id && addr.id === details.defaultAddress.id) continue
    list.push({ ...addr, isDefault: false })
  }

  return (
    <div>
      <AccountPageTitle
        eyebrow="Addresses"
        title="Saved addresses"
        description="Delivery addresses linked to your account."
      />
      {loadError ? (
        <p className="glass mb-4 rounded-2xl border border-amber-200/60 p-4 text-sm text-amber-950">
          {loadError}
        </p>
      ) : null}
      {loading ? (
        <div className="glass rounded-3xl p-8 text-center text-moonberry-mauve">Loading addresses…</div>
      ) : list.length === 0 ? (
        <EmptyState
          title="No saved addresses"
          description="Add your delivery address at checkout when you place an order."
          action={
            <Link to="/shop" className="btn-primary">
              Shop now
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {list.map((addr) => (
            <li key={addr.id} className="glass-strong rounded-3xl px-6 py-5">
              <div className="flex items-start gap-4">
                <span className="glass-icon shrink-0">
                  <MapPin size={18} aria-hidden />
                </span>
                <div>
                  {addr.isDefault ? (
                    <span className="mb-3 inline-block rounded-full bg-white/55 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-moonberry-brown">
                      Default
                    </span>
                  ) : null}
                  <p className="leading-relaxed text-moonberry-brown">{addr.summary || addr.label}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
