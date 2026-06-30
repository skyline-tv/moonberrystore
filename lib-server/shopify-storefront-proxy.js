import { getServerConfig } from './env.js'

export async function proxyStorefrontRequest(req) {
  const { storeDomain, storefrontToken, apiVersion, hasStorefront } = getServerConfig()
  if (!hasStorefront) {
    throw new Error(
      'Shopify Storefront API is not configured on the server. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN.',
    )
  }

  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  const body = Buffer.concat(chunks).toString('utf8')

  const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': storefrontToken,
  }

  const customerToken = req.headers['shopify-customer-access-token']
  if (customerToken) {
    headers['Shopify-Customer-Access-Token'] = customerToken
  }

  const response = await fetch(`https://${storeDomain}/api/${apiVersion}/graphql.json`, {
    method: 'POST',
    headers,
    body,
  })

  return {
    status: response.status,
    body: await response.text(),
  }
}

export function applyStorefrontProxyCors(req, res) {
  const origin = req.headers.origin || '*'
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Shopify-Storefront-Access-Token, Shopify-Customer-Access-Token',
  )
  res.setHeader('Vary', 'Origin')
}

export async function handleStorefrontProxy(req, res) {
  applyStorefrontProxyCors(req, res)

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Method not allowed.' }))
    return
  }

  try {
    const { status, body } = await proxyStorefrontRequest(req)
    res.statusCode = status
    res.setHeader('Content-Type', 'application/json')
    res.end(body)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Storefront proxy failed.'
    res.statusCode = 502
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ errors: [{ message }] }))
  }
}
