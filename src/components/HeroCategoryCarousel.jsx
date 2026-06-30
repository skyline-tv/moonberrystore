import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandMark } from './BrandMark'
import { getCategoryHeroSlides } from '../lib/sitePhotos'

const ROTATE_MS = 5000
const frameClass =
  'soft-shadow relative w-full overflow-hidden rounded-4xl aspect-[4/5] max-h-[min(460px,58vh)]'

export function HeroCategoryCarousel({ products = [] }) {
  const slides = useMemo(
    () => getCategoryHeroSlides(products).filter((slide) => slide.src),
    [products],
  )
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    setActive(0)
  }, [slides.length])

  useEffect(() => {
    if (slides.length <= 1 || paused) return undefined

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return undefined

    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % slides.length)
    }, ROTATE_MS)

    return () => window.clearInterval(timer)
  }, [slides.length, paused])

  if (!slides.length) {
    return (
      <div className={`${frameClass} flex items-center justify-center bg-white/40`}>
        <BrandMark size="xl" />
      </div>
    )
  }

  if (slides.length === 1) {
    const slide = slides[0]
    return (
      <Link to={slide.shopUrl} className={`${frameClass} block`}>
        <img
          src={slide.src}
          alt={slide.label}
          className="h-full w-full object-cover"
          style={{ objectPosition: slide.objectPosition }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-moonberry-brown/25 via-transparent to-transparent" />
      </Link>
    )
  }

  return (
    <div
      className={frameClass}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Shop by category"
    >
      {slides.map((slide, index) => {
        const isActive = index === active
        return (
          <Link
            key={slide.id}
            to={slide.shopUrl}
            aria-hidden={!isActive}
            tabIndex={isActive ? 0 : -1}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'
            }`}
          >
            <img
              src={slide.src}
              alt={slide.label}
              className={`h-full w-full object-cover transition-transform duration-[6000ms] ease-out ${
                isActive ? 'scale-100' : 'scale-105'
              }`}
              style={{ objectPosition: slide.objectPosition }}
            />
          </Link>
        )
      })}

      <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-moonberry-brown/25 via-transparent to-transparent" />

      <div
        className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 gap-2"
        role="tablist"
        aria-label="Category photos"
      >
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-label={slide.label}
            onClick={() => setActive(index)}
            className={`rounded-full transition-all duration-300 ${
              index === active
                ? 'h-1.5 w-7 bg-white/95'
                : 'h-1.5 w-1.5 bg-white/45 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
