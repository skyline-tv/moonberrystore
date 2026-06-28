import { handleApiRoute } from '../../lib-server/http.js'

export default async function handler(req, res) {
  await handleApiRoute(req, res, async () => {
    throw new Error('Online payments use Shopify only. Complete payment on the Shopify invoice page.')
  })
}
