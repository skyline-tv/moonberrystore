import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Outlet, useNavigate, useOutletContext } from 'react-router-dom'
import { SectionHeading } from '../components/ProductCard'
import {
  fetchCustomerAccountDetails,
  hasShopifyConfig,
  requestCustomerPasswordReset,
} from '../lib/shopify'

export function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState({ type: '', message: '' })
  const [busy, setBusy] = useState(false)

  if (!hasShopifyConfig) {
    return (
      <main className="section-shell py-16">
        <SectionHeading eyebrow="Account" title="Log in" />
        <p className="max-w-xl text-moonberry-mauve">
          Configure `VITE_SHOPIFY_STORE_DOMAIN` and `VITE_SHOPIFY_STOREFRONT_TOKEN` to enable customer login.
        </p>
      </main>
    )
  }

  return (
    <main className="section-shell py-16">
      <SectionHeading
        eyebrow="Account"
        title="Log in"
        description="Sign in with the email and password for your store account (Shopify legacy customer accounts)."
      />
      <div className="mx-auto max-w-md rounded-3xl bg-white/80 p-8">
        <form
          className="space-y-3"
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
          <label className="block text-xs uppercase tracking-[0.14em] text-moonberry-mauve">Email</label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-2xl border border-moonberry-rose/40 bg-white px-4 outline-none"
          />
          <label className="mt-2 block text-xs uppercase tracking-[0.14em] text-moonberry-mauve">
            Password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-2xl border border-moonberry-rose/40 bg-white px-4 outline-none"
          />
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-moonberry-brown underline underline-offset-2">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="mt-4 w-full rounded-full bg-moonberry-brown px-7 py-3 text-sm uppercase tracking-[0.15em] text-white disabled:opacity-60"
          >
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
          <Link to="/signup" className="text-moonberry-brown underline underline-offset-2">
            Create one
          </Link>
        </p>
      </div>
    </main>
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
      <main className="section-shell py-16">
        <SectionHeading eyebrow="Account" title="Sign up" />
        <p className="max-w-xl text-moonberry-mauve">
          Configure Shopify Storefront env variables to enable sign up.
        </p>
      </main>
    )
  }

  return (
    <main className="section-shell py-16">
      <SectionHeading
        eyebrow="Account"
        title="Create account"
        description="Create a store account with email and password. Your Shopify admin must use legacy customer accounts for this form to work."
      />
      <div className="mx-auto max-w-md rounded-3xl bg-white/80 p-8">
        <form
          className="space-y-3"
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
              <label className="block text-xs uppercase tracking-[0.14em] text-moonberry-mauve">
                First name
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 h-12 w-full rounded-2xl border border-moonberry-rose/40 bg-white px-4 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-moonberry-mauve">
                Last name
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 h-12 w-full rounded-2xl border border-moonberry-rose/40 bg-white px-4 outline-none"
              />
            </div>
          </div>
          <label className="block text-xs uppercase tracking-[0.14em] text-moonberry-mauve">Email</label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-2xl border border-moonberry-rose/40 bg-white px-4 outline-none"
          />
          <label className="block text-xs uppercase tracking-[0.14em] text-moonberry-mauve">
            Password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-2xl border border-moonberry-rose/40 bg-white px-4 outline-none"
          />
          <button
            type="submit"
            disabled={busy}
            className="mt-4 w-full rounded-full bg-moonberry-brown px-7 py-3 text-sm uppercase tracking-[0.15em] text-white disabled:opacity-60"
          >
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
          <Link to="/login" className="text-moonberry-brown underline underline-offset-2">
            Log in
          </Link>
        </p>
      </div>
    </main>
  )
}

