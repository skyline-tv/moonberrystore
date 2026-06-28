import { getServerConfig } from './env.js'
import { clearAdminTokenCache, resolveAdminAccessToken } from './shopify-admin-auth.js'

async function adminRequest(query, variables = {}, { retried = false } = {}) {
  const { storeDomain, apiVersion, hasAdmin } = getServerConfig()
  if (!hasAdmin) {
    throw new Error(
      'Shopify Admin API is not configured. Add SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET (Dev Dashboard) or SHOPIFY_ADMIN_ACCESS_TOKEN.',
    )
  }

  const adminToken = await resolveAdminAccessToken()

  const response = await fetch(`https://${storeDomain}/admin/api/${apiVersion}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminToken,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`Shopify Admin request failed (${response.status}).`)
  }

  const json = await response.json()
  if (json.errors?.length) {
    const message = json.errors[0]?.message || 'Shopify Admin GraphQL error.'
    const needsDraftScope = /write_draft_orders|write_quick_sale/i.test(message)
    if (!retried && needsDraftScope) {
      clearAdminTokenCache()
      return adminRequest(query, variables, { retried: true })
    }
    if (needsDraftScope) {
      throw new Error(
        `${message} Release a new app version with write_draft_orders, then in Shopify Admin open Settings → Apps → Moonberry Checkout and approve the updated permissions.`,
      )
    }
    throw new Error(message)
  }
  return json.data
}

const DRAFT_ORDER_CREATE = `
  mutation DraftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        name
        invoiceUrl
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

const DRAFT_ORDER_COMPLETE = `
  mutation DraftOrderComplete($id: ID!, $paymentPending: Boolean) {
    draftOrderComplete(id: $id, paymentPending: $paymentPending) {
      draftOrder {
        order {
          id
          name
          legacyResourceId
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0], lastName: '.' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

function assertNoUserErrors(payload, field) {
  if (payload?.userErrors?.length) {
    throw new Error(payload.userErrors[0]?.message || `${field} failed.`)
  }
}

export async function createDraftOrder({ items, totals, customer, paymentMethod }) {
  const { firstName, lastName } = splitName(customer.fullName)
  const phone = customer.phone.replace(/\D/g, '').slice(-10)

  const lineItems = [
    ...items.map((item) => ({
      variantId: item.merchandiseId,
      quantity: item.qty,
    })),
    ...(totals.gst > 0
      ? [
          {
            title: 'GST (18%)',
            quantity: 1,
            originalUnitPrice: totals.gst,
          },
        ]
      : []),
  ]

  const input = {
    email: customer.email,
    phone: `+91${phone}`,
    presentmentCurrencyCode: 'INR',
    note: `Moonberry headless checkout · ${paymentMethod.toUpperCase()}`,
    tags: ['moonberry-headless', `payment-${paymentMethod}`],
    lineItems,
    shippingAddress: {
      firstName,
      lastName,
      address1: customer.addressLine1,
      address2: customer.addressLine2 || undefined,
      city: customer.city,
      province: customer.state,
      countryCode: 'IN',
      zip: customer.pincode,
      phone: `+91${phone}`,
    },
    customAttributes: [
      { key: 'payment_method', value: paymentMethod },
      { key: 'gst_inr', value: String(totals.gst) },
    ],
  }

  if (totals.shipping > 0) {
    input.shippingLine = {
      title: 'Shipping (India)',
      priceWithCurrency: {
        amount: totals.shipping,
        currencyCode: 'INR',
      },
    }
  }

  const data = await adminRequest(DRAFT_ORDER_CREATE, { input })
  assertNoUserErrors(data.draftOrderCreate, 'draftOrderCreate')
  return data.draftOrderCreate.draftOrder
}

export async function completeDraftOrder(draftOrderId, { paymentPending }) {
  const data = await adminRequest(DRAFT_ORDER_COMPLETE, {
    id: draftOrderId,
    paymentPending,
  })
  assertNoUserErrors(data.draftOrderComplete, 'draftOrderComplete')
  const order = data.draftOrderComplete.draftOrder?.order
  if (!order) {
    throw new Error('Shopify did not return an order after completion.')
  }
  return order
}
