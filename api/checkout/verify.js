import { handleApiRoute } from '../../lib-server/http.js'
import { handleCheckoutVerify } from '../../lib-server/checkout.js'

export default async function handler(req, res) {
  await handleApiRoute(req, res, handleCheckoutVerify)
}
