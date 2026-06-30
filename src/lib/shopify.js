import { resolveCategory } from './categories.js'
import { normalizeShopifyStoreDomain } from '../../shared/shopify-domain.js'

const storeDomain = normalizeShopifyStoreDomain(import.meta.env.VITE_SHOPIFY_STORE_DOMAIN)
const storefrontToken = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN?.trim()
const apiVersion = import.meta.env.VITE_SHOPIFY_API_VERSION || '2025-01'

export const hasShopifyConfig = Boolean(storeDomain && storefrontToken)

/** Same-origin proxy: dev middleware + Vercel API (avoids browser blocks on myshopify.com). */
const useStorefrontProxy =
  import.meta.env.VITE_SHOPIFY_USE_PROXY !== 'false' &&
  import.meta.env.VITE_SHOPIFY_DEV_PROXY !== 'false'

function storefrontGraphqlEndpoint() {
  if (useStorefrontProxy) return '/shopify-storefront'
  return `https://${storeDomain}/api/${apiVersion}/graphql.json`
}

async function readProxyError(response) {
  try {
    const json = await response.json()
    return json.errors?.[0]?.message || json.error || null
  } catch {
    return null
  }
}

export async function shopifyRequest(query, variables = {}, options = {}) {
  if (!hasShopifyConfig) {
    throw new Error('Shopify is not configured.')
  }

  const endpoint = storefrontGraphqlEndpoint()
  const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': storefrontToken,
  }
  if (options.customerAccessToken) {
    headers['Shopify-Customer-Access-Token'] = options.customerAccessToken
  }

  let response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers,
      body: JSON.stringify({ query, variables }),
    })
  } catch (err) {
    const isNetwork = err instanceof TypeError || String(err?.message).includes('fetch')
    if (isNetwork) {
      const hint = useStorefrontProxy
        ? 'Could not reach the storefront proxy. Local: restart `npm run dev`. Hosted: set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN on Vercel, then redeploy.'
        : `Could not reach https://${storeDomain}. Keep the default proxy enabled (do not set VITE_SHOPIFY_USE_PROXY=false).`
      throw new Error(`Failed to fetch: ${hint}`, { cause: err })
    }
    throw err
  }

  if (!response.ok) {
    const detail = await readProxyError(response)
    throw new Error(detail || `Shopify request failed (${response.status}).`)
  }

  const json = await response.json()
  if (json.errors) {
    throw new Error(json.errors[0]?.message || 'Shopify GraphQL error')
  }
  return json.data
}

