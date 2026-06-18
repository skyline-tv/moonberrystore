const FREE_SHIPPING_THRESHOLD = 999
const SHIPPING_FEE = 99
const GST_RATE = 0.18

export function calculateOrderTotals(lineItems) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const gst = Math.round(subtotal * GST_RATE)
  const total = subtotal + shipping + gst

  return { subtotal, shipping, gst, total }
}
