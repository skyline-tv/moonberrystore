import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Outlet, useNavigate, useOutletContext } from 'react-router-dom'
import { SectionHeading } from '../components/ProductCard'
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
      <div className="grid min-h-[70vh] overflow-hidden rounded-4xl border border-moonberry-rose/20 bg-white/50 shadow-[0_16px_60px_rgba(74,59,61,0.08)] lg:grid-cols-2">
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
            <BrandMark size="md" className="mb-8" />
            <PageHero eyebrow="Account" title={title} description={description} />
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
        className="card-surface space-y-4 p-8"
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
        className="card-surface space-y-4 p-8"
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
  `block rounded-xl px-4 py-2.5 text-sm transition ${
    isActive
      ? 'bg-white font-medium text-moonberry-brown shadow-sm'
      : 'text-moonberry-mauve hover:bg-white/60 hover:text-moonberry-brown'
  }`

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
      <div className="card-surface mx-auto max-w-md p-8">
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
    return (
      <main className="page-main">
        <p className="text-center text-moonberry-mauve">Loading…</p>
      </main>
    )
  }

  if (!hasShopifyConfig) {
    return (
      <main className="page-main">
        <EmptyState title="Account unavailable" description="Please try again later." />
      </main>
    )
  }

  if (sessionPending) {
    return (
      <main className="page-main">
        <p className="text-center text-moonberry-mauve">Loading your account…</p>
      </main>
    )
  }

  if (!customer) {
    return <Navigate to="/login" replace />
  }

  return (
    <main className="page-main">
      <PageHero
        eyebrow="Account"
        title="Your Moonberry account"
        description={customer.email}
      />
      <div className="flex flex-col gap-10 lg:flex-row">
        <aside className="lg:w-60 lg:shrink-0">
          <nav className="card-surface p-2">
            <NavLink to="/account" end className={accountNavClass}>
              Profile
            </NavLink>
            <NavLink to="/account/orders" className={accountNavClass}>
              Orders
            </NavLink>
            <NavLink to="/account/addresses" className={accountNavClass}>
              Addresses
            </NavLink>
            <button
              type="button"
              onClick={onLogout}
              className="mt-2 w-full rounded-xl px-4 py-2.5 text-left text-sm text-moonberry-mauve transition hover:bg-moonberry-cream/60 hover:text-moonberry-brown"
            >
              Log out
            </button>
          </nav>
        </aside>
        <div className="min-w-0 flex-1">
          <Outlet context={{ customer, customerToken, onLogout }} />
        </div>
      </div>
    </main>
  )
}

export function AccountOverviewPage() {
  const { customer, onLogout } = useOutletContext()
  const display = customer.displayName?.trim() || customer.email

  return (
    <div>
      <SectionHeading eyebrow="Overview" title="Welcome back" description={display} />
      <div className="card-surface max-w-lg p-8">
        <dl className="space-y-5 text-moonberry-brown">
          {customer.firstName || customer.lastName ? (
            <div>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-moonberry-mauve">Name</dt>
              <dd className="mt-1 font-serif text-xl">
                {[customer.firstName, customer.lastName].filter(Boolean).join(' ') || '—'}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-[11px] uppercase tracking-[0.16em] text-moonberry-mauve">Email</dt>
            <dd className="mt-1">{customer.email}</dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/account/orders" className="btn-primary">
            View orders
          </Link>
          <Link to="/account/addresses" className="btn-secondary">
            Saved addresses
          </Link>
        </div>
        <button type="button" onClick={onLogout} className="btn-secondary mt-8">
          Log out
        </button>
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
      <SectionHeading eyebrow="Orders" title="Order history" description="Placed with this account." />
      {loadError ? (
        <p className="mb-4 rounded-2xl border border-amber-200/80 bg-amber-50/90 p-4 text-sm text-amber-950">
          {loadError}
        </p>
      ) : null}
      {loading ? (
        <p className="text-moonberry-mauve">Loading orders…</p>
      ) : !orders.length ? (
        <EmptyState
          title="No orders yet"
          description="Complete a purchase at checkout and your orders will appear here."
          action={
            <Link to="/checkout" className="btn-primary">
              Go to checkout
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li
              key={order.id}
              className="card-surface flex flex-wrap items-baseline justify-between gap-2 px-5 py-5"
            >
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
                  {order.financialStatus ? ` · ${order.financialStatus}` : ''}
                  {order.fulfillmentStatus ? ` · ${order.fulfillmentStatus}` : ''}
                </p>
              </div>
              <p className="font-serif text-lg text-moonberry-brown">
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
      <SectionHeading
        eyebrow="Addresses"
        title="Saved addresses"
        description="Delivery addresses linked to your account."
      />
      {loadError ? (
        <p className="mb-4 rounded-2xl border border-amber-200/80 bg-amber-50/90 p-4 text-sm text-amber-950">
          {loadError}
        </p>
      ) : null}
      {loading ? (
        <p className="text-moonberry-mauve">Loading addresses…</p>
      ) : list.length === 0 ? (
        <EmptyState
          title="No saved addresses"
          description="Add your delivery address at checkout when you place an order."
        />
      ) : (
        <ul className="space-y-3">
          {list.map((addr) => (
            <li key={addr.id} className="card-surface px-5 py-5">
              {addr.isDefault ? (
                <span className="mb-3 inline-block rounded-full bg-moonberry-cream px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-moonberry-brown">
                  Default
                </span>
              ) : null}
              <p className="leading-relaxed text-moonberry-brown">{addr.summary || addr.label}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
