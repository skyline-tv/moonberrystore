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

const PRODUCTS_AND_COLLECTIONS_QUERY = `
  query ProductsAndCollections($productsFirst: Int!, $collectionsFirst: Int!) {
    products(first: $productsFirst, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          title
          handle
          description
          productType
          tags
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
            }
          }
          variants(first: 20) {
            edges {
              node {
                id
                title
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          images(first: 6) {
            edges {
              node {
                url
              }
            }
          }
        }
      }
    }
    collections(first: $collectionsFirst, sortKey: UPDATED_AT, reverse: true) {
      edges {
        node {
          id
          handle
          title
          description
          image {
            url
          }
        }
      }
    }
  }
`

const CART_FIELDS = `
  id
  checkoutUrl
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
              id
              title
              handle
              featuredImage {
                url
              }
            }
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
  cost {
    subtotalAmount {
      amount
      currencyCode
    }
    totalAmount {
      amount
      currencyCode
    }
  }
`

const CART_CREATE_MUTATION = `
  mutation CartCreate {
    cartCreate {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        message
      }
    }
  }
`

const CART_QUERY = `
  query Cart($id: ID!) {
    cart(id: $id) {
      ${CART_FIELDS}
    }
  }
`

const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        message
      }
    }
  }
`

const CART_LINES_UPDATE_MUTATION = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        message
      }
    }
  }
`

const CART_LINES_REMOVE_MUTATION = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        message
      }
    }
  }
`

function parseAmount(value) {
  return Number.parseFloat(value || '0')
}

function mapProduct(node) {
  const variants = node.variants.edges.map((edge) => edge.node)
  const firstVariant = variants[0]
  const minPrice = parseAmount(node.priceRange.minVariantPrice.amount)
  const compareAt = parseAmount(node.compareAtPriceRange.minVariantPrice?.amount)
  const optionValues = variants
    .map((variant) => {
      const sizeOption = variant.selectedOptions.find((option) =>
        ['size', 'volume', 'option'].includes(option.name.toLowerCase()),
      )
      return sizeOption?.value || variant.title
    })
    .filter((value, index, arr) => value && arr.indexOf(value) === index && value !== 'Default Title')

  return {
    id: node.id,
    slug: node.handle,
    name: node.title,
    description: node.description || 'Premium formulation with skin-friendly ingredients.',
    category: node.productType || 'Beauty',
    collection: node.tags[0] || 'Moonberry Edit',
    price: Math.round(minPrice),
    compareAtPrice: compareAt > minPrice ? Math.round(compareAt) : undefined,
    sizes: optionValues.length ? optionValues : ['Standard'],
    notes: node.tags.slice(0, 4),
    images: node.images.edges.map((edge) => edge.node.url),
    shadeHex: ['#b08d92', '#f5f1ee'],
    bestSeller: node.tags.some((tag) => tag.toLowerCase().includes('best')),
    variantId: firstVariant?.id,
  }
}

function mapCollection(node) {
  return {
    id: node.id,
    name: node.title,
    description: node.description || 'Curated selection from the Moonberry catalog.',
    image:
      node.image?.url ||
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1400&q=80',
  }
}

function mapCartLine(lineNode) {
  const merchandise = lineNode.merchandise
  const amount = parseAmount(merchandise.price.amount)
  return {
    lineId: lineNode.id,
    merchandiseId: merchandise.id,
    id: merchandise.product.id,
    slug: merchandise.product.handle,
    name: merchandise.product.title,
    price: Math.round(amount),
    image: merchandise.product.featuredImage?.url || '',
    qty: lineNode.quantity,
    variantTitle: merchandise.title,
  }
}

function mapCart(cart) {
  if (!cart) return null
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    items: cart.lines.edges.map((edge) => mapCartLine(edge.node)),
    subtotal: Math.round(parseAmount(cart.cost.subtotalAmount.amount)),
    total: Math.round(parseAmount(cart.cost.totalAmount.amount)),
  }
}

function assertNoUserErrors(result, operationName) {
  if (result.userErrors?.length) {
    throw new Error(result.userErrors[0].message || `${operationName} failed`)
  }
}

export async function getStorefrontCatalog() {
  const data = await shopifyRequest(PRODUCTS_AND_COLLECTIONS_QUERY, {
    productsFirst: 40,
    collectionsFirst: 20,
  })

  return {
    products: data.products.edges.map((edge) => mapProduct(edge.node)),
    collections: data.collections.edges.map((edge) => mapCollection(edge.node)),
  }
}

export async function createCart() {
  const data = await shopifyRequest(CART_CREATE_MUTATION)
  assertNoUserErrors(data.cartCreate, 'cartCreate')
  return mapCart(data.cartCreate.cart)
}

export async function fetchCart(cartId) {
  const data = await shopifyRequest(CART_QUERY, { id: cartId })
  return mapCart(data.cart)
}

export async function addCartLine(cartId, merchandiseId, quantity = 1) {
  const data = await shopifyRequest(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [{ merchandiseId, quantity }],
  })
  assertNoUserErrors(data.cartLinesAdd, 'cartLinesAdd')
  return mapCart(data.cartLinesAdd.cart)
}

export async function updateCartLine(cartId, lineId, quantity) {
  const data = await shopifyRequest(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }],
  })
  assertNoUserErrors(data.cartLinesUpdate, 'cartLinesUpdate')
  return mapCart(data.cartLinesUpdate.cart)
}

export async function removeCartLine(cartId, lineId) {
  const data = await shopifyRequest(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds: [lineId],
  })
  assertNoUserErrors(data.cartLinesRemove, 'cartLinesRemove')
  return mapCart(data.cartLinesRemove.cart)
}
