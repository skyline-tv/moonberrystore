import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, X } from 'lucide-react'
import {
  CartDrawer,
  Footer,
  IndiaTrustBar,
  MobileMenu,
  Navbar,
  SearchModal,
} from './components/Layout'
import { products } from './data/mockData'
import {
  AboutPage,
  CheckoutPage,
  CollectionsPage,
  ContactPage,
  HomePage,
  ProductPage,
  ShopPage,
} from './pages/Pages'

const CART_STORAGE_KEY = 'moonberry.cart'

function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-[min(92vw,360px)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-moonberry-rose/30 bg-white p-3 shadow-lg"
        >
          <CheckCircle2 size={18} className="mt-0.5 text-green-700" />
          <p className="flex-1 text-sm text-moonberry-brown">{toast.message}</p>
          <button
            type="button"
            aria-label="Dismiss notification"
            className="rounded-full p-1 text-moonberry-mauve hover:bg-moonberry-cream"
            onClick={() => onDismiss(toast.id)}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [toasts, setToasts] = useState([])
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = window.localStorage.getItem(CART_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const showToast = (message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setToasts((prev) => [...prev, { id, message }])
    window.setTimeout(() => {
      dismissToast(id)
    }, 2800)
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  useEffect(() => {
    const hasOverlay = cartOpen || menuOpen || searchOpen
    const previousOverflow = document.body.style.overflow
    if (hasOverlay) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [cartOpen, menuOpen, searchOpen])

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key !== 'Escape') return
      setCartOpen(false)
      setMenuOpen(false)
      setSearchOpen(false)
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [])

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        )
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0],
          qty: 1,
        },
      ]
    })
    setCartOpen(true)
    showToast(`${product.name} added to bag`)
  }

  const updateCartQty = (productId, nextQty) => {
    setCartItems((prev) => {
      if (nextQty <= 0) {
        return prev.filter((item) => item.id !== productId)
      }
      return prev.map((item) =>
        item.id === productId ? { ...item, qty: nextQty } : item,
      )
    })
  }

  const removeFromCart = (productId) => {
    setCartItems((prev) => {
      const removedItem = prev.find((item) => item.id === productId)
      if (removedItem) {
        showToast(`${removedItem.name} removed from bag`)
      }
      return prev.filter((item) => item.id !== productId)
    })
  }

  const clearCart = () => {
    setCartItems([])
    showToast('Cart cleared')
  }

  const productRouteFallback = useMemo(() => products[0].slug, [])
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.qty, 0)
  const handleCheckout = () => {
    setCartOpen(false)
    showToast('Redirecting to checkout mock')
    navigate('/checkout')
  }

  return (
    <div className="min-h-screen">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-moonberry-brown"
      >
        Skip to content
      </a>
      <Navbar
        onOpenCart={() => setCartOpen(true)}
        onOpenMobile={() => setMenuOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        cartCount={cartItemCount}
      />
      <IndiaTrustBar />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        products={products}
        onSelectProduct={(slug) => {
          setSearchOpen(false)
          navigate(`/product/${slug}`)
        }}
      />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onQtyChange={updateCartQty}
        onRemove={removeFromCart}
        onClearCart={clearCart}
        onCheckout={handleCheckout}
      />

      <main id="main-content" key={location.pathname} className="animate-[fadeIn_420ms_ease-out]">
        <Routes>
          <Route path="/" element={<HomePage onQuickAdd={addToCart} />} />
          <Route path="/shop" element={<ShopPage onQuickAdd={addToCart} />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/product/:slug" element={<ProductPage onQuickAdd={addToCart} />} />
          <Route
            path="/checkout"
            element={
              <CheckoutPage
                cartItems={cartItems}
                onQtyChange={updateCartQty}
                onRemove={removeFromCart}
              />
            }
          />
          <Route path="*" element={<Navigate to={`/product/${productRouteFallback}`} replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
