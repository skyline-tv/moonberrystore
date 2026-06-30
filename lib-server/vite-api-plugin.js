import { handleCheckoutCreate } from './checkout.js'
import { handleHealthCheck } from './health.js'
import { handleStorefrontProxy } from './shopify-storefront-proxy.js'
import { handleApiRoute } from './http.js'

async function handleCheckoutVerifyDeprecated() {
  throw new Error('Online payments use Shopify only. Complete payment on the Shopify invoice page.')
}

/** @type {Record<string, { kind: 'json' | 'post' | 'proxy', handler: Function }>} */
const routes = {
  '/api/health': { kind: 'json', handler: handleHealthCheck },
  '/api/checkout/create': { kind: 'post', handler: handleCheckoutCreate },
  '/api/checkout/verify': { kind: 'post', handler: handleCheckoutVerifyDeprecated },
  '/api/shopify-storefront': { kind: 'proxy', handler: handleStorefrontProxy },
  '/shopify-storefront': { kind: 'proxy', handler: handleStorefrontProxy },
}

function applyEnvToProcess(env) {
  if (!env) return
  for (const [key, value] of Object.entries(env)) {
    if (value && process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

export function moonberryApiDevPlugin(env) {
  applyEnvToProcess(env)

  return {
    name: 'moonberry-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]
        const route = routes[url]
        if (!route) return next()

        if (route.kind === 'json') {
          try {
            const result = await route.handler()
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(result))
          } catch (error) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: error?.message || 'Request failed.' }))
          }
          return
        }

        if (route.kind === 'proxy') {
          await route.handler(req, res)
          return
        }

        await handleApiRoute(req, res, route.handler)
      })
    },
  }
}
