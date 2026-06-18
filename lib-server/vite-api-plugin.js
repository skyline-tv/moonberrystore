import { handleCheckoutCreate, handleCheckoutVerify } from './checkout.js'
import { handleApiRoute } from './http.js'

const routes = {
  '/api/checkout/create': handleCheckoutCreate,
  '/api/checkout/verify': handleCheckoutVerify,
}

export function moonberryApiDevPlugin() {
  return {
    name: 'moonberry-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]
        const handler = routes[url]
        if (!handler) return next()
        await handleApiRoute(req, res, handler)
      })
    },
  }
}
