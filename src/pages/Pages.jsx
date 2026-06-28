import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { testimonials } from '../data/mockData'
import { ProductCard, SectionHeading } from '../components/ProductCard'
import { formatINR } from '../lib/currency'
import { calculateOrderTotals } from '../lib/pricing'
import { fetchCheckoutReadiness } from '../lib/checkoutApi'
import { getCollectionByHandle, hasShopifyConfig, pickVariantForOption } from '../lib/shopify'
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE } from '../lib/site'

export function HomePage({ onQuickAdd, products = [], collections = [] }) {
  const bestSellers = products.filter((item) => item.bestSeller)
  const [email, setEmail] = useState('')
  const [newsletterMessage, setNewsletterMessage] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)

  return (
    <div>
      <section className="section-shell grid min-h-[78vh] items-center gap-10 py-14 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#f7f1ee] via-[#eedfe2] to-[#cfaeb4] p-8 md:p-12">
          <div className="pointer-events-none absolute -left-8 -top-16 h-52 w-52 rounded-full bg-white/40 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-moonberry-mauve/30 blur-3xl" />
          <p className="mb-4 text-xs uppercase tracking-[0.28em] text-moonberry-mauve">Moonberry Beauty Studio</p>
          <h1 className="editorial-heading">Perfume, Skincare, Makeup and Nails - For Everyone.</h1>
          <p className="mt-6 max-w-lg text-moonberry-mauve">
            Discover premium fragrances, skincare, cosmetics, and nail essentials designed for every style, tone, and identity.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop" className="rounded-full bg-moonberry-brown px-7 py-3 text-sm tracking-[0.15em] uppercase text-white transition hover:opacity-90">Shop Now</Link>
            <Link to="/collections" className="rounded-full border border-moonberry-rose/50 px-7 py-3 text-sm tracking-[0.15em] uppercase transition hover:bg-white/70">Explore Collections</Link>
          </div>
        </div>
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1300&q=80"
            alt="Moonberry beauty hero"
            className="soft-shadow h-[620px] w-full rounded-[2.4rem] object-cover"
          />
          <div className="glass absolute -bottom-7 right-6 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-moonberry-mauve">Spring Capsule</p>
            <p className="font-serif text-2xl">Beauty Launches</p>
          </div>
        </div>
      </section>

      <section className="section-shell py-16">
        <SectionHeading
          eyebrow="Featured Collections"
          title="Curated for Modern Luxury"
          description="Editorial beauty edits with a boutique sensibility."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              to={`/collections/${collection.slug}`}
              className="group relative block overflow-hidden rounded-3xl"
            >
              <img
                src={collection.image}
                alt={collection.name}
                className="h-80 w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/20 to-transparent p-6 text-white">
                <p className="mt-44 text-xs uppercase tracking-[0.2em]">Collection</p>
                <h3 className="font-serif text-3xl">{collection.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-shell py-16">
        <SectionHeading eyebrow="Best Sellers" title="Most Loved Pieces" />
        <div className="grid gap-5 md:grid-cols-3">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} onQuickAdd={onQuickAdd} />
          ))}
        </div>
      </section>

      <section className="section-shell grid gap-6 py-16 md:grid-cols-2">
        <img
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1300&q=80"
          alt="Brand story"
          className="h-[500px] w-full rounded-3xl object-cover"
        />
        <div className="flex items-center rounded-3xl bg-white/70 p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-moonberry-mauve">Our Story</p>
            <h2 className="mt-2 font-serif text-5xl leading-none">Self-expression, crafted beautifully.</h2>
            <p className="mt-5 text-moonberry-mauve">
              Moonberry was built around the idea that beauty can feel calm, confident, and exquisitely modern. Every formula is developed with meticulous attention to texture, tone, scent, and finish.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell py-16">
        <SectionHeading eyebrow="Testimonials" title="Loved by the Moonberry Community" />
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article key={testimonial.id} className="rounded-3xl bg-white/80 p-6">
              <p className="text-lg leading-relaxed text-moonberry-brown">{testimonial.quote}</p>
              <p className="mt-6 text-sm uppercase tracking-[0.15em] text-moonberry-mauve">{testimonial.name}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell pb-20 pt-8">
        <div className="rounded-3xl bg-moonberry-brown px-7 py-12 text-center text-white">
          <p className="text-xs uppercase tracking-[0.24em] text-moonberry-rose">Newsletter</p>
          <h3 className="mt-3 font-serif text-4xl">Join the Moonberry Edit</h3>
          <p className="mx-auto mt-3 max-w-lg text-white/80">Receive early access to beauty launches, exclusive offers, and private editorials.</p>
          <div className="mx-auto mt-6 flex max-w-xl flex-col gap-3 sm:flex-row">
            <input
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setNewsletterMessage('')
              }}
              className="h-12 flex-1 rounded-full border border-white/30 bg-white/10 px-5 text-white placeholder:text-white/70 outline-none"
              placeholder="Enter your email"
            />
            <button
              type="button"
              disabled={isSubscribing}
              className="h-12 rounded-full bg-white px-6 text-sm tracking-[0.15em] uppercase text-moonberry-brown disabled:cursor-not-allowed disabled:opacity-60"
              onClick={async () => {
                if (!email.includes('@')) {
                  setNewsletterMessage('Please enter a valid email address.')
                  return
                }
                setIsSubscribing(true)
                await new Promise((resolve) => setTimeout(resolve, 600))
                setNewsletterMessage('Thanks for subscribing. You will receive launch alerts soon.')
                setEmail('')
                setIsSubscribing(false)
              }}
            >
              {isSubscribing ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>
          {newsletterMessage ? (
            <p className="mt-3 text-sm text-white/80" aria-live="polite">
              {newsletterMessage}
            </p>
          ) : null}
        </div>
      </section>

      <section className="section-shell pb-10">
        <div className="grid gap-3 rounded-3xl border border-moonberry-rose/25 bg-white/70 p-6 text-center md:grid-cols-4 md:text-left">
          <p className="text-sm text-moonberry-brown">UPI, cards and wallet payments</p>
          <p className="text-sm text-moonberry-brown">Cash on Delivery in serviceable PIN codes</p>
          <p className="text-sm text-moonberry-brown">Free shipping above Rs. 999</p>
          <p className="text-sm text-moonberry-brown">Made for Indian weather and routines</p>
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
    <main className="section-shell py-16">
      <SectionHeading eyebrow="Shop" title="All Products" description="Luxury perfumes, skincare, cosmetics, and nail care." />
      <div className="mb-6 grid gap-3 rounded-2xl border border-moonberry-rose/30 bg-white/70 p-4 md:grid-cols-[1fr_auto]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products..."
          className="h-11 rounded-xl border border-moonberry-rose/40 bg-white px-4 outline-none"
        />
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="h-11 rounded-xl border border-moonberry-rose/40 bg-white px-4 text-sm text-moonberry-brown outline-none"
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
            className={`rounded-full px-5 py-2 text-xs uppercase tracking-[0.16em] transition ${
              activeCategory === category
                ? 'bg-moonberry-brown text-white'
                : 'border border-moonberry-rose/50 bg-white/70 text-moonberry-brown'
            }`}
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
        <div className="rounded-3xl border border-dashed border-moonberry-rose/40 bg-white/60 p-8 text-center">
          <p className="text-moonberry-brown">No products found for your filters.</p>
          <p className="mt-2 text-sm text-moonberry-mauve">Try changing category, search, or sort options.</p>
        </div>
      )}
    </main>
  )
}