const PRODUCTS_QUERY = `
  query Products($productsFirst: Int!) {
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
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                }
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

function optionLabelForVariant(variant) {
  const sizeOption = variant.selectedOptions.find((option) =>
    ['size', 'volume', 'option'].includes(option.name.toLowerCase()),
  )
  if (sizeOption?.value) return sizeOption.value
  if (variant.title && variant.title !== 'Default Title') return variant.title
  return 'Standard'
}

function mapProduct(node) {
  const variants = node.variants.edges.map((edge) => edge.node)
  const firstVariant = variants[0]
  const minPrice = parseAmount(node.priceRange.minVariantPrice.amount)
  const compareAt = parseAmount(node.compareAtPriceRange.minVariantPrice?.amount)

  const variantChoices = variants.map((variant) => {
    const optionLabel = optionLabelForVariant(variant)
    const vp = parseAmount(variant.price?.amount)
    const vCompare = parseAmount(variant.compareAtPrice?.amount)
    return {
      optionLabel,
      variantId: variant.id,
      price: Math.round(vp),
      compareAtPrice: vCompare > vp ? Math.round(vCompare) : undefined,
    }
  })

  const uniqueLabels = []
  const seen = new Set()
  for (const row of variantChoices) {
    if (!seen.has(row.optionLabel)) {
      seen.add(row.optionLabel)
      uniqueLabels.push(row.optionLabel)
    }
  }
  const displayLabels = uniqueLabels.length ? uniqueLabels : ['Standard']

  const primary = variantChoices[0]
  const displayPrice = primary ? primary.price : Math.round(minPrice)
  const displayCompare = primary?.compareAtPrice
  const productLevelCompare = compareAt > minPrice ? Math.round(compareAt) : undefined
  const compareAtPrice = displayCompare ?? (productLevelCompare > displayPrice ? productLevelCompare : undefined)

  const { categoryId, category } = resolveCategory(node.productType, node.tags, node.title)

  return {
    id: node.id,
    slug: node.handle,
    name: node.title,
    description: node.description || 'Thoughtfully selected for your everyday beauty ritual.',
    categoryId,
    category,
    collection: category,
    price: displayPrice,
    compareAtPrice,
    sizes: displayLabels,
    variantChoices,
    notes: node.tags.slice(0, 4),
    images: node.images.edges.map((edge) => edge.node.url),
    shadeHex: ['#b08d92', '#f5f1ee'],
    bestSeller: node.tags.some((tag) => tag.toLowerCase().includes('best')),
    variantId: firstVariant?.id,
  }
}

/** Resolve Storefront variant + prices for a selected option label (e.g. size). */
export function pickVariantForOption(product, optionLabel) {
  if (!product?.variantChoices?.length) {
    return {
      variantId: product?.variantId,
      price: product?.price,
      compareAtPrice: product?.compareAtPrice,
    }
  }
  const label = optionLabel || product.sizes?.[0] || 'Standard'
  const match =
    product.variantChoices.find((row) => row.optionLabel === label) || product.variantChoices[0]
  return {
    variantId: match.variantId,
    price: match.price,
    compareAtPrice: match.compareAtPrice,
  }
}

export async function getStorefrontCatalog() {
  const data = await shopifyRequest(PRODUCTS_QUERY, {
    productsFirst: 40,
  })

  return {
    products: data.products.edges.map((edge) => mapProduct(edge.node)),
  }
}

function mapCartLine(lineNode) {
  const merchandise = lineNode.merchandise
  const amount = parseAmount(merchandise.price.amount)
  const productId = merchandise.product.id
  return {
    lineId: lineNode.id,
    merchandiseId: merchandise.id,
    productId,
    id: lineNode.id,
    slug: merchandise.product.handle,
    name: merchandise.product.title,
    price: Math.round(amount),
    image: merchandise.product.featuredImage?.url || '',
    qty: lineNode.quantity,
    variantTitle: merchandise.title,
  }
}

/** Shopify headless carts must tag checkout so buyers land on Checkout, not the Online Store theme. */
const HEADLESS_CHECKOUT_CHANNEL = 'headless-storefronts'

export function normalizeHeadlessCheckoutUrl(checkoutUrl) {
  if (!checkoutUrl) return ''
  try {
    const url = new URL(checkoutUrl)
    if (!url.searchParams.has('channel')) {
      url.searchParams.set('channel', HEADLESS_CHECKOUT_CHANNEL)
    }
    return url.toString()
  } catch {
    return checkoutUrl
  }
}

function mapCart(cart) {
  if (!cart) return null
  return {
    id: cart.id,
    checkoutUrl: normalizeHeadlessCheckoutUrl(cart.checkoutUrl),
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

export async function createCart(customerAccessToken) {
  const data = await shopifyRequest(CART_CREATE_MUTATION, {}, { customerAccessToken })
  assertNoUserErrors(data.cartCreate, 'cartCreate')
  return mapCart(data.cartCreate.cart)
}

export async function fetchCart(cartId, customerAccessToken) {
  const data = await shopifyRequest(CART_QUERY, { id: cartId }, { customerAccessToken })
  return mapCart(data.cart)
}

export async function addCartLine(cartId, merchandiseId, quantity = 1, customerAccessToken) {
  const data = await shopifyRequest(
    CART_LINES_ADD_MUTATION,
    {
      cartId,
      lines: [{ merchandiseId, quantity }],
    },
    { customerAccessToken },
  )
  assertNoUserErrors(data.cartLinesAdd, 'cartLinesAdd')
  return mapCart(data.cartLinesAdd.cart)
}

export async function updateCartLine(cartId, lineId, quantity, customerAccessToken) {
  const data = await shopifyRequest(
    CART_LINES_UPDATE_MUTATION,
    {
      cartId,
      lines: [{ id: lineId, quantity }],
    },
    { customerAccessToken },
  )
  assertNoUserErrors(data.cartLinesUpdate, 'cartLinesUpdate')
  return mapCart(data.cartLinesUpdate.cart)
}

export async function removeCartLine(cartId, lineId, customerAccessToken) {
  const data = await shopifyRequest(
    CART_LINES_REMOVE_MUTATION,
    {
      cartId,
      lineIds: [lineId],
    },
    { customerAccessToken },
  )
  assertNoUserErrors(data.cartLinesRemove, 'cartLinesRemove')
  return mapCart(data.cartLinesRemove.cart)
}

const CART_BUYER_IDENTITY_MUTATION = `
  mutation CartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        field
        message
      }
    }
  }
