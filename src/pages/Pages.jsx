import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, Mail, MapPin, Phone } from 'lucide-react'
import { BrandMark } from '../components/BrandMark'
import {
  Breadcrumbs,
  CheckoutSection,
  ContactCard,
  EmptyState,
  LuxeAccordion,
  PageHero,
  ProseArticle,
} from '../components/PageElements'
import { ProductCard, SectionHeading } from '../components/ProductCard'
import { formatINR } from '../lib/currency'
import { calculateOrderTotals } from '../lib/pricing'
import { fetchCheckoutReadiness } from '../lib/checkoutApi'
import { getCollectionByHandle, hasShopifyConfig, pickVariantForOption } from '../lib/shopify'
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE, HAS_CONTACT_PHONE } from '../lib/site'

export function HomePage({ onQuickAdd, products = [], collections = [] }) {
  const bestSellers = products.filter((item) => item.bestSeller).slice(0, 6)
  const heroImage = collections[0]?.image || products[0]?.images?.[0]

  return (
    <div>
      <section className="section-shell grid min-h-[80vh] items-center gap-12 py-14 md:grid-cols-2 md:py-20">
        <div className="animate-fade-in-up hero-panel">
          <div className="pointer-events-none absolute -left-8 -top-16 h-52 w-52 rounded-full bg-white/40 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-moonberry-mauve/25 blur-3xl" />
          <p className="eyebrow">Moonberry</p>
          <h1 className="editorial-heading">
            Perfume, Skincare, Makeup &amp; Nails — For Everyone.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-moonberry-mauve md:text-[17px]">
            Discover premium fragrances, skincare, cosmetics, and nail essentials designed for every
            style, tone, and identity.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/shop" className="btn-primary">
              Shop Now
            </Link>
            {collections.length > 0 ? (
              <Link to="/collections" className="btn-secondary">
                Explore Collections
              </Link>
            ) : null}
          </div>
        </div>
        <div className="animate-fade-in-up animate-delay-200 relative flex items-center justify-center">
          {heroImage ? (
            <img
              src={heroImage}
              alt="Moonberry collection"
              className="soft-shadow h-[min(580px,68vh)] w-full rounded-4xl object-cover"
            />
          ) : (
            <div className="flex h-[min(420px,55vh)] w-full items-center justify-center rounded-4xl border border-white/50 bg-white/45">
              <BrandMark size="lg" />
            </div>
          )}
        </div>
      </section>

      {collections.length > 0 ? (
        <section className="section-shell py-20">
          <SectionHeading
            eyebrow="Collections"
            title="Shop by Edit"
            description="Curated selections from our catalog."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {collections.slice(0, 3).map((collection) => (
              <Link
                key={collection.id}
                to={`/collections/${collection.slug}`}
                className="group relative block overflow-hidden rounded-4xl shadow-[0_12px_40px_rgba(74,59,61,0.08)]"
              >
                {collection.image ? (
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="h-80 w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-80 w-full bg-gradient-to-br from-moonberry-cream to-moonberry-blush" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-moonberry-brown/70 via-moonberry-brown/25 to-transparent p-6 text-white transition duration-500 group-hover:from-moonberry-brown/80">
                  <p className="mt-44 text-xs uppercase tracking-[0.2em] text-white/80">Collection</p>
                  <h3 className="font-serif text-3xl">{collection.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {bestSellers.length > 0 ? (
        <section className="section-shell border-t border-moonberry-rose/15 py-20">
          <SectionHeading eyebrow="Best Sellers" title="Most Loved Pieces" />
          <div className="grid gap-5 md:grid-cols-3">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} onQuickAdd={onQuickAdd} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section-shell pb-24 pt-4">
        <div className="card-surface relative overflow-hidden">
          <div className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-moonberry-blush/40 blur-3xl" />
          <div className="relative flex flex-col items-start gap-8 p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-moonberry-mauve">Our Story</p>
            <h2 className="mt-2 font-serif text-3xl leading-tight text-moonberry-brown md:text-4xl">
              Self-expression, crafted beautifully.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-moonberry-mauve">
              Moonberry is a boutique beauty label where fragrance, skin, and nail rituals meet —
              formulated with rich textures and refined scents that feel quietly luxurious.
            </p>
          </div>
          <Link to="/about" className="btn-secondary shrink-0">
            About us
          </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export function ShopPage({ onQuickAdd, products = [] }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const categories = ['All', 'Under Rs. 499', ...new Set(products.map((product) => product.category))]
  const visibleProducts = useMemo(() => {
    const filteredByCategory =
      activeCategory === 'All'
        ? products
        : activeCategory === 'Under Rs. 499'
          ? products.filter((product) => product.price < 499)
          : products.filter((product) => product.category === activeCategory)

    const filteredByQuery = filteredByCategory.filter((product) =>
      `${product.name} ${product.category} ${product.collection}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
    )

    const sorted = [...filteredByQuery]
    if (sortBy === 'price-low-high') {
      sorted.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high-low') {
      sorted.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'name-a-z') {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    }
    return sorted
  }, [activeCategory, products, query, sortBy])

  return (
    <main className="page-main">
      <PageHero
        eyebrow="Shop"
        title="All Products"
        description="Luxury perfumes, skincare, cosmetics, and nail care — thoughtfully selected for you."
      />
      <div className="mb-8 grid gap-3 rounded-3xl border border-moonberry-rose/20 bg-white/70 p-4 md:grid-cols-[1fr_auto]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products..."
          className="input-field h-11"
        />
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="input-field h-11 text-sm"
        >
          <option value="featured">Sort: Featured</option>
          <option value="price-low-high">Price: Low to High</option>
          <option value="price-high-low">Price: High to Low</option>
          <option value="name-a-z">Name: A to Z</option>
        </select>
      </div>
      <div className="mb-8 flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`filter-pill ${activeCategory === category ? 'filter-pill-active' : ''}`}
          >
            {category}
          </button>
        ))}
      </div>
      <p className="mb-5 text-sm text-moonberry-mauve">
        Showing {visibleProducts.length} product{visibleProducts.length === 1 ? '' : 's'}
      </p>
      {visibleProducts.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} onQuickAdd={onQuickAdd} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No products found"
          description="Try changing category, search, or sort options."
        />
      )}
    </main>
  )
}

export function CollectionsPage({ collections = [] }) {
  return (
    <main className="page-main">
      <PageHero
        eyebrow="Collections"
        title="Browse by Edit"
        description="Editorial beauty collections, each with its own mood and ritual."
      />
      <div className="space-y-8">
        {collections.map((collection, index) => (
          <article
            key={collection.id}
            className={`collection-editorial group ${index % 2 === 1 ? 'md:[&>div:first-child]:order-2' : ''}`}
          >
            {collection.image ? (
              <img src={collection.image} alt={collection.name} className="collection-editorial-image" />
            ) : (
              <div className="h-72 bg-gradient-to-br from-moonberry-cream to-moonberry-blush md:min-h-[22rem]" />
            )}
            <div className="flex flex-col justify-center p-8 md:p-12">
              <p className="eyebrow">Collection</p>
              <h3 className="font-serif text-4xl text-moonberry-brown md:text-5xl">{collection.name}</h3>
              <p className="mt-4 leading-relaxed text-moonberry-mauve">{collection.description}</p>
              <Link to={`/collections/${collection.slug}`} className="btn-secondary mt-8 w-fit">
                View Collection
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}

export function CollectionDetailPage({ onQuickAdd }) {
  const { slug } = useParams()
  const [collection, setCollection] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!hasShopifyConfig || !slug) {
        setLoading(false)
        setNotFound(true)
        return
      }
      setLoading(true)
      setNotFound(false)
      try {
        const result = await getCollectionByHandle(slug)
        if (cancelled) return
        if (!result || !result.collection) {
          setCollection(null)
          setProducts([])
          setNotFound(true)
        } else {
          setCollection(result.collection)
          setProducts(result.products)
          setNotFound(false)
        }
      } catch {
        if (!cancelled) {
          setNotFound(true)
          setCollection(null)
          setProducts([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <main className="page-main">
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-moonberry-mauve">Loading collection…</p>
        </div>
      </main>
    )
  }

  if (notFound || !collection) {
    return (
      <main className="page-main">
        <EmptyState
          eyebrow="Collections"
          title="Collection not found"
          description="This collection may not exist or is unavailable."
          action={
            <Link to="/collections" className="btn-primary">
              All collections
            </Link>
          }
        />
      </main>
    )
  }

  return (
    <main className="page-main">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Collections', to: '/collections' },
          { label: collection.name },
        ]}
      />
      <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center">
        <div className="overflow-hidden rounded-4xl">
          {collection.image ? (
            <img
              src={collection.image}
              alt={collection.name}
              className="soft-shadow aspect-[4/5] w-full object-cover lg:aspect-auto lg:min-h-[28rem]"
            />
          ) : (
            <div className="aspect-[4/5] w-full bg-gradient-to-br from-moonberry-cream to-moonberry-blush lg:min-h-[28rem]" />
          )}
        </div>
        <div>
          <p className="eyebrow">Collection</p>
          <h1 className="page-title">{collection.name}</h1>
          <p className="page-description">{collection.description}</p>
        </div>
      </div>
      <div className="mt-20 border-t border-moonberry-rose/15 pt-16">
        <SectionHeading eyebrow="The Edit" title="Products in this collection" />
        {products.length === 0 ? (
          <EmptyState
            title="No products yet"
            description="This collection is being curated. Check back soon."
          />
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onQuickAdd={onQuickAdd} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export function ProductPage({ onQuickAdd, products = [] }) {
  const { slug } = useParams()
  const product = useMemo(() => products.find((item) => item.slug === slug) || null, [products, slug])
  const [selection, setSelection] = useState({
    slug: product?.slug ?? '',
    activeImage: product?.images?.[0] ?? '',
    selectedSize: product?.sizes?.[0] ?? 'Standard',
  })

  const selectedVariant = useMemo(() => {
    if (!product) return { variantId: undefined, price: undefined, compareAtPrice: undefined }
    const sel =
      selection.slug === product.slug ? selection.selectedSize : product.sizes[0] || 'Standard'
    return pickVariantForOption(product, sel)
  }, [product, selection.slug, selection.selectedSize])

  if (!product) {
    return (
      <main className="page-main">
        <EmptyState
          eyebrow="Shop"
          title="Product not found"
          description="This product is unavailable or not published."
          action={
            <Link to="/shop" className="btn-primary">
              Back to Shop
            </Link>
          }
        />
      </main>
    )
  }

  const activeImage =
    selection.slug === product.slug ? selection.activeImage : product.images[0]
  const selectedSize =
    selection.slug === product.slug ? selection.selectedSize : product.sizes[0]
  const displayPrice = selectedVariant.price ?? product.price
  const displayCompare = selectedVariant.compareAtPrice
  const hasDiscount = displayCompare && displayCompare > displayPrice
  const savings = hasDiscount ? displayCompare - displayPrice : 0

  const handleAddToCart = () => {
    const v = pickVariantForOption(product, selectedSize)
    onQuickAdd({
      ...product,
      variantId: v.variantId,
      price: v.price ?? product.price,
      compareAtPrice: v.compareAtPrice ?? product.compareAtPrice,
    })
  }

  return (
    <main className="page-main pb-28 md:pb-20">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/shop' },
          { label: product.name },
        ]}
      />
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <img src={activeImage} alt={product.name} className="product-gallery-main" />
          {product.images.length > 1 ? (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.map((image) => (
                <button
                  key={image}
                  type="button"
                  className={`overflow-hidden rounded-xl border-2 transition ${
                    activeImage === image ? 'border-moonberry-brown' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  onClick={() =>
                    setSelection((prev) => ({
                      ...prev,
                      slug: product.slug,
                      activeImage: image,
                    }))
                  }
                >
                  <img src={image} alt={product.name} className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="product-info-panel">
          <p className="eyebrow">{product.collection}</p>
          <h1 className="mt-2 font-serif text-4xl leading-[1.02] text-moonberry-brown md:text-5xl">{product.name}</h1>
          <div className="mt-6 flex items-end gap-3 border-b border-moonberry-rose/15 pb-6">
            <p className="price-display">{formatINR(displayPrice)}</p>
            {hasDiscount ? (
              <p className="text-sm text-moonberry-mauve line-through">{formatINR(displayCompare)}</p>
            ) : null}
          </div>
          {hasDiscount ? (
            <p className="mt-3 text-sm text-moonberry-rose">You save {formatINR(savings)}</p>
          ) : null}
          <p className="mt-2 text-sm text-moonberry-mauve">Inclusive of estimated GST</p>
          <p className="mt-6 leading-relaxed text-moonberry-mauve">{product.description}</p>
          <div className="mt-4 flex items-center gap-2">
            {product.shadeHex?.map((shade) => (
              <span
                key={shade}
                className="h-5 w-5 rounded-full border border-white/90 shadow-sm"
                style={{ backgroundColor: shade }}
                title={shade}
              />
            ))}
          </div>

          {product.sizes.length > 1 || (product.sizes[0] && product.sizes[0] !== 'Standard') ? (
          <div className="mt-8">
            <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-moonberry-mauve">Select option</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() =>
                    setSelection((prev) => ({
                      ...prev,
                      slug: product.slug,
                      selectedSize: size,
                    }))
                  }
                  className={`filter-pill ${selectedSize === size ? 'filter-pill-active' : ''}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          ) : null}
          <button
            type="button"
            className="btn-primary mt-8 w-full"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>

          <div className="mt-8 space-y-3">
            {product.notes?.length ? (
              <details className="accordion-luxury">
                <summary className="cursor-pointer list-none font-medium text-moonberry-brown [&::-webkit-details-marker]:hidden">
                  Key ingredients &amp; notes
                </summary>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.notes.map((note) => (
                    <span
                      key={note}
                      className="rounded-full bg-moonberry-cream px-3 py-1 text-xs tracking-wide text-moonberry-brown"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </details>
            ) : null}
            <details className="accordion-luxury">
              <summary className="cursor-pointer list-none font-medium text-moonberry-brown [&::-webkit-details-marker]:hidden">
                Shipping &amp; returns
              </summary>
              <p className="mt-2 text-sm text-moonberry-mauve">
                Free shipping above Rs. 999. Easy 7-day returns.{' '}
                <Link to="/shipping-returns" className="text-moonberry-brown underline underline-offset-2">
                  Read full policy
                </Link>
              </p>
            </details>
          </div>
        </div>
      </div>

      <section className="mt-24 border-t border-moonberry-rose/15 pt-20">
        <SectionHeading eyebrow="Complete the ritual" title="You May Also Like" />
        <div className="grid gap-5 md:grid-cols-3">
          {products
            .filter((item) => item.id !== product.id)
            .slice(0, 3)
            .map((item) => (
              <ProductCard key={item.id} product={item} onQuickAdd={onQuickAdd} />
            ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-moonberry-rose/20 bg-white/95 p-3 backdrop-blur-xl md:hidden">
        <button type="button" className="btn-primary w-full" onClick={handleAddToCart}>
          Add to Cart · {formatINR(displayPrice)}
        </button>
      </div>
    </main>
  )
}

export function AboutPage() {
  return (
    <main className="page-main">
      <PageHero
        eyebrow="About Moonberry"
        title="Modern beauty with timeless intent."
        description="A boutique label where fragrance, skin, and nail rituals meet quiet luxury."
      />
      <ProseArticle>
        <p>
          Moonberry is a boutique beauty label where fragrance, skin, and nail rituals meet.
          We formulate intentionally with rich textures and refined scents that feel quietly luxurious.
        </p>
        <p>
          Our design language draws from dusk hues, soft minimalism, and confidence through subtle detail —
          beauty that feels calm, confident, and exquisitely modern.
        </p>
      </ProseArticle>
    </main>
  )
}

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [formStatus, setFormStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <main className="page-main">
      <PageHero
        eyebrow="Contact"
        title="We'd love to hear from you."
        description="For beauty consultations, wholesale, and customer support inquiries."
      />
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <ContactCard icon={Mail} label="Email">
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-[3px] transition hover:text-moonberry-rose">
              {CONTACT_EMAIL}
            </a>
          </ContactCard>
          {HAS_CONTACT_PHONE ? (
            <ContactCard icon={Phone} label="Phone">
              <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="transition hover:text-moonberry-rose">
                {CONTACT_PHONE}
              </a>
            </ContactCard>
          ) : null}
          <ContactCard icon={MapPin} label="Studio">
            {CONTACT_ADDRESS}
          </ContactCard>
        </div>
        <form className="card-surface p-8 md:p-10" onSubmit={(event) => {
            event.preventDefault()
            if (!form.name.trim() || !form.email.includes('@') || form.message.trim().length < 10) {
              setFormStatus({
                type: 'error',
                message: 'Please fill all fields correctly before submitting.',
              })
              return
            }
            setIsSubmitting(true)
            const subject = encodeURIComponent(`MoonBerry inquiry from ${form.name.trim()}`)
            const body = encodeURIComponent(
              `Name: ${form.name.trim()}\nEmail: ${form.email.trim()}\n\n${form.message.trim()}`,
            )
            window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
            setFormStatus({
              type: 'success',
              message: 'Your email app should open with your message ready to send.',
            })
            setForm({ name: '', email: '', message: '' })
            setIsSubmitting(false)
          }}
        >
          <div className="space-y-4">
            <input
              placeholder="Full Name"
              value={form.name}
              onChange={(event) => {
                setForm((prev) => ({ ...prev, name: event.target.value }))
                setFormStatus({ type: '', message: '' })
              }}
              className="input-field"
            />
            <input
              placeholder="Email Address"
              value={form.email}
              onChange={(event) => {
                setForm((prev) => ({ ...prev, email: event.target.value }))
                setFormStatus({ type: '', message: '' })
              }}
              className="input-field"
            />
            <textarea
              placeholder="Your message"
              rows={5}
              value={form.message}
              onChange={(event) => {
                setForm((prev) => ({ ...prev, message: event.target.value }))
                setFormStatus({ type: '', message: '' })
              }}
              className="textarea-field"
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary mt-6 disabled:opacity-60">
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
          {formStatus.message ? (
            <p
              className={`mt-3 text-sm ${formStatus.type === 'error' ? 'text-red-600' : 'text-moonberry-mauve'}`}
              aria-live="polite"
            >
              {formStatus.message}
            </p>
          ) : null}
        </form>
      </div>
    </main>
  )
}

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
]

const checkoutInputClass = 'input-field'

export function CheckoutPage({
  cartItems = [],
  onQtyChange,
  onRemove,
  onCompleteOrder,
  onRefreshCart,
  defaultEmail = '',
}) {
  const totals = calculateOrderTotals(cartItems.map((item) => ({ price: item.price, qty: item.qty })))
  const { subtotal, shipping, gst, total } = totals

  const [phase, setPhase] = useState('checkout')
  const [orderNumber, setOrderNumber] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const [email, setEmail] = useState(() => defaultEmail || '')
  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('Maharashtra')
  const [pincode, setPincode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [codReady, setCodReady] = useState(null)

  useEffect(() => {
    onRefreshCart?.()
  }, [onRefreshCart])

  useEffect(() => {
    let cancelled = false
    fetchCheckoutReadiness()
      .then((status) => {
        if (!cancelled) setCodReady(Boolean(status.codReady))
      })
      .catch(() => {
        if (!cancelled) setCodReady(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const validateForm = () => {
    if (!email.includes('@')) return 'Enter a valid email address.'
    if (phone.replace(/\D/g, '').length < 10) return 'Enter a valid 10-digit mobile number.'
    if (fullName.trim().length < 2) return 'Enter the recipient name.'
    if (addressLine1.trim().length < 5) return 'Enter your delivery address.'
    if (city.trim().length < 2) return 'Enter your city.'
    if (!/^\d{6}$/.test(pincode.trim())) return 'Enter a valid 6-digit PIN code.'
    return ''
  }

  const handlePlaceOrder = async (event) => {
    event.preventDefault()
    setError('')
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setBusy(true)
    try {
      const result = await onCompleteOrder?.({
        email: email.trim(),
        phone: phone.trim(),
        fullName: fullName.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        city: city.trim(),
        state,
        pincode: pincode.trim(),
        paymentMethod,
        total,
      })
      if (result?.redirected) return
      setOrderNumber(result?.orderNumber || '')
      setPhase('complete')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err?.message || 'Could not place your order. Try again.')
    } finally {
      setBusy(false)
    }
  }

  if (phase === 'complete') {
    return (
      <main className="page-main">
        <div className="empty-state">
          <CheckCircle2 className="mx-auto text-moonberry-rose" size={52} aria-hidden />
          <h1 className="mt-6 font-serif text-3xl text-moonberry-brown md:text-4xl">Thank you for your order</h1>
          <p className="mt-4 text-moonberry-mauve">
            Order <span className="font-medium text-moonberry-brown">{orderNumber}</span> is confirmed.
            Updates will be sent to {email}.
          </p>
          <p className="mt-2 text-sm text-moonberry-mauve">
            {paymentMethod === 'cod'
              ? 'Pay when your package arrives.'
              : 'Complete payment on the secure checkout page to confirm.'}
          </p>
          <Link to="/shop" className="btn-primary mt-8">
            Continue shopping
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="page-main">
      <PageHero
        eyebrow="Checkout"
        title="Complete your order"
        description="A refined checkout experience — contact, delivery, and payment in one place."
      />

      {defaultEmail ? (
        <p className="mb-6 text-sm text-moonberry-mauve">
          Signed in as <span className="text-moonberry-brown">{defaultEmail}</span>.
        </p>
      ) : null}

      {codReady === false ? (
        <div
          className="mb-8 rounded-2xl border border-amber-300/80 bg-amber-50/95 p-5 text-sm text-amber-950"
          role="alert"
        >
          <p className="font-medium">Checkout is temporarily unavailable.</p>
          <p className="mt-2 leading-relaxed">
            {import.meta.env.DEV
              ? 'Add Shopify Admin API credentials to your .env and restart the dev server. Run npm run check:env to verify.'
              : 'Please try again later or contact us for help placing your order.'}
          </p>
        </div>
      ) : null}

      {cartItems.length === 0 ? (
        <EmptyState
          title="Your bag is empty"
          description="Add something beautiful before checking out."
          action={
            <Link to="/shop" className="btn-primary">
              Browse the shop
            </Link>
          }
        />
      ) : (
        <form onSubmit={handlePlaceOrder} className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="space-y-6">
            <CheckoutSection step="1" title="Your bag">
              <div className="mt-4 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.lineId || item.id}
                    className="flex gap-4 rounded-2xl border border-moonberry-rose/25 p-3"
                  >
                    <img src={item.image} alt={item.name} className="h-20 w-16 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-moonberry-brown">{item.name}</p>
                      {item.variantTitle && item.variantTitle !== 'Default Title' ? (
                        <p className="text-xs text-moonberry-mauve">{item.variantTitle}</p>
                      ) : null}
                      <p className="text-sm text-moonberry-mauve">{formatINR(item.price)} each</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          className="h-8 w-8 rounded-full border border-moonberry-rose/40 text-sm"
                          onClick={() => onQtyChange(item.id, item.qty - 1)}
                        >
                          −
                        </button>
                        <span className="text-sm">Qty {item.qty}</span>
                        <button
                          type="button"
                          className="h-8 w-8 rounded-full border border-moonberry-rose/40 text-sm"
                          onClick={() => onQtyChange(item.id, item.qty + 1)}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="ml-auto text-xs text-moonberry-mauve underline"
                          onClick={() => onRemove(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CheckoutSection>

            <CheckoutSection step="2" title="Contact">
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-moonberry-mauve">Email</label>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={checkoutInputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-moonberry-mauve">Mobile</label>
                  <input
                    type="tel"
                    autoComplete="tel"
                    required
                    placeholder="10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={checkoutInputClass}
                  />
                </div>
              </div>
            </CheckoutSection>

            <CheckoutSection step="3" title="Delivery address">
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-moonberry-mauve">
                    Full name
                  </label>
                  <input
                    type="text"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={checkoutInputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-moonberry-mauve">
                    Address line 1
                  </label>
                  <input
                    type="text"
                    autoComplete="address-line1"
                    required
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className={checkoutInputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-moonberry-mauve">
                    Address line 2 (optional)
                  </label>
                  <input
                    type="text"
                    autoComplete="address-line2"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className={checkoutInputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-moonberry-mauve">City</label>
                  <input
                    type="text"
                    autoComplete="address-level2"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={checkoutInputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-moonberry-mauve">State</label>
                  <select
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className={checkoutInputClass}
                  >
                    {INDIAN_STATES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-moonberry-mauve">PIN code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className={checkoutInputClass}
                  />
                </div>
              </div>
            </CheckoutSection>

            <CheckoutSection step="4" title="Payment">
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { id: 'cod', label: 'Cash on delivery' },
                  { id: 'shopify', label: 'Pay online (UPI / card)' },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPaymentMethod(option.id)}
                    className={`filter-pill ${paymentMethod === option.id ? 'filter-pill-active' : ''}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {paymentMethod === 'cod' ? (
                <p className="mt-4 text-sm text-moonberry-mauve">
                  Pay in cash when your order is delivered. Your order is created in Shopify immediately.
                </p>
              ) : (
                <p className="mt-4 text-sm text-moonberry-mauve">
                  After you place the order, you’ll open Shopify’s secure payment page for UPI, cards, and other
                  methods enabled in your store. Address and contact stay on Moonberry.
                </p>
              )}
            </CheckoutSection>
          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="card-surface p-6 md:p-8">
              <p className="eyebrow">Summary</p>
              <h3 className="font-serif text-2xl text-moonberry-brown">Order total</h3>

              <div className="mt-6 space-y-2 border-b border-moonberry-rose/25 pb-6 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-moonberry-mauve">
                  <span>Shipping (India)</span>
                  <span>{shipping === 0 ? 'Free' : formatINR(shipping)}</span>
                </div>
                <div className="flex justify-between text-moonberry-mauve">
                  <span>GST (18%)</span>
                  <span>{formatINR(gst)}</span>
                </div>
                <div className="flex justify-between pt-2 text-base font-semibold text-moonberry-brown">
                  <span>Total</span>
                  <span>{formatINR(total)}</span>
                </div>
              </div>

              {error ? (
                <p className="mt-4 text-sm text-red-600" role="alert" aria-live="polite">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={busy || codReady !== true}
                className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy
                  ? 'Placing order…'
                  : paymentMethod === 'cod'
                    ? 'Place order (COD)'
                    : 'Place order & pay on Shopify'}
              </button>

              <p className="mt-4 text-center text-[11px] leading-relaxed text-moonberry-mauve">
                Cash on delivery or pay online via Shopify.
              </p>

              <Link
                to="/shop"
                className="mt-4 block text-center text-sm text-moonberry-mauve underline underline-offset-2"
              >
                Continue shopping
              </Link>
            </div>
          </aside>
        </form>
      )}
    </main>
  )
}

function StaticArticle({ eyebrow, title, children }) {
  return (
    <main className="page-main">
      <PageHero eyebrow={eyebrow} title={title} />
      <ProseArticle>{children}</ProseArticle>
    </main>
  )
}

export function ShippingReturnsPage() {
  return (
    <StaticArticle eyebrow="Policies" title="Shipping & returns">
      <p>
        We ship across India. Orders are packed with care and dispatched from our fulfilment partners. You will receive
        tracking details by SMS and email once your order ships.
      </p>
      <h2 className="font-serif text-2xl text-moonberry-brown">Shipping</h2>
      <ul className="list-inside list-disc space-y-2">
        <li>Free standard shipping on orders above ₹999 (before discounts where applicable).</li>
        <li>₹99 flat shipping for orders below ₹999.</li>
        <li>Typical delivery: 2–7 business days depending on your PIN code.</li>
      </ul>
      <h2 className="font-serif text-2xl text-moonberry-brown">Returns</h2>
      <p>
        Unused products in original packaging may be returned within 7 days of delivery where eligible. Opened or used
        items cannot be returned for hygiene reasons unless the product is defective.
      </p>
      <p>
        For return requests, email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-moonberry-brown underline underline-offset-2">
          {CONTACT_EMAIL}
        </a>{' '}
        with your order number. Final return eligibility is confirmed in your order confirmation email.
      </p>
    </StaticArticle>
  )
}

export function PrivacyPolicyPage() {
  return (
    <StaticArticle eyebrow="Legal" title="Privacy policy">
      <p>
        Moonberry respects your privacy. This site uses your information only to operate the store, process orders, and
        communicate about purchases and marketing where you have opted in.
      </p>
      <h2 className="font-serif text-2xl text-moonberry-brown">What we collect</h2>
      <p>
        When you browse, create an account, or check out, we may process data such as your name, email, phone, shipping
        address, and order history. Online payments are processed by Shopify Payments; cash on delivery is collected at
        delivery. We do not store your full card details on this site.
      </p>
      <h2 className="font-serif text-2xl text-moonberry-brown">Cookies & analytics</h2>
      <p>
        We may use cookies and similar technologies needed for the cart, login session, and basic site performance. You
        can control cookies through your browser settings.
      </p>
      <h2 className="font-serif text-2xl text-moonberry-brown">Contact</h2>
      <p>
        Questions about privacy? Reach us at{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-moonberry-brown underline underline-offset-2">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </StaticArticle>
  )
}

export function IngredientsUsagePage() {
  return (
    <StaticArticle eyebrow="Care" title="Ingredients & usage">
      <p>
        Moonberry products are formulated for everyday wear and Indian climates. Always read the ingredient list on the
        product packaging before use, especially if you have allergies or sensitive skin.
      </p>
      <h2 className="font-serif text-2xl text-moonberry-brown">How to use</h2>
      <ul className="list-inside list-disc space-y-2">
        <li>Skincare: apply to clean skin unless the label directs otherwise; follow with SPF in the daytime.</li>
        <li>Makeup: patch test new shades on the jawline if you have reactive skin.</li>
        <li>Fragrance: spray on pulse points; avoid rubbing wrists together vigorously.</li>
      </ul>
      <h2 className="font-serif text-2xl text-moonberry-brown">Storage</h2>
      <p>Store products away from direct sunlight and excessive heat. Close lids tightly after each use.</p>
      <p className="rounded-2xl border border-moonberry-rose/30 bg-white/70 p-4 text-sm">
        Product-specific directions appear on each Shopify product page and on the physical label. When in doubt,
        consult a dermatologist.
      </p>
    </StaticArticle>
  )
}

export function TermsPage() {
  return (
    <StaticArticle eyebrow="Legal" title="Terms of use">
      <p>
        By using this website and purchasing from Moonberry, you agree to these terms. Product availability, prices,
        and promotions may change without notice; the checkout page on Shopify shows the final price and terms for
        your order.
      </p>
      <h2 className="font-serif text-2xl text-moonberry-brown">Orders</h2>
      <p>
        When you place an order, you offer to buy the items in your cart at the prices shown at checkout. We may
        refuse or cancel orders in cases of pricing errors, suspected fraud, or stock issues.
      </p>
      <h2 className="font-serif text-2xl text-moonberry-brown">Content</h2>
      <p>
        Text, images, and branding on this site are owned by Moonberry or used with permission. You may not copy or
        reuse site content for commercial purposes without written consent.
      </p>
      <h2 className="font-serif text-2xl text-moonberry-brown">Limitation</h2>
      <p>
        To the extent permitted by law, Moonberry is not liable for indirect or consequential damages arising from use
        of this site or products. Some jurisdictions do not allow certain limitations; in those cases, our liability is
        limited to the maximum permitted by law.
      </p>
    </StaticArticle>
  )
}

export function FaqPage() {
  return (
    <main className="page-main">
      <PageHero
        eyebrow="Help"
        title="Frequently asked questions"
        description="Quick answers about orders, delivery, and shopping with Moonberry."
        align="center"
      />
      <LuxeAccordion
        items={[
          {
            q: 'How do I pay?',
            a: 'Add items to your bag, go to Checkout, enter your delivery details, and pay with cash on delivery, UPI, or card.',
          },
          {
            q: 'Do you ship all over India?',
            a: 'We aim to serve pan-India. Delivery timelines and COD availability depend on your PIN code and are confirmed at checkout.',
          },
          {
            q: 'How do I track my order?',
            a: 'You will receive order and shipping updates by email once your order is placed and dispatched.',
          },
          {
            q: 'Can I return a product?',
            a: 'See our Shipping & returns page for eligibility and how to request a return within the stated window.',
          },
        ]}
      />
      <p className="mx-auto mt-12 max-w-3xl text-center text-sm text-moonberry-mauve">
        Still need help?{' '}
        <Link to="/contact" className="text-moonberry-brown underline underline-offset-[3px]">
          Contact us
        </Link>
        .
      </p>
    </main>
  )
}

export function NotFoundPage() {
  return (
    <main className="page-main">
      <EmptyState
        eyebrow="404"
        title="Page not found"
        description="The link may be broken or the page may have moved."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/" className="btn-primary">
              Home
            </Link>
            <Link to="/shop" className="btn-secondary">
              Shop
            </Link>
          </div>
        }
      />
    </main>
  )
}
