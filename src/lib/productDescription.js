const ALLOWED_TAGS = new Set(['p', 'br', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u', 'h2', 'h3', 'blockquote', 'a'])

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

/** Shopify description HTML is formatted for customers; keep only safe, presentation-level markup. */
export function sanitizeProductDescription(html, fallback = '') {
  const safeFallback = escapeHtml(fallback)
  if (!html || typeof document === 'undefined') return safeFallback

  const template = document.createElement('template')
  template.innerHTML = html

  for (const element of template.content.querySelectorAll('*')) {
    const tag = element.tagName.toLowerCase()
    if (tag === 'script' || tag === 'style' || tag === 'iframe' || tag === 'object') {
      element.remove()
      continue
    }
    if (!ALLOWED_TAGS.has(tag)) {
      element.replaceWith(...element.childNodes)
      continue
    }

    for (const attribute of [...element.attributes]) {
      if (tag === 'a' && attribute.name === 'href') {
        try {
          const url = new URL(attribute.value, window.location.origin)
          if (url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'mailto:') continue
        } catch {
          // Remove invalid links below.
        }
      }
      element.removeAttribute(attribute.name)
    }
  }

  return template.innerHTML || safeFallback
}
