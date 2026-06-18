async function postJson(path, body) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const json = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(json.error || `Checkout request failed (${response.status}).`)
  }
  return json
}

export async function createCheckoutOrder(payload) {
  return postJson('/api/checkout/create', payload)
}

export async function verifyCheckoutPayment(payload) {
  return postJson('/api/checkout/verify', payload)
}
