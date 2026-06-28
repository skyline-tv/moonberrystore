import { handleCheckoutCreate } from './checkout.js'
import { handleHealthCheck } from './health.js'
import { handleApiRoute } from './http.js'

async function handleCheckoutVerifyDeprecated() {
  throw new Error('Online payments use Shopify only. Complete payment on the Shopify invoice page.')
}

const routes = {
  '/api/health': handleHealthCheck,
  '/api/checkout/create': handleCheckoutCreate,
  '/api/checkout/verify': handleCheckoutVerifyDeprecated,
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
        const handler = routes[url]
        if (!handler) return next()

        if (url === '/api/health') {
          try {
            const result = await handler()
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(result))
          } catch (error) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: error?.message || 'Health check failed.' }))
          }
          return
        }

        await handleApiRoute(req, res, handler)
      })
    },
  }
}
