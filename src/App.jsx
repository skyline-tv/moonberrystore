import { useCallback, useEffect, useState } from 'react'
import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
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
  createCustomerAccessToken,
  createCustomerAccount,
  deleteCustomerAccessToken,
  fetchCart,
  fetchCustomer,
  getStorefrontCatalog,
  hasShopifyConfig,
  removeCartLine,
  updateCartBuyerIdentity,
  updateCartLine,
} from './lib/shopify'
import { createCheckoutOrder } from './lib/checkoutApi'
import {
  AboutPage,
  CheckoutPage,
  CollectionDetailPage,
  CollectionsPage,
  ContactPage,
  FaqPage,
  HomePage,
  IngredientsUsagePage,
  NotFoundPage,
  PrivacyPolicyPage,
  ProductPage,
  ShippingReturnsPage,
  ShopPage,
  TermsPage,
} from './pages/Pages'
import {
  AccountAddressesPage,
  AccountLayout,
  AccountOrdersPage,
  AccountOverviewPage,
  ForgotPasswordPage,
  LoginPage,
  SignupPage,
} from './pages/AuthPages'

const SHOPIFY_CART_STORAGE_KEY = 'moonberry.shopifyCartId'
const SHOPIFY_CUSTOMER_TOKEN_KEY = 'moonberry.shopifyCustomerToken'

