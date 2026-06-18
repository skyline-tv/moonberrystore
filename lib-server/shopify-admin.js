import { getServerConfig } from './env.js'

async function adminRequest(query, variables = {}) {
  const { storeDomain, adminToken, apiVersion, hasAdmin } = getServerConfig()
  if (!hasAdmin) {
    throw new Error(
      'Shopify Admin API is not configured. Add SHOPIFY_ADMIN_ACCESS_TOKEN to your server environment.',
    )
  }

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
    throw new Error(json.errors[0]?.message || 'Shopify Admin GraphQL error.')
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

  const input = {
    email: customer.email,
    phone: `+91${phone}`,
    note: `Moonberry headless checkout · ${paymentMethod.toUpperCase()}`,
    tags: ['moonberry-headless', `payment-${paymentMethod}`],
    lineItems: items.map((item) => ({
      variantId: item.merchandiseId,
      quantity: item.qty,
    })),
    shippingAddress: {
      firstName,
      lastName,
      address1: customer.addressLine1,
      address2: customer.addressLine2 || undefined,
      city: customer.city,
      province: customer.state,
      country: 'IN',
      zip: customer.pincode,
      phone: `+91${phone}`,
    },
    shippingLine: {
      title: 'Shipping (India)',
      price: totals.shipping,
    },
    customAttributes: [
      { key: 'payment_method', value: paymentMethod },
      { key: 'gst_estimate_inr', value: String(totals.gst) },
    ],
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
