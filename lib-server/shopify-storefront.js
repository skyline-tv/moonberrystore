import { getServerConfig } from './env.js'

const CART_QUERY = `
  query Cart($id: ID!) {
    cart(id: $id) {
      id
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                product {
                  title
                  handle
                }
                price {
                  amount
                }
              }
            }
          }
        }
      }
    }
  }
`

function parseAmount(value) {
  return Number.parseFloat(value || '0')
}

function mapCartLine(lineNode) {
  const merchandise = lineNode.merchandise
  return {
    lineId: lineNode.id,
    merchandiseId: merchandise.id,
    name: merchandise.product.title,
    variantTitle: merchandise.title,
    price: Math.round(parseAmount(merchandise.price.amount)),
    qty: lineNode.quantity,
  }
}

export async function fetchStorefrontCart(cartId, customerAccessToken) {
  const { storeDomain, storefrontToken, apiVersion, hasStorefront } = getServerConfig()
  if (!hasStorefront) {
    throw new Error('Shopify Storefront API is not configured on the server.')
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': storefrontToken,
  }
  if (customerAccessToken) {
    headers['Shopify-Customer-Access-Token'] = customerAccessToken
  }

  const response = await fetch(`https://${storeDomain}/api/${apiVersion}/graphql.json`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: CART_QUERY, variables: { id: cartId } }),
  })

  if (!response.ok) {
    throw new Error(`Could not load cart (${response.status}).`)
  }

  const json = await response.json()
  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message || 'Could not load cart.')
  }

  const cart = json.data?.cart
  if (!cart) return null

  const items = cart.lines.edges.map((edge) => mapCartLine(edge.node))
  return { id: cart.id, items }
}
