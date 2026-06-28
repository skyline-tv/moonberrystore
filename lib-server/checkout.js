import { calculateOrderTotals } from './pricing.js'
import { completeDraftOrder, createDraftOrder } from './shopify-admin.js'
import { fetchStorefrontCart } from './shopify-storefront.js'

function validateCustomer(customer) {
  if (!customer?.email?.includes('@')) throw new Error('Valid email is required.')
  if (String(customer.phone || '').replace(/\D/g, '').length < 10) {
    throw new Error('Valid mobile number is required.')
  }
  if (!customer.fullName?.trim()) throw new Error('Recipient name is required.')
  if (!customer.addressLine1?.trim()) throw new Error('Delivery address is required.')
  if (!customer.city?.trim()) throw new Error('City is required.')
  if (!/^\d{6}$/.test(String(customer.pincode || '').trim())) {
    throw new Error('Valid 6-digit PIN code is required.')
  }
  if (!customer.state?.trim()) throw new Error('State is required.')
}

export async function handleCheckoutCreate(body) {
  const { cartId, customerAccessToken, customer, paymentMethod } = body || {}

  if (!cartId) throw new Error('Cart ID is required.')
  if (!['cod', 'shopify'].includes(paymentMethod)) {
    throw new Error('Unsupported payment method.')
  }

  validateCustomer(customer)

  const cart = await fetchStorefrontCart(cartId, customerAccessToken)
  if (!cart?.items?.length) {
    throw new Error('Your bag is empty or expired. Add items again.')
  }

  const totals = calculateOrderTotals(cart.items)
  const draftOrder = await createDraftOrder({
    items: cart.items,
    totals,
    customer,
    paymentMethod,
  })

  if (paymentMethod === 'cod') {
    const order = await completeDraftOrder(draftOrder.id, { paymentPending: true })
    return {
      status: 'completed',
      orderNumber: order.name,
      shopifyOrderId: order.legacyResourceId,
      paymentMethod: 'cod',
      total: totals.total,
    }
  }

  if (!draftOrder.invoiceUrl) {
    throw new Error(
      'Shopify payment link is not available. Enable Shopify Payments in Admin → Settings → Payments.',
    )
  }

  return {
    status: 'shopify_payment',
    paymentMethod: 'shopify',
    total: totals.total,
    draftOrderName: draftOrder.name,
    invoiceUrl: draftOrder.invoiceUrl,
  }
}
