import { useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { CartDrawer, Footer, MobileMenu, Navbar } from './components/Layout'
import { products } from './data/mockData'
import {
  AboutPage,
  CollectionsPage,
  ContactPage,
  HomePage,
  ProductPage,
  ShopPage,
} from './pages/Pages'

function App() {
  const location = useLocation()
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])

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
  }

  const productRouteFallback = useMemo(() => products[0].slug, [])

  return (
    <div className="min-h-screen">
      <Navbar onOpenCart={() => setCartOpen(true)} onOpenMobile={() => setMenuOpen(true)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cartItems} />

      <div key={location.pathname} className="animate-[fadeIn_420ms_ease-out]">
        <Routes>
          <Route path="/" element={<HomePage onQuickAdd={addToCart} />} />
          <Route path="/shop" element={<ShopPage onQuickAdd={addToCart} />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/product/:slug" element={<ProductPage onQuickAdd={addToCart} />} />
          <Route path="*" element={<Navigate to={`/product/${productRouteFallback}`} replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App
