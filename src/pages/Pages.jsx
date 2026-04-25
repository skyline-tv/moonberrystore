import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { collections, products, testimonials } from '../data/mockData'
import { ProductCard, SectionHeading } from '../components/ProductCard'

export function HomePage({ onQuickAdd }) {
  const bestSellers = products.filter((item) => item.bestSeller)

  return (
    <div>
      <section className="section-shell grid min-h-[78vh] items-center gap-10 py-14 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#f7f1ee] via-[#eedfe2] to-[#cfaeb4] p-8 md:p-12">
          <div className="pointer-events-none absolute -left-8 -top-16 h-52 w-52 rounded-full bg-white/40 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-moonberry-mauve/30 blur-3xl" />
          <p className="mb-4 text-xs uppercase tracking-[0.28em] text-moonberry-mauve">Moonberry Beauty House</p>
          <h1 className="editorial-heading">Perfume, Beauty, Nails - In Soft Luxury.</h1>
          <p className="mt-6 max-w-lg text-moonberry-mauve">
            Discover premium fragrances, skincare, cosmetics, and nail essentials crafted for modern feminine elegance.
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
            <h2 className="mt-2 font-serif text-5xl leading-none">Soft power, crafted beautifully.</h2>
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
            <input className="h-12 flex-1 rounded-full border border-white/30 bg-white/10 px-5 text-white placeholder:text-white/70 outline-none" placeholder="Enter your email" />
            <button type="button" className="h-12 rounded-full bg-white px-6 text-sm tracking-[0.15em] uppercase text-moonberry-brown">Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  )
}

export function ShopPage({ onQuickAdd }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const categories = ['All', ...new Set(products.map((product) => product.category))]
  const visibleProducts =
    activeCategory === 'All'
      ? products
      : products.filter((product) => product.category === activeCategory)

  return (
    <main className="section-shell py-16">
      <SectionHeading eyebrow="Shop" title="All Products" description="Luxury perfumes, skincare, cosmetics, and nail care." />
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
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} onQuickAdd={onQuickAdd} />
        ))}
      </div>
    </main>
  )
}

export function CollectionsPage() {
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

export function ProductPage({ onQuickAdd }) {
  const { slug } = useParams()
  const product = useMemo(() => products.find((item) => item.slug === slug) || products[0], [slug])
  const [selection, setSelection] = useState({
    slug: product.slug,
    activeImage: product.images[0],
    selectedSize: product.sizes[0],
  })

  const activeImage =
    selection.slug === product.slug ? selection.activeImage : product.images[0]
  const selectedSize =
    selection.slug === product.slug ? selection.selectedSize : product.sizes[0]

  return (
    <main className="section-shell py-16">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <img src={activeImage} alt={product.name} className="h-[620px] w-full rounded-3xl object-cover" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            {product.images.map((image) => (
              <button
                key={image}
                type="button"
                className="overflow-hidden rounded-2xl"
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
          <p className="mt-4 text-2xl">${product.price}.00</p>
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
              <p className="mt-2 text-sm text-moonberry-mauve">Free shipping over $150. Easy 14-day returns.</p>
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
    </main>
  )
}

export function AboutPage() {
  return (
    <main className="section-shell py-16">
      <SectionHeading eyebrow="About Moonberry" title="Modern femininity with timeless intent." />
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
  return (
    <main className="section-shell py-16">
      <SectionHeading eyebrow="Contact" title="We'd love to hear from you." />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-white/80 p-8">
          <p className="mb-5 text-moonberry-mauve">For beauty consultations, wholesale, and customer support inquiries.</p>
          <p>Email: hello@moonberry.com</p>
          <p className="mt-2">Phone: +1 212 000 0000</p>
          <p className="mt-2">Studio: New York, NY</p>
        </div>
        <form className="rounded-3xl bg-white/80 p-8">
          <div className="space-y-3">
            <input placeholder="Full Name" className="h-12 w-full rounded-2xl border border-moonberry-rose/40 bg-white px-4 outline-none" />
            <input placeholder="Email Address" className="h-12 w-full rounded-2xl border border-moonberry-rose/40 bg-white px-4 outline-none" />
            <textarea placeholder="Message" rows={5} className="w-full rounded-2xl border border-moonberry-rose/40 bg-white p-4 outline-none" />
          </div>
          <button type="submit" className="mt-4 rounded-full bg-moonberry-brown px-7 py-3 text-sm uppercase tracking-[0.15em] text-white">Send Message</button>
        </form>
      </div>
    </main>
  )
}
