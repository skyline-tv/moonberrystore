import { getServerConfig } from './env.js'

let cachedToken = {
  value: '',
  expiresAt: 0,
}

export function clearAdminTokenCache() {
  cachedToken = { value: '', expiresAt: 0 }
}

export async function resolveAdminAccessToken() {
  const { storeDomain, adminToken, clientId, clientSecret, hasLegacyAdminToken, hasDevDashboardAuth } =
    getServerConfig()

  if (hasLegacyAdminToken) {
    return adminToken
  }

  if (!hasDevDashboardAuth) {
    throw new Error(
      'Shopify Admin API is not configured. Add SHOPIFY_ADMIN_ACCESS_TOKEN or SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET from the Dev Dashboard.',
    )
  }

  const now = Date.now()
  if (cachedToken.value && now < cachedToken.expiresAt - 60_000) {
    return cachedToken.value
  }

  const response = await fetch(`https://${storeDomain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  })

  const json = await response.json().catch(() => ({}))
  if (!response.ok || !json.access_token) {
    const detail = json.error_description || json.error || `HTTP ${response.status}`
    throw new Error(
      `Could not get Admin API token from Dev Dashboard credentials. ${detail} Ensure the app is installed on this store and has draft order scopes.`,
    )
  }

  const expiresInSeconds = Number(json.expires_in) || 86_400
  cachedToken = {
    value: json.access_token,
    expiresAt: now + expiresInSeconds * 1000,
  }

  return cachedToken.value
}
