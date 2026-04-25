const storeDomain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN
const storefrontToken = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN
const apiVersion = import.meta.env.VITE_SHOPIFY_API_VERSION || '2025-01'

export const hasShopifyConfig = Boolean(storeDomain && storefrontToken)

export async function shopifyRequest(query, variables = {}) {
  if (!hasShopifyConfig) {
    throw new Error('Shopify env vars are missing. Falling back to mock data.')
  }

  const endpoint = `https://${storeDomain}/api/${apiVersion}/graphql.json`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`Shopify request failed with ${response.status}`)
  }

  const json = await response.json()
  if (json.errors) {
    throw new Error(json.errors[0]?.message || 'Shopify GraphQL error')
  }
  return json.data
}
