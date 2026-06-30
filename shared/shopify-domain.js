export function normalizeShopifyStoreDomain(raw) {
  if (!raw) return ''
  let domain = String(raw).trim()
  domain = domain.replace(/^https?:\/\//i, '')
  domain = domain.split('/')[0] || ''
  return domain.replace(/\.$/, '').toLowerCase()
}