function ProductRoute({ onQuickAdd, products }) {
  const { slug } = useParams()
  const match = products.find((p) => p.slug === slug)
  return <ProductPage key={match?.id ?? slug} onQuickAdd={onQuickAdd} products={products} />
}

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
  const [cartItems, setCartItems] = useState([])
  const [customerToken, setCustomerToken] = useState(() =>
    typeof window !== 'undefined' ? window.localStorage.getItem(SHOPIFY_CUSTOMER_TOKEN_KEY) : null,
  )
  const [customerProfile, setCustomerProfile] = useState(null)

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

  const customerAccessToken = customerToken || undefined

  const applyCartState = useCallback((cart) => {
    if (!cart) return
    setShopifyCartId(cart.id)
    setCartItems(cart.items)
    window.localStorage.setItem(SHOPIFY_CART_STORAGE_KEY, cart.id)
  }, [])

  const clearCartState = useCallback(() => {
    window.localStorage.removeItem(SHOPIFY_CART_STORAGE_KEY)
    setShopifyCartId(null)
    setCartItems([])
  }, [])

  useEffect(() => {
    if (!hasShopifyConfig || !customerToken) return
    let cancelled = false
    ;(async () => {
      try {
        const profile = await fetchCustomer(customerToken)
        if (cancelled) return
        if (profile) {
          setCustomerProfile(profile)
        } else {
          window.localStorage.removeItem(SHOPIFY_CUSTOMER_TOKEN_KEY)
          setCustomerToken(null)
          setCustomerProfile(null)
        }
      } catch {
        /* Keep session on network errors; avoid wiping a valid token after login. */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [customerToken])

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
        const cart = await fetchCart(storedCartId, customerAccessToken)
        if (cancelled) return
        if (cart) {
          applyCartState(cart)
        } else {
          clearCartState()
        }
      } catch {
        clearCartState()
      }
    }

    initializeCart()
    return () => {
      cancelled = true
    }
  }, [customerAccessToken, applyCartState, clearCartState])

  const ensureShopifyCart = async () => {
    if (!hasShopifyConfig) return null
    if (shopifyCartId) return shopifyCartId

    const newCart = await createCart(customerAccessToken)
    applyCartState(newCart)
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
        const updatedCart = await addCartLine(cartId, product.variantId, 1, customerAccessToken)
        applyCartState(updatedCart)
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
          const updatedCart = await removeCartLine(
            shopifyCartId,
            currentItem.lineId,
            customerAccessToken,
          )
          applyCartState(updatedCart)
          showToast(`${currentItem.name} removed from bag`)
          return
        }
        const updatedCart = await updateCartLine(
          shopifyCartId,
          currentItem.lineId,
          nextQty,
          customerAccessToken,
        )
        applyCartState(updatedCart)
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
        const updatedCart = await removeCartLine(
          shopifyCartId,
          currentItem.lineId,
          customerAccessToken,
        )
        applyCartState(updatedCart)
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
          updatedCart = await removeCartLine(shopifyCartId, item.lineId, customerAccessToken)
        }
        if (updatedCart) {
          applyCartState(updatedCart)
        }
        showToast('Cart cleared')
      } catch {
        showToast('Could not clear Shopify cart.')
      }
    })()
  }

  const handleLogin = useCallback(
    async ({ email, password }) => {
      const token = await createCustomerAccessToken(email, password)
      const profile = await fetchCustomer(token)
      if (!profile) {
        throw new Error(
          'Could not load your account after sign-in. This often happens if the store uses New customer accounts instead of legacy email/password, or if the storefront token is missing customer scopes.',
        )
      }
      window.localStorage.setItem(SHOPIFY_CUSTOMER_TOKEN_KEY, token)
      setCustomerToken(token)
      setCustomerProfile(profile)
      if (shopifyCartId) {
        try {
          const cart = await updateCartBuyerIdentity(shopifyCartId, token)
          applyCartState(cart)
        } catch {
          try {
            const cart = await fetchCart(shopifyCartId, token)
            if (cart) {
              applyCartState(cart)
            }
          } catch {
            /* keep existing cart UI */
          }
        }
      }
      showToast('Signed in')
    },
    [shopifyCartId, showToast, applyCartState],
  )

  const handleSignup = useCallback(
    async ({ email, password, firstName, lastName }) => {
      await createCustomerAccount({ email, password, firstName, lastName })
      const token = await createCustomerAccessToken(email, password)
      const profile = await fetchCustomer(token)
      if (!profile) {
        throw new Error(
          'Account was created but your profile could not be loaded. Check customer account type (legacy email/password) and storefront API permissions.',
        )
      }
      window.localStorage.setItem(SHOPIFY_CUSTOMER_TOKEN_KEY, token)
      setCustomerToken(token)
      setCustomerProfile(profile)
      if (shopifyCartId) {
        try {
          const cart = await updateCartBuyerIdentity(shopifyCartId, token)
          applyCartState(cart)
        } catch {
          try {
            const cart = await fetchCart(shopifyCartId, token)
            if (cart) {
              applyCartState(cart)
            }
          } catch {
            /* keep existing cart UI */
          }
        }
      }
      showToast('Account created')
    },
    [shopifyCartId, showToast, applyCartState],
  )

  const handleLogout = useCallback(async () => {
    if (customerToken) {
      try {
        await deleteCustomerAccessToken(customerToken)
      } catch {
        /* clear local session anyway */
      }
    }
    window.localStorage.removeItem(SHOPIFY_CUSTOMER_TOKEN_KEY)
    setCustomerToken(null)
    setCustomerProfile(null)
    showToast('Signed out')
    if (shopifyCartId) {
      try {
        const cart = await fetchCart(shopifyCartId)
        if (cart) {
          applyCartState(cart)
        }
      } catch {
        /* ignore */
      }
    }
  }, [customerToken, shopifyCartId, showToast, applyCartState])

  const policyPaths = [
    '/shipping-returns',
    '/privacy',
    '/ingredients',
    '/terms',
    '/faq',
    '/about',
    '/contact',
  ]
  const allowWithCatalogError =
    ['/login', '/signup', '/checkout', '/forgot-password'].includes(location.pathname) ||
    location.pathname.startsWith('/account') ||
    location.pathname.startsWith('/collections/') ||
    policyPaths.includes(location.pathname)
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.qty, 0)

  const refreshCart = useCallback(async () => {
    if (!shopifyCartId) return
    if (!hasShopifyConfig) return
    try {
      const cart = await fetchCart(shopifyCartId, customerAccessToken)
      if (cart) {
        applyCartState(cart)
      } else {
        clearCartState()
      }
    } catch {
      /* ignore */
    }
  }, [shopifyCartId, customerAccessToken, applyCartState, clearCartState])

  const clearShopifyCartLines = useCallback(async () => {
    if (!shopifyCartId) return
    const cart = await fetchCart(shopifyCartId, customerAccessToken)
    if (!cart?.items?.length) {
      clearCartState()
      return
    }
    for (const item of cart.items) {
      await removeCartLine(shopifyCartId, item.lineId, customerAccessToken)
    }
    clearCartState()
  }, [shopifyCartId, customerAccessToken, clearCartState])

  const handleCompleteOrder = useCallback(
    async (orderDetails) => {
      if (!hasShopifyConfig) {
        throw new Error('Shopify is not configured yet.')
      }
      if (!shopifyCartId || cartItems.length === 0) {
        throw new Error('Your bag is empty.')
      }

      const customer = {
        email: orderDetails.email,
        phone: orderDetails.phone,
        fullName: orderDetails.fullName,
        addressLine1: orderDetails.addressLine1,
        addressLine2: orderDetails.addressLine2,
        city: orderDetails.city,
        state: orderDetails.state,
        pincode: orderDetails.pincode,
      }

      let createResult
      try {
        createResult = await createCheckoutOrder({
          cartId: shopifyCartId,
          customerAccessToken,
          customer,
          paymentMethod: orderDetails.paymentMethod,
        })
      } catch (error) {
        if (error instanceof Error) throw error
        throw new Error('Could not start checkout.', { cause: error })
      }

      let orderNumber = createResult.orderNumber
      let shopifyOrderId = createResult.shopifyOrderId

      if (createResult.status === 'shopify_payment') {
        try {
          await clearShopifyCartLines()
        } catch (error) {
          console.warn('Redirecting to Shopify payment but cart could not be cleared.', error)
        }
        window.location.assign(createResult.invoiceUrl)
        return { redirected: true }
      }

      try {
        await clearShopifyCartLines()
      } catch (error) {
        console.warn('Order placed but cart could not be cleared.', error)
      }

      showToast('Order placed successfully!')
      return {
        orderNumber,
        shopifyOrderId,
        total: createResult.total ?? orderDetails.total,
        paymentMethod: orderDetails.paymentMethod,
      }
    },
    [
      shopifyCartId,
      cartItems.length,
      customerAccessToken,
      clearShopifyCartLines,
      showToast,
    ],
  )

  const handleCheckout = () => {
    setCartOpen(false)
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
        loggedIn={Boolean(customerToken)}
        onLogout={handleLogout}
      />
      <IndiaTrustBar />
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        loggedIn={Boolean(customerToken)}
        onLogout={handleLogout}
      />
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
        ) : catalogError && !allowWithCatalogError ? (
          <div className="section-shell py-20">
            <div className="mx-auto max-w-2xl rounded-3xl border border-moonberry-rose/30 bg-white/70 p-8 text-center">
              <p className="text-lg text-moonberry-brown">{catalogError}</p>
              <p className="mt-2 text-sm text-moonberry-mauve">
                Set `VITE_SHOPIFY_STORE_DOMAIN` and `VITE_SHOPIFY_STOREFRONT_TOKEN` to continue.
              </p>
              <p className="mt-4 text-sm text-moonberry-mauve">
                You can still{' '}
                <button
                  type="button"
                  className="text-moonberry-brown underline underline-offset-2"
                  onClick={() => navigate('/login')}
                >
                  log in
                </button>{' '}
                or{' '}
                <button
                  type="button"
                  className="text-moonberry-brown underline underline-offset-2"
                  onClick={() => navigate('/signup')}
                >
                  sign up
                </button>
                .
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
          <Route
            path="/collections/:slug"
            element={<CollectionDetailPage onQuickAdd={addToCart} />}
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/shipping-returns" element={<ShippingReturnsPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/ingredients" element={<IngredientsUsagePage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignupPage onSignup={handleSignup} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/account"
            element={
              <AccountLayout
                customer={customerToken ? customerProfile : null}
                sessionPending={Boolean(customerToken && !customerProfile)}
                customerToken={customerToken}
                onLogout={handleLogout}
                catalogReady={catalogLoaded}
              />
            }
          >
            <Route index element={<AccountOverviewPage />} />
            <Route path="orders" element={<AccountOrdersPage />} />
            <Route path="addresses" element={<AccountAddressesPage />} />
          </Route>
          <Route
            path="/product/:slug"
            element={<ProductRoute onQuickAdd={addToCart} products={products} />}
          />
          <Route
            path="/checkout"
            element={
              <CheckoutPage
                cartItems={cartItems}
                onQtyChange={updateCartQty}
                onRemove={removeFromCart}
                onCompleteOrder={handleCompleteOrder}
                onRefreshCart={refreshCart}
                defaultEmail={customerProfile?.email || ''}
              />
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App
