import { useCallback, useEffect, useMemo, useState } from 'react'
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
import {
  addCartLine,
  createCart,
  fetchCart,
  getStorefrontCatalog,
  hasShopifyConfig,
  removeCartLine,
  updateCartLine,
} from './lib/shopify'
import {
  AboutPage,
  CheckoutPage,
  CollectionsPage,
  ContactPage,
  HomePage,
  ProductPage,
  ShopPage,
} from './pages/Pages'

const SHOPIFY_CART_STORAGE_KEY = 'moonberry.shopifyCartId'

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
  const [products, setProducts] = useState([])
  const [collections, setCollections] = useState([])
  const [catalogLoaded, setCatalogLoaded] = useState(false)
  const [catalogError, setCatalogError] = useState('')
  const [shopifyCartId, setShopifyCartId] = useState(null)
  const [shopifyCheckoutUrl, setShopifyCheckoutUrl] = useState('')
  const [cartItems, setCartItems] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setToasts((prev) => [...prev, { id, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 2800)
  }, [])

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

  useEffect(() => {
    let cancelled = false

    async function initializeCatalog() {
      if (!hasShopifyConfig) {
        setCatalogError('Shopify is not configured. Add Storefront env variables to load the store.')
        setCatalogLoaded(true)
        return
      }

      try {
        const catalog = await getStorefrontCatalog()
        if (!cancelled) {
          setProducts(catalog.products)
          setCollections(catalog.collections)
          setCatalogError('')
        }
      } catch (error) {
        if (!cancelled) {
          setProducts([])
          setCollections([])
          setCatalogError(
            `Could not load Shopify catalog. ${error?.message || 'Check Storefront API credentials.'}`,
          )
          showToast('Could not load Shopify catalog.')
        }
      } finally {
        if (!cancelled) {
          setCatalogLoaded(true)
        }
      }
    }

    initializeCatalog()
    return () => {
      cancelled = true
    }
  }, [showToast])

  useEffect(() => {
    let cancelled = false

    async function initializeCart() {
      if (!hasShopifyConfig) return

      const storedCartId = window.localStorage.getItem(SHOPIFY_CART_STORAGE_KEY)
      if (!storedCartId) return

      try {
        const cart = await fetchCart(storedCartId)
        if (!cancelled && cart) {
          setShopifyCartId(cart.id)
          setShopifyCheckoutUrl(cart.checkoutUrl || '')
          setCartItems(cart.items)
        }
      } catch {
        window.localStorage.removeItem(SHOPIFY_CART_STORAGE_KEY)
      }
    }

    initializeCart()
    return () => {
      cancelled = true
    }
  }, [])

  const ensureShopifyCart = async () => {
    if (!hasShopifyConfig) return null
    if (shopifyCartId) return shopifyCartId

    const newCart = await createCart()
    setShopifyCartId(newCart.id)
    setShopifyCheckoutUrl(newCart.checkoutUrl || '')
    setCartItems(newCart.items)
    window.localStorage.setItem(SHOPIFY_CART_STORAGE_KEY, newCart.id)
    return newCart.id
  }

  const addToCart = (product) => {
    if (!hasShopifyConfig) {
      showToast('Shopify is not configured yet.')
      return
    }

    if (!product.variantId) {
      showToast('Variant unavailable for this product.')
      return
    }

    ;(async () => {
      try {
        const cartId = await ensureShopifyCart()
        const updatedCart = await addCartLine(cartId, product.variantId, 1)
        setCartItems(updatedCart.items)
        setShopifyCheckoutUrl(updatedCart.checkoutUrl || '')
        setCartOpen(true)
        showToast(`${product.name} added to bag`)
      } catch {
        showToast('Could not add item to Shopify cart.')
      }
    })()
  }

  const updateCartQty = (productId, nextQty) => {
    if (!hasShopifyConfig) {
      showToast('Shopify is not configured yet.')
      return
    }

    const currentItem = cartItems.find((item) => item.id === productId)
    if (!currentItem || !shopifyCartId) return

    ;(async () => {
      try {
        if (nextQty <= 0) {
          const updatedCart = await removeCartLine(shopifyCartId, currentItem.lineId)
          setCartItems(updatedCart.items)
          setShopifyCheckoutUrl(updatedCart.checkoutUrl || '')
          showToast(`${currentItem.name} removed from bag`)
          return
        }
        const updatedCart = await updateCartLine(shopifyCartId, currentItem.lineId, nextQty)
        setCartItems(updatedCart.items)
        setShopifyCheckoutUrl(updatedCart.checkoutUrl || '')
      } catch {
        showToast('Could not update Shopify cart.')
      }
    })()
  }

  const removeFromCart = (productId) => {
    if (!hasShopifyConfig) {
      showToast('Shopify is not configured yet.')
      return
    }

    const currentItem = cartItems.find((item) => item.id === productId)
    if (!currentItem || !shopifyCartId) return

    ;(async () => {
      try {
        const updatedCart = await removeCartLine(shopifyCartId, currentItem.lineId)
        setCartItems(updatedCart.items)
        setShopifyCheckoutUrl(updatedCart.checkoutUrl || '')
        showToast(`${currentItem.name} removed from bag`)
      } catch {
        showToast('Could not remove item from Shopify cart.')
      }
    })()
  }

  const clearCart = () => {
    if (!hasShopifyConfig) {
      showToast('Shopify is not configured yet.')
      return
    }

    if (!shopifyCartId || cartItems.length === 0) return
    ;(async () => {
      try {
        let updatedCart = null
        for (const item of cartItems) {
          updatedCart = await removeCartLine(shopifyCartId, item.lineId)
        }
        if (updatedCart) {
          setCartItems(updatedCart.items)
          setShopifyCheckoutUrl(updatedCart.checkoutUrl || '')
        }
        showToast('Cart cleared')
      } catch {
        showToast('Could not clear Shopify cart.')
      }
    })()
  }

  const productRouteFallback = useMemo(() => products[0]?.slug, [products])
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.qty, 0)
  const handleCheckout = () => {
    setCartOpen(false)
    if (hasShopifyConfig && shopifyCheckoutUrl) {
      showToast('Redirecting to Shopify checkout')
      window.location.href = shopifyCheckoutUrl
      return
    }
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
        {!catalogLoaded ? (
          <div className="section-shell py-20">
            <p className="text-center text-moonberry-mauve">Loading catalog...</p>
          </div>
        ) : catalogError ? (
          <div className="section-shell py-20">
            <div className="mx-auto max-w-2xl rounded-3xl border border-moonberry-rose/30 bg-white/70 p-8 text-center">
              <p className="text-lg text-moonberry-brown">{catalogError}</p>
              <p className="mt-2 text-sm text-moonberry-mauve">
                Set `VITE_SHOPIFY_STORE_DOMAIN` and `VITE_SHOPIFY_STOREFRONT_TOKEN` to continue.
              </p>
            </div>
          </div>
        ) : (
        <Routes>
          <Route
            path="/"
            element={<HomePage onQuickAdd={addToCart} products={products} collections={collections} />}
          />
          <Route path="/shop" element={<ShopPage onQuickAdd={addToCart} products={products} />} />
          <Route path="/collections" element={<CollectionsPage collections={collections} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/product/:slug"
            element={<ProductPage onQuickAdd={addToCart} products={products} />}
          />
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
          <Route
            path="*"
            element={
              productRouteFallback ? (
                <Navigate to={`/product/${productRouteFallback}`} replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App
