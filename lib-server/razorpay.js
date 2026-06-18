import crypto from 'node:crypto'
import { getServerConfig } from './env.js'

export async function createRazorpayOrder({ amountInr, receipt, notes }) {
  const { razorpayKeyId, razorpayKeySecret, hasRazorpay } = getServerConfig()
  if (!hasRazorpay) {
    throw new Error('Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.')
  }

  const amountPaise = Math.round(amountInr * 100)
  if (amountPaise < 100) {
    throw new Error('Order total is too low for online payment.')
  }

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64')}`,
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: 'INR',
      receipt,
      notes,
    }),
  })

  const json = await response.json()
  if (!response.ok) {
    throw new Error(json?.error?.description || 'Could not create Razorpay order.')
  }

  return {
    id: json.id,
    amount: json.amount,
    currency: json.currency,
    keyId: razorpayKeyId,
  }
}

export function verifyRazorpayPayment({ orderId, paymentId, signature }) {
  const { razorpayKeySecret, hasRazorpay } = getServerConfig()
  if (!hasRazorpay) {
    throw new Error('Razorpay is not configured.')
  }

  const expected = crypto
    .createHmac('sha256', razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

  if (expected !== signature) {
    throw new Error('Payment verification failed.')
  }

  return true
}
