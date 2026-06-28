import { handleHealthCheck } from '../lib-server/health.js'
import { applyCors, sendJson } from '../lib-server/http.js'

export default async function handler(req, res) {
  applyCors(req, res)
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }
  try {
    const result = await handleHealthCheck()
    sendJson(res, 200, result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Health check failed.'
    sendJson(res, 500, { error: message })
  }
}
