export const FREE_SHIPPING_THRESHOLD = 999
export const SHIPPING_FEE = 99

export function calculateOrderTotals(lineItems) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const total = subtotal + shipping

  return { subtotal, shipping, total }
}
