import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { testimonials } from '../data/mockData'
import { ProductCard, SectionHeading } from '../components/ProductCard'
import { formatINR } from '../lib/currency'

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
            <article key={collection.id} className="group relative overflow-hidden rounded-3xl">
              <img
                src={collection.image}
                alt={collection.name}
                className="h-80 w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/20 to-transparent p-6 text-white">
                <p className="mt-44 text-xs uppercase tracking-[0.2em]">Collection</p>
                <h3 className="font-serif text-3xl">{collection.name}</h3>
              </div>
            </article>
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
          <article key={collection.id} className="grid gap-5 overflow-hidden rounded-3xl bg-white/80 md:grid-cols-[1.3fr_1fr]">
            <img src={collection.image} alt={collection.name} className="h-80 w-full object-cover" />
            <div className="p-8">
              <h3 className="font-serif text-4xl">{collection.name}</h3>
              <p className="mt-3 text-moonberry-mauve">{collection.description}</p>
              <button type="button" className="mt-6 rounded-full border border-moonberry-rose/50 px-6 py-2 text-sm uppercase tracking-[0.14em]">View Collection</button>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}

export function ProductPage({ onQuickAdd, products = [] }) {
  const { slug } = useParams()
  const product = useMemo(() => products.find((item) => item.slug === slug) || null, [products, slug])
  const initialProduct = product || {
    slug: '',
    images: [''],
    sizes: ['Standard'],
    compareAtPrice: 0,
    price: 0,
  }
  const [pincode, setPincode] = useState('')
  const [deliveryMessage, setDeliveryMessage] = useState('')
  const [selection, setSelection] = useState({
    slug: initialProduct.slug,
    activeImage: initialProduct.images[0],
    selectedSize: initialProduct.sizes[0],
  })

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
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const savings = hasDiscount ? product.compareAtPrice - product.price : 0

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
            <p className="text-2xl">{formatINR(product.price)}</p>
            {hasDiscount ? (
              <p className="text-sm text-moonberry-mauve line-through">{formatINR(product.compareAtPrice)}</p>
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
            onClick={() => onQuickAdd(product)}
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
          onClick={() => onQuickAdd(product)}
        >
          Add to Cart · {formatINR(product.price)}
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
          <p>Email: moonberry.bussness@gmail.com</p>
          <p className="mt-2">Phone: 90000000000</p>
          <p className="mt-2">Studio: Ulhasnagar 3, Thane, Mumbai, Maharashtra, India</p>
        </div>
        <form
          className="rounded-3xl bg-white/80 p-8"
          onSubmit={async (event) => {
            event.preventDefault()
            if (!form.name.trim() || !form.email.includes('@') || form.message.trim().length < 10) {
              setFormStatus({
                type: 'error',
                message: 'Please fill all fields correctly before submitting.',
              })
              return
            }
            setIsSubmitting(true)
            await new Promise((resolve) => setTimeout(resolve, 700))
            setFormStatus({
              type: 'success',
              message: 'Thank you. Our team will reach out within 24 hours.',
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

export function CheckoutPage({ cartItems = [], onQtyChange, onRemove }) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const shipping = subtotal === 0 || subtotal >= 999 ? 0 : 99
  const total = subtotal + shipping
  const [isProcessing, setIsProcessing] = useState(false)
  const [checkoutMessage, setCheckoutMessage] = useState('')

  return (
    <main className="section-shell py-16">
      <SectionHeading
        eyebrow="Checkout"
        title="Secure Checkout Mock"
        description="This flow is ready for Shopify checkout wiring."
      />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4 rounded-3xl bg-white/75 p-6">
          {cartItems.length === 0 ? (
            <p className="text-moonberry-mauve">Your cart is empty. Add products to continue.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-2xl border border-moonberry-rose/30 p-4">
                <img src={item.image} alt={item.name} className="h-24 w-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <h4 className="font-medium text-moonberry-brown">{item.name}</h4>
                  <p className="mt-1 text-sm text-moonberry-mauve">{formatINR(item.price)}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onQtyChange(item.id, item.qty - 1)}
                      className="h-8 w-8 rounded-full border border-moonberry-rose/40"
                    >
                      -
                    </button>
                    <span className="text-sm text-moonberry-mauve">Qty {item.qty}</span>
                    <button
                      type="button"
                      onClick={() => onQtyChange(item.id, item.qty + 1)}
                      className="h-8 w-8 rounded-full border border-moonberry-rose/40"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="ml-auto text-sm text-moonberry-mauve underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
        <aside className="rounded-3xl bg-white/80 p-6">
          <h3 className="font-serif text-3xl text-moonberry-brown">Order Summary</h3>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatINR(shipping)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-moonberry-rose/30 pt-3 text-base font-medium">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>
          <button
            type="button"
            disabled={cartItems.length === 0}
            onClick={async () => {
              setIsProcessing(true)
              setCheckoutMessage('')
              await new Promise((resolve) => setTimeout(resolve, 900))
              setCheckoutMessage('Checkout initialized. Shopify payment redirect will plug in here.')
              setIsProcessing(false)
            }}
            className="mt-6 w-full rounded-full bg-moonberry-brown px-6 py-3 text-sm uppercase tracking-[0.15em] text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isProcessing ? 'Processing...' : 'Continue to Payment (Mock)'}
          </button>
          {checkoutMessage ? (
            <p className="mt-3 text-xs text-moonberry-mauve" aria-live="polite">
              {checkoutMessage}
            </p>
          ) : (
            <p className="mt-3 text-xs text-moonberry-mauve">
              Next step: replace this action with Shopify checkout URL creation.
            </p>
          )}
        </aside>
      </div>
    </main>
  )
}