const accountNavClass = ({ isActive }) =>
  `block rounded-xl px-3 py-2 text-sm transition ${
    isActive ? 'bg-white font-medium text-moonberry-brown shadow-sm' : 'text-moonberry-mauve hover:text-moonberry-brown'
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
      <main className="section-shell py-16">
        <SectionHeading eyebrow="Account" title="Reset password" />
        <p className="text-moonberry-mauve">Shopify is not configured.</p>
      </main>
    )
  }

  return (
    <main className="section-shell py-16">
      <SectionHeading
        eyebrow="Account"
        title="Forgot password"
        description="We will email you a reset link from Shopify (legacy customer accounts)."
      />
      <div className="mx-auto max-w-md rounded-3xl bg-white/80 p-8">
        <form
          className="space-y-3"
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
                message: 'If an account exists for that email, Shopify will send reset instructions shortly.',
              })
            } catch (err) {
              setStatus({ type: 'error', message: err?.message || 'Could not start reset. Try again later.' })
            } finally {
              setBusy(false)
            }
          }}
        >
          <label className="block text-xs uppercase tracking-[0.14em] text-moonberry-mauve">Email</label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-2xl border border-moonberry-rose/40 bg-white px-4 outline-none"
          />
          <button
            type="submit"
            disabled={busy}
            className="mt-4 w-full rounded-full bg-moonberry-brown px-7 py-3 text-sm uppercase tracking-[0.15em] text-white disabled:opacity-60"
          >
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
          <Link to="/login" className="text-moonberry-brown underline underline-offset-2">
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
      <main className="section-shell py-16">
        <p className="text-moonberry-mauve">Loading...</p>
      </main>
    )
  }

  if (!hasShopifyConfig) {
    return (
      <main className="section-shell py-16">
        <SectionHeading eyebrow="Account" title="Your account" />
        <p className="text-moonberry-mauve">Shopify is not configured.</p>
      </main>
    )
  }

  if (sessionPending) {
    return (
      <main className="section-shell py-16">
        <p className="text-moonberry-mauve">Loading your account...</p>
      </main>
    )
  }

  if (!customer) {
    return <Navigate to="/login" replace />
  }

  return (
    <main className="section-shell py-12 md:py-16">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.24em] text-moonberry-mauve">Account</p>
        <h1 className="font-serif text-4xl text-moonberry-brown">Your Moonberry account</h1>
        <p className="mt-1 text-sm text-moonberry-mauve">{customer.email}</p>
      </div>
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <nav className="rounded-2xl border border-moonberry-rose/30 bg-white/70 p-2">
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
              className="mt-2 w-full rounded-xl px-3 py-2 text-left text-sm text-moonberry-mauve transition hover:bg-moonberry-cream hover:text-moonberry-brown"
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
      <div className="max-w-lg rounded-3xl bg-white/80 p-8">
        <dl className="space-y-3 text-moonberry-brown">
          {customer.firstName || customer.lastName ? (
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-moonberry-mauve">Name</dt>
              <dd>{[customer.firstName, customer.lastName].filter(Boolean).join(' ') || '—'}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-moonberry-mauve">Email</dt>
            <dd>{customer.email}</dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/account/orders"
            className="rounded-full bg-moonberry-brown px-6 py-2.5 text-sm uppercase tracking-[0.12em] text-white"
          >
            View orders
          </Link>
          <Link
            to="/account/addresses"
            className="rounded-full border border-moonberry-rose/50 px-6 py-2.5 text-sm uppercase tracking-[0.12em] text-moonberry-brown"
          >
            Saved addresses
          </Link>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="mt-8 rounded-full border border-moonberry-rose/50 px-7 py-3 text-sm uppercase tracking-[0.15em] text-moonberry-brown transition hover:bg-white"
        >
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
      <SectionHeading eyebrow="Orders" title="Order history" description="Placed with the same email as this account." />
      {loadError ? (
        <p className="mb-4 rounded-2xl border border-amber-200/80 bg-amber-50/90 p-4 text-sm text-amber-950">{loadError}</p>
      ) : null}
      {loading ? (
        <p className="text-moonberry-mauve">Loading orders…</p>
      ) : !orders.length ? (
        <div className="rounded-3xl border border-moonberry-rose/30 bg-white/75 p-8 text-moonberry-mauve">
          <p>No orders yet, or your storefront token needs the `unauthenticated_read_customers` scope to show them.</p>
          <p className="mt-3 text-sm">
            Complete a purchase on{' '}
            <Link to="/checkout" className="text-moonberry-brown underline underline-offset-2">
              checkout
            </Link>{' '}
            with this email so orders appear here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li
              key={order.id}
              className="flex flex-wrap items-baseline justify-between gap-2 rounded-2xl border border-moonberry-rose/25 bg-white/80 px-4 py-4"
            >
              <div>
                <p className="font-medium text-moonberry-brown">{order.name}</p>
                <p className="text-xs text-moonberry-mauve">
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
              <p className="font-medium text-moonberry-brown">
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
        description="Addresses saved to your Shopify customer profile appear here."
      />
      {loadError ? (
        <p className="mb-4 rounded-2xl border border-amber-200/80 bg-amber-50/90 p-4 text-sm text-amber-950">{loadError}</p>
      ) : null}
      {loading ? (
        <p className="text-moonberry-mauve">Loading addresses…</p>
      ) : list.length === 0 ? (
        <p className="rounded-3xl border border-moonberry-rose/30 bg-white/75 p-8 text-moonberry-mauve">
          No saved addresses yet. Add one at Shopify checkout next time you order, or ensure your storefront token can
          read customer addresses.
        </p>
      ) : (
        <ul className="space-y-3">
          {list.map((addr) => (
            <li key={addr.id} className="rounded-2xl border border-moonberry-rose/25 bg-white/80 px-4 py-4">
              {addr.isDefault ? (
                <span className="mb-2 inline-block rounded-full bg-moonberry-cream px-2 py-0.5 text-[10px] uppercase tracking-wider text-moonberry-brown">
                  Default
                </span>
              ) : null}
              <p className="text-moonberry-brown">{addr.summary || addr.label}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
