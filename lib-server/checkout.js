import { calculateOrderTotals } from './pricing.js'
import { createRazorpayOrder, verifyRazorpayPayment } from './razorpay.js'
import { completeDraftOrder, createDraftOrder } from './shopify-admin.js'
import { fetchStorefrontCart } from './shopify-storefront.js'
import { getServerConfig } from './env.js'

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
  if (!['cod', 'upi', 'card'].includes(paymentMethod)) {
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

  const { hasRazorpay } = getServerConfig()
  if (!hasRazorpay) {
    throw new Error('Online payment is not configured yet. Use cash on delivery or add Razorpay keys.')
  }

  const razorpayOrder = await createRazorpayOrder({
    amountInr: totals.total,
    receipt: draftOrder.name,
    notes: {
      draft_order_id: draftOrder.id,
      cart_id: cartId,
      payment_method: paymentMethod,
    },
  })

  return {
    status: 'payment_required',
    paymentMethod,
    total: totals.total,
    draftOrderId: draftOrder.id,
    draftOrderName: draftOrder.name,
    razorpay: {
      keyId: razorpayOrder.keyId,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: 'MoonBerry',
      description: `Order ${draftOrder.name}`,
      prefill: {
        name: customer.fullName,
        email: customer.email,
        contact: customer.phone.replace(/\D/g, '').slice(-10),
      },
    },
  }
}

export async function handleCheckoutVerify(body) {
  const { draftOrderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body || {}

  if (!draftOrderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new Error('Payment details are incomplete.')
  }

  verifyRazorpayPayment({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  })

  const order = await completeDraftOrder(draftOrderId, { paymentPending: false })
  return {
    status: 'completed',
    orderNumber: order.name,
    shopifyOrderId: order.legacyResourceId,
  }
}