`

export async function updateCartBuyerIdentity(cartId, customerAccessToken) {
  const data = await shopifyRequest(CART_BUYER_IDENTITY_MUTATION, {
    cartId,
    buyerIdentity: { customerAccessToken },
  })
  assertNoUserErrors(data.cartBuyerIdentityUpdate, 'cartBuyerIdentityUpdate')
  return mapCart(data.cartBuyerIdentityUpdate.cart)
}

const CUSTOMER_QUERY = `
  query Customer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      email
      firstName
      lastName
      displayName
    }
  }
`

const CUSTOMER_CREATE_MUTATION = `
  mutation CustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
      }
      customerUserErrors {
        code
        field
        message
      }
      userErrors {
        field
        message
      }
    }
  }
`

const CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION = `
  mutation CustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
      userErrors {
        field
        message
      }
    }
  }
`

const CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION = `
  mutation CustomerAccessTokenDelete($customerAccessToken: String!) {
    customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
      deletedAccessToken
      deletedCustomerAccessTokenId
      userErrors {
        field
        message
      }
    }
  }
`

function assertNoCustomerUserErrors(result, operationName) {
  if (!result) {
    throw new Error(`${operationName} returned no data.`)
  }
  const fromCustomer = result.customerUserErrors ?? []
  const fromUser = result.userErrors ?? []
  const errors = [...fromCustomer, ...fromUser].filter(Boolean)
  if (errors.length) {
    throw new Error(errors[0].message || `${operationName} failed`)
  }
}

const LEGACY_ACCOUNTS_HINT =
  'This store must use legacy customer accounts with email and password (Shopify admin: Settings → Customer accounts). New Customer Accounts are not supported by this login form yet.'

export async function createCustomerAccount({ email, password, firstName, lastName }) {
  const data = await shopifyRequest(CUSTOMER_CREATE_MUTATION, {
    input: {
      email,
      password,
      firstName: firstName || '',
      lastName: lastName || '',
      acceptsMarketing: false,
    },
  })
  const payload = data.customerCreate
  assertNoCustomerUserErrors(payload, 'customerCreate')
  if (!payload?.customer) {
    throw new Error(
      `Account was not created. ${LEGACY_ACCOUNTS_HINT} Also ensure your Headless storefront token includes the "unauthenticated_write_customers" scope.`,
    )
  }
  return payload.customer
}

export async function createCustomerAccessToken(email, password) {
  const data = await shopifyRequest(CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION, {
    input: { email, password },
  })
  const payload = data.customerAccessTokenCreate
  assertNoCustomerUserErrors(payload, 'customerAccessTokenCreate')
  const token = payload?.customerAccessToken?.accessToken
  if (!token) {
    throw new Error(
      `Sign in failed. ${LEGACY_ACCOUNTS_HINT} Ensure the storefront token includes "unauthenticated_write_customers".`,
    )
  }
  return token
}

export async function deleteCustomerAccessToken(customerAccessToken) {
  const data = await shopifyRequest(CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION, {
    customerAccessToken,
  })
  if (data.customerAccessTokenDelete.userErrors?.length) {
    throw new Error(data.customerAccessTokenDelete.userErrors[0].message || 'Logout failed')
  }
}

export async function fetchCustomer(customerAccessToken) {
  const data = await shopifyRequest(
    CUSTOMER_QUERY,
    { customerAccessToken },
    { customerAccessToken },
  )
  if (!data.customer) return null
  return {
    id: data.customer.id,
    email: data.customer.email,
    firstName: data.customer.firstName,
    lastName: data.customer.lastName,
    displayName: data.customer.displayName,
  }
}

const CUSTOMER_ACCOUNT_QUERY = `
  query CustomerAccount($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      defaultAddress {
        id
        name
        formattedArea
        address1
        city
        zip
        country
      }
      addresses(first: 15) {
        edges {
          node {
            id
            name
            formattedArea
            address1
            city
            zip
            country
          }
        }
      }
      orders(first: 15, reverse: true) {
        edges {
          node {
            id
            name
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            currentTotalPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`

const CUSTOMER_RECOVER_MUTATION = `
  mutation CustomerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        message
      }
      userErrors {
        message
      }
    }
  }
`

function mapMailingAddress(node) {
  if (!node) return null
  const lines = [node.formattedArea, node.address1, node.city, node.zip, node.country].filter(Boolean)
  return {
    id: node.id,
    label: node.name || lines.join(', ') || 'Address',
    summary: node.formattedArea || lines.filter((l) => l !== node.formattedArea).join(', '),
  }
}

function mapOrderNode(node) {
  const amount = parseAmount(node.currentTotalPrice?.amount)
  return {
    id: node.id,
    name: node.name,
    orderNumber: node.orderNumber,
    processedAt: node.processedAt,
    financialStatus: node.financialStatus,
    fulfillmentStatus: node.fulfillmentStatus,
    total: Math.round(amount),
    currencyCode: node.currentTotalPrice?.currencyCode || 'INR',
  }
}

export async function fetchCustomerAccountDetails(customerAccessToken) {
  const data = await shopifyRequest(
    CUSTOMER_ACCOUNT_QUERY,
    { customerAccessToken },
    { customerAccessToken },
  )
  if (!data.customer) return null
  const c = data.customer
  const addresses = (c.addresses?.edges || []).map((e) => mapMailingAddress(e.node)).filter(Boolean)
  const orders = (c.orders?.edges || []).map((e) => mapOrderNode(e.node))
  return {
    defaultAddress: mapMailingAddress(c.defaultAddress),
    addresses,
    orders,
  }
}

export async function requestCustomerPasswordReset(email) {
  const data = await shopifyRequest(CUSTOMER_RECOVER_MUTATION, { email })
  const payload = data.customerRecover
  assertNoCustomerUserErrors(payload, 'customerRecover')
  return true
}

/**
 * If checkout URL uses the same host as this SPA, the browser loads your React app on /checkouts/…
 * (blank page). Fix in Shopify: Settings → Domains — checkout must not share the headless app hostname.
 */
export function describeCheckoutHostnameMismatch(checkoutUrl, siteHostname) {
  if (!checkoutUrl || !siteHostname) return ''
  try {
    const u = new URL(checkoutUrl)
    if (u.hostname === siteHostname) {
      return 'Checkout is opening on this same website address, so you see a blank page instead of Shopify Checkout. In Shopify Admin, open Settings → Domains: your store’s checkout domain must point to Shopify (typically your-store.myshopify.com or checkout.shopify.com), not to this headless storefront. Until that is fixed, use a development domain for this app, or ask Shopify Support to separate “Online Store” and checkout from your custom domain.'
    }
  } catch {
    return 'The checkout link from Shopify is not a valid URL. Refresh the cart and try again.'
  }
  return ''
}
