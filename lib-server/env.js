function normalizeShopifyStoreDomain(raw) {
  if (!raw) return ''
  let d = String(raw).trim()
  d = d.replace(/^https?:\/\//i, '')
  d = d.split('/')[0] || ''
  return d.replace(/\.$/, '').toLowerCase()
}

export function getServerConfig() {
  const storeDomain = normalizeShopifyStoreDomain(
    process.env.SHOPIFY_STORE_DOMAIN || process.env.VITE_SHOPIFY_STORE_DOMAIN,
  )
  const storefrontToken =
    process.env.SHOPIFY_STOREFRONT_TOKEN || process.env.VITE_SHOPIFY_STOREFRONT_TOKEN
  const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
  const apiVersion = process.env.SHOPIFY_API_VERSION || process.env.VITE_SHOPIFY_API_VERSION || '2025-01'
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

  return {
    storeDomain,
    storefrontToken: storefrontToken?.trim(),
    adminToken: adminToken?.trim(),
    apiVersion,
    razorpayKeyId: razorpayKeyId?.trim(),
    razorpayKeySecret: razorpayKeySecret?.trim(),
    hasAdmin: Boolean(storeDomain && adminToken),
    hasStorefront: Boolean(storeDomain && storefrontToken),
    hasRazorpay: Boolean(razorpayKeyId && razorpayKeySecret),
  }
}