export function CollectionsPage({ collections = [] }) {
  return (
    <main className="section-shell py-16">
      <SectionHeading eyebrow="Collections" title="Browse by Edit" />
      <div className="space-y-6">
        {collections.map((collection) => (
          <article
            key={collection.id}
            className="grid gap-5 overflow-hidden rounded-3xl bg-white/80 md:grid-cols-[1.3fr_1fr]"
          >
            <img src={collection.image} alt={collection.name} className="h-80 w-full object-cover" />
            <div className="p-8">
              <h3 className="font-serif text-4xl">{collection.name}</h3>
              <p className="mt-3 text-moonberry-mauve">{collection.description}</p>
              <Link
                to={`/collections/${collection.slug}`}
                className="mt-6 inline-flex rounded-full border border-moonberry-rose/50 px-6 py-2 text-sm uppercase tracking-[0.14em] transition hover:bg-moonberry-cream"
              >
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
      <main className="section-shell py-20">
        <p className="text-center text-moonberry-mauve">Loading collection...</p>
      </main>
    )
  }

  if (notFound || !collection) {
    return (
      <main className="section-shell py-16">
        <div className="rounded-3xl border border-moonberry-rose/30 bg-white/70 p-10 text-center">
          <h2 className="font-serif text-3xl text-moonberry-brown">Collection not found</h2>
          <p className="mt-3 text-moonberry-mauve">This collection may not exist or is unavailable.</p>
          <Link
            to="/collections"
            className="mt-6 inline-flex rounded-full bg-moonberry-brown px-6 py-3 text-sm uppercase tracking-[0.12em] text-white"
          >
            All collections
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="section-shell py-16">
      <p className="mb-6 text-sm text-moonberry-mauve">
        <Link to="/" className="hover:text-moonberry-brown">
          Home
        </Link>{' '}
        /{' '}
        <Link to="/collections" className="hover:text-moonberry-brown">
          Collections
        </Link>{' '}
        / <span className="text-moonberry-brown">{collection.name}</span>
      </p>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="overflow-hidden rounded-3xl">
          <img src={collection.image} alt={collection.name} className="h-96 w-full object-cover lg:h-full lg:min-h-[420px]" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-moonberry-mauve">Collection</p>
          <h1 className="mt-2 font-serif text-5xl text-moonberry-brown">{collection.name}</h1>
          <p className="mt-4 text-moonberry-mauve">{collection.description}</p>
        </div>
      </div>
      <div className="mt-14">
        <h2 className="font-serif text-3xl text-moonberry-brown">Products in this edit</h2>
        {products.length === 0 ? (
          <p className="mt-6 rounded-3xl border border-dashed border-moonberry-rose/40 bg-white/60 p-8 text-center text-moonberry-mauve">
            No products in this collection yet.
          </p>
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
  const [pincode, setPincode] = useState('')
  const [deliveryMessage, setDeliveryMessage] = useState('')
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
      <main className="section-shell py-16">
        <div className="rounded-3xl border border-moonberry-rose/30 bg-white/70 p-10 text-center">
          <h2 className="font-serif text-4xl text-moonberry-brown">Product not found</h2>
          <p className="mt-3 text-moonberry-mauve">
            This product is unavailable or not published in Shopify.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex rounded-full bg-moonberry-brown px-6 py-3 text-sm uppercase tracking-[0.12em] text-white"
          >
            Back to Shop
          </Link>
        </div>
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
    <main className="section-shell pb-28 pt-16 md:pb-16">
      <p className="mb-5 text-sm text-moonberry-mauve">
        <Link to="/" className="hover:text-moonberry-brown">Home</Link> /{' '}
        <Link to="/shop" className="hover:text-moonberry-brown">Shop</Link> /{' '}
        <span className="text-moonberry-brown">{product.name}</span>
      </p>
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <img src={activeImage} alt={product.name} className="h-[620px] w-full rounded-3xl object-cover" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            {product.images.map((image) => (
              <button
                key={image}
                type="button"
                className={`overflow-hidden rounded-2xl border-2 transition ${
                  activeImage === image ? 'border-moonberry-brown' : 'border-transparent'
                }`}
                onClick={() =>
                  setSelection((prev) => ({
                    ...prev,
                    slug: product.slug,
                    activeImage: image,
                  }))
                }
              >
                <img src={image} alt={product.name} className="h-40 w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-3xl bg-white/75 p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-moonberry-mauve">{product.collection}</p>
          <h1 className="mt-2 font-serif text-5xl leading-none">{product.name}</h1>
          <div className="mt-4 flex items-end gap-3">
            <p className="text-2xl">{formatINR(displayPrice)}</p>
            {hasDiscount ? (
              <p className="text-sm text-moonberry-mauve line-through">{formatINR(displayCompare)}</p>
            ) : null}
          </div>
          {hasDiscount ? (
            <p className="mt-1 text-sm text-green-700">You save {formatINR(savings)} on this item</p>
          ) : null}
          <p className="mt-1 text-sm text-moonberry-mauve">Inclusive of estimated GST</p>
          <p className="mt-4 text-moonberry-mauve">{product.description}</p>
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

          <div className="mt-6">
            <p className="mb-2 text-sm uppercase tracking-[0.12em] text-moonberry-mauve">Option</p>
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
                  className={`rounded-full border px-4 py-2 text-sm ${selectedSize === size ? 'border-moonberry-brown bg-moonberry-brown text-white' : 'border-moonberry-rose/60'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="mt-8 w-full rounded-full bg-moonberry-brown px-6 py-3 text-sm uppercase tracking-[0.15em] text-white"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
          <div className="mt-3 grid gap-3 rounded-2xl border border-moonberry-rose/30 bg-white/90 p-4 text-sm text-moonberry-brown sm:grid-cols-2">
            <span>UPI / Cards / Wallets</span>
            <span>COD on eligible PIN codes</span>
          </div>

          <div className="mt-4 rounded-2xl border border-moonberry-rose/30 p-4">
            <p className="text-sm font-medium text-moonberry-brown">Check delivery by PIN code</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={pincode}
                onChange={(event) => {
                  setPincode(event.target.value.replace(/\D/g, '').slice(0, 6))
                  setDeliveryMessage('')
                }}
                placeholder="Enter 6-digit PIN code"
                className="h-11 flex-1 rounded-xl border border-moonberry-rose/40 px-4 outline-none"
              />
              <button
                type="button"
                className="h-11 rounded-xl bg-moonberry-brown px-5 text-sm uppercase tracking-widest text-white"
                onClick={() => {
                  if (pincode.length !== 6) {
                    setDeliveryMessage('Please enter a valid 6-digit PIN code.')
                    return
                  }
                  setDeliveryMessage('Delivery in 2-5 days. COD is available for this area.')
                }}
              >
                Check
              </button>
            </div>
            {deliveryMessage ? <p className="mt-2 text-sm text-moonberry-mauve">{deliveryMessage}</p> : null}
          </div>

          <div className="mt-8 space-y-3">
            <details open className="rounded-2xl border border-moonberry-rose/30 p-4">
              <summary className="cursor-pointer font-medium">Product Details</summary>
              <p className="mt-2 text-sm text-moonberry-mauve">Premium formulation with focus on skin compatibility, finish, and longevity.</p>
            </details>
            <details open className="rounded-2xl border border-moonberry-rose/30 p-4">
              <summary className="cursor-pointer font-medium">Fragrance Notes / Key Ingredients</summary>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.notes?.map((note) => (
                  <span
                    key={note}
                    className="rounded-full bg-moonberry-cream px-3 py-1 text-xs tracking-wide text-moonberry-brown"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </details>
            <details className="rounded-2xl border border-moonberry-rose/30 p-4">
              <summary className="cursor-pointer font-medium">Shipping & Returns</summary>
              <p className="mt-2 text-sm text-moonberry-mauve">Free shipping above Rs. 999. Easy 7-day returns.</p>
            </details>
          </div>
        </div>
      </div>

      <section className="pt-16">
        <SectionHeading eyebrow="Related Products" title="You May Also Like" />
        <div className="grid gap-5 md:grid-cols-3">
          {products
            .filter((item) => item.id !== product.id)
            .slice(0, 3)
            .map((item) => (
              <ProductCard key={item.id} product={item} onQuickAdd={onQuickAdd} />
            ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-moonberry-rose/30 bg-white/95 p-3 backdrop-blur md:hidden">
        <button
          type="button"
          className="w-full rounded-full bg-moonberry-brown px-6 py-3 text-sm uppercase tracking-[0.15em] text-white"
          onClick={handleAddToCart}
        >
          Add to Cart · {formatINR(displayPrice)}
        </button>
      </div>
    </main>
  )
}

export function AboutPage() {
  return (
    <main className="section-shell py-16">
      <SectionHeading eyebrow="About Moonberry" title="Modern beauty with timeless intent." />
      <div className="grid gap-6 md:grid-cols-2">
        <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1300&q=80" alt="Moonberry beauty products" className="h-[520px] w-full rounded-3xl object-cover" />
        <div className="rounded-3xl bg-white/75 p-8 text-moonberry-mauve">
          <p>
            Moonberry is a boutique beauty label where fragrance, skin, and nail rituals meet.
            We formulate intentionally with rich textures and refined scents that feel quietly luxurious.
          </p>
          <p className="mt-4">
            Our design language draws from dusk hues, soft minimalism, and confidence through subtle detail.
          </p>
        </div>
      </div>
    </main>
  )
}

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [formStatus, setFormStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <main className="section-shell py-16">
      <SectionHeading eyebrow="Contact" title="We'd love to hear from you." />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-white/80 p-8">
          <p className="mb-5 text-moonberry-mauve">For beauty consultations, wholesale, and customer support inquiries.</p>
          <p>
            Email:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-moonberry-brown underline underline-offset-2">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="mt-2">
            Phone:{' '}
            <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="text-moonberry-brown">
              {CONTACT_PHONE}
            </a>
          </p>
          <p className="mt-2">Studio: {CONTACT_ADDRESS}</p>
        </div>
        <form
          className="rounded-3xl bg-white/80 p-8"
          onSubmit={(event) => {
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
          <div className="space-y-3">
            <input
              placeholder="Full Name"
              value={form.name}
              onChange={(event) => {
                setForm((prev) => ({ ...prev, name: event.target.value }))
                setFormStatus({ type: '', message: '' })
              }}
              className="h-12 w-full rounded-2xl border border-moonberry-rose/40 bg-white px-4 outline-none"
            />
            <input
              placeholder="Email Address"
              value={form.email}
              onChange={(event) => {
                setForm((prev) => ({ ...prev, email: event.target.value }))
                setFormStatus({ type: '', message: '' })
              }}
              className="h-12 w-full rounded-2xl border border-moonberry-rose/40 bg-white px-4 outline-none"
            />
            <textarea
              placeholder="Message"
              rows={5}
              value={form.message}
              onChange={(event) => {
                setForm((prev) => ({ ...prev, message: event.target.value }))
                setFormStatus({ type: '', message: '' })
              }}
              className="w-full rounded-2xl border border-moonberry-rose/40 bg-white p-4 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 rounded-full bg-moonberry-brown px-7 py-3 text-sm uppercase tracking-[0.15em] text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
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

const checkoutInputClass =
  'h-12 w-full rounded-2xl border border-moonberry-rose/40 bg-white px-4 text-moonberry-brown outline-none focus:border-moonberry-brown/50'

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
      <main className="section-shell py-16 md:py-20">
        <div className="mx-auto max-w-xl rounded-3xl bg-white/85 p-10 text-center shadow-[0_12px_40px_rgba(74,59,61,0.08)] md:p-12">
          <CheckCircle2 className="mx-auto text-green-700" size={48} aria-hidden />
          <h1 className="mt-6 font-serif text-3xl text-moonberry-brown">Thank you for your order</h1>
          <p className="mt-3 text-moonberry-mauve">
            Your order <span className="font-medium text-moonberry-brown">{orderNumber}</span> is confirmed.
            We will email updates to {email}.
          </p>
          <p className="mt-2 text-sm text-moonberry-mauve">
            {paymentMethod === 'cod'
              ? 'Pay when your package arrives.'
              : 'Complete payment on Shopify’s secure page, then you’ll receive a confirmation email.'}
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex rounded-full bg-moonberry-brown px-7 py-3 text-sm uppercase tracking-[0.15em] text-white"
          >
            Continue shopping
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="section-shell py-12 md:py-16">
      <SectionHeading
        eyebrow="Checkout"
        title="Complete your order"
        description="Contact, delivery, and payment — all on Moonberry. No redirects."
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
          <p className="font-medium">Checkout is not ready on the server yet.</p>
          <p className="mt-2 leading-relaxed">
            Add <code className="rounded bg-white/80 px-1">SHOPIFY_CLIENT_ID</code> and{' '}
            <code className="rounded bg-white/80 px-1">SHOPIFY_CLIENT_SECRET</code> from the Shopify Dev
            Dashboard to your <code className="rounded bg-white/80 px-1">.env</code> (or Vercel), then restart
            the dev server. Run <code className="rounded bg-white/80 px-1">npm run check:env</code> to verify.
          </p>
        </div>
      ) : null}

      {cartItems.length === 0 ? (
        <div className="mx-auto max-w-xl rounded-3xl bg-white/75 p-10 text-center">
          <p className="text-moonberry-brown">Your bag is empty.</p>
          <Link
            to="/shop"
            className="mt-6 inline-flex rounded-full bg-moonberry-brown px-7 py-3 text-sm uppercase tracking-[0.15em] text-white"
          >
            Browse the shop
          </Link>
        </div>
      ) : (
        <form onSubmit={handlePlaceOrder} className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="space-y-6">
            <section className="rounded-3xl bg-white/75 p-6 md:p-8">
              <h2 className="font-serif text-xl text-moonberry-brown">Items in your bag</h2>
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
            </section>

            <section className="rounded-3xl bg-white/75 p-6 md:p-8">
              <h2 className="font-serif text-xl text-moonberry-brown">Contact</h2>
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
            </section>

            <section className="rounded-3xl bg-white/75 p-6 md:p-8">
              <h2 className="font-serif text-xl text-moonberry-brown">Delivery address</h2>
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
            </section>

            <section className="rounded-3xl bg-white/75 p-6 md:p-8">
              <h2 className="font-serif text-xl text-moonberry-brown">Payment</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { id: 'cod', label: 'Cash on delivery' },
                  { id: 'shopify', label: 'Pay online (UPI / card)' },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPaymentMethod(option.id)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      paymentMethod === option.id
                        ? 'border-moonberry-brown bg-moonberry-brown text-white'
                        : 'border-moonberry-rose/40 text-moonberry-brown hover:bg-moonberry-cream/60'
                    }`}
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
            </section>
          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="rounded-3xl bg-white/85 p-6 shadow-[0_12px_40px_rgba(74,59,61,0.08)] md:p-8">
              <h3 className="font-serif text-2xl text-moonberry-brown">Order summary</h3>

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
                className="mt-6 w-full rounded-full bg-moonberry-brown px-6 py-3.5 text-sm uppercase tracking-[0.15em] text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy
                  ? 'Placing order…'
                  : paymentMethod === 'cod'
                    ? 'Place order (COD)'
                    : 'Place order & pay on Shopify'}
              </button>

              <p className="mt-4 text-center text-[11px] leading-relaxed text-moonberry-mauve">
                All payments run through Shopify — cash on delivery or online via Shopify Payments. No third-party
                payment gateway.
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
    <main className="section-shell py-16">
      <SectionHeading eyebrow={eyebrow} title={title} />
      <article className="mx-auto max-w-3xl space-y-5 text-[15px] leading-relaxed text-moonberry-mauve md:text-base">
        {children}
      </article>
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
    <main className="section-shell py-16">
      <SectionHeading
        eyebrow="Help"
        title="Frequently asked questions"
        description="Quick answers about orders, delivery, and shopping with Moonberry."
      />
      <div className="mx-auto max-w-3xl space-y-4">
        {[
          {
            q: 'How do I pay?',
            a: 'Add items to your bag, go to Checkout on this site, enter your delivery details, and pay with cash on delivery, UPI, or card — all without leaving MoonBerry.',
          },
          {
            q: 'Do you ship all over India?',
            a: 'We aim to serve pan-India. Delivery timelines and COD availability depend on your PIN code and are confirmed at checkout.',
          },
          {
            q: 'How do I track my order?',
            a: 'You will receive order and shipping updates by email. Paid orders also appear in Shopify Admin for fulfillment.',
          },
          {
            q: 'Can I return a product?',
            a: 'See our Shipping & returns page for eligibility and how to request a return within the stated window.',
          },
        ].map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-moonberry-rose/30 bg-white/75 p-5 open:bg-white/90"
          >
            <summary className="cursor-pointer font-medium text-moonberry-brown">{item.q}</summary>
            <p className="mt-3 text-sm text-moonberry-mauve">{item.a}</p>
          </details>
        ))}
      </div>
      <p className="mx-auto mt-10 max-w-3xl text-center text-sm text-moonberry-mauve">
        Still need help?{' '}
        <Link to="/contact" className="text-moonberry-brown underline underline-offset-2">
          Contact us
        </Link>
        .
      </p>
    </main>
  )
}

export function NotFoundPage() {
  return (
    <main className="section-shell py-24 text-center">
      <p className="text-xs uppercase tracking-[0.28em] text-moonberry-mauve">404</p>
      <h1 className="mt-3 font-serif text-5xl text-moonberry-brown">Page not found</h1>
      <p className="mx-auto mt-4 max-w-md text-moonberry-mauve">
        The link may be broken or the page may have moved. Try the shop or head back home.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="rounded-full bg-moonberry-brown px-8 py-3 text-sm uppercase tracking-[0.12em] text-white"
        >
          Home
        </Link>
        <Link
          to="/shop"
          className="rounded-full border border-moonberry-rose/50 px-8 py-3 text-sm uppercase tracking-[0.12em] text-moonberry-brown"
        >
          Shop
        </Link>
      </div>
    </main>
  )
}
