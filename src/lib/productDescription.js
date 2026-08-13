const ALLOWED_TAGS = new Set(['p', 'br', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u', 'h2', 'h3', 'blockquote', 'a'])

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function compactText(value) {
  return String(value)
    .replaceAll('\r\n', '\n')
    .replaceAll('\r', '\n')
    .replace(/\n[\t ]*\n+/g, '\n')
    .trim()
}

/** Shopify description HTML is formatted for customers; keep only safe, presentation-level markup. */
export function sanitizeProductDescription(html, fallback = '') {
  // The plain-text fallback can contain the blank lines entered in Shopify's
  // editor. Keep each line, but never render a stack of empty rows.
  const safeFallback = escapeHtml(compactText(fallback)).replaceAll('\n', '<br>')
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

  // Shopify's rich-text editor can leave empty paragraph and break elements
  // between fields. They take up a full line in the storefront even though
  // they contain no visible copy, creating the large gaps seen on products.
  for (const paragraph of template.content.querySelectorAll('p')) {
    // A pair of line breaks inside a paragraph is another way Shopify creates
    // an empty visual row. One break keeps a label and its value on separate
    // lines without leaving the oversized gap.
    paragraph.innerHTML = paragraph.innerHTML.replace(/(?:<br>\s*){2,}/gi, '<br>')
    const copy = paragraph.textContent.replaceAll('\u00a0', ' ').trim()
    if (!copy && !paragraph.querySelector('img, video')) paragraph.remove()
  }

  // Paragraphs already create their own vertical rhythm. Top-level <br>s are
  // only empty Shopify rows, so remove them altogether.
  for (const lineBreak of template.content.querySelectorAll('br')) {
    if (lineBreak.parentNode === template.content) lineBreak.remove()
  }

  return template.innerHTML || safeFallback
}
