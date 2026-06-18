import { handleCheckoutVerify } from '../../lib-server/checkout.js'
import { handleApiRoute } from '../../lib-server/http.js'

export default async function handler(req, res) {
  await handleApiRoute(req, res, handleCheckoutVerify)
}
