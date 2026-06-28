import { getServerConfig } from './env.js'

let cachedToken = {
  value: '',
  scope: '',
  expiresAt: 0,
}

export function clearAdminTokenCache() {
  cachedToken = { value: '', scope: '', expiresAt: 0 }
}

export function getCachedAdminTokenScope() {
  return cachedToken.scope || ''
}

export async function resolveAdminAccessToken({ forceRefresh = false } = {}) {
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
  if (!forceRefresh && cachedToken.value && now < cachedToken.expiresAt - 60_000) {
    return cachedToken.value
  }

  const response = await fetch(`https://${storeDomain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  const raw = await response.text()
  let json = {}
  try {
    json = raw ? JSON.parse(raw) : {}
  } catch {
    const oauthError = raw.match(/Oauth error ([a-z_]+)/i)?.[1]
    if (oauthError) json = { error: oauthError }
  }

  if (!response.ok || !json.access_token) {
    const detail = json.error_description || json.error || `HTTP ${response.status}`
    const hints = {
      app_not_installed:
        'Install “Moonberry Checkout” on this store: Dev Dashboard → your app → Install app (or open the store from the app’s Test / Install link).',
      shop_not_permitted:
        'This app and store must be in the same Shopify organization, or use a different auth flow.',
    }
    const hint = hints[json.error] || 'Ensure the app is installed on this store and has draft order scopes.'
    throw new Error(`Could not get Admin API token from Dev Dashboard credentials. ${detail} ${hint}`)
  }

  const expiresInSeconds = Number(json.expires_in) || 86_400
  cachedToken = {
    value: json.access_token,
    scope: String(json.scope || ''),
    expiresAt: now + expiresInSeconds * 1000,
  }

  return cachedToken.value
}

export async function fetchAdminTokenInfo({ forceRefresh = false } = {}) {
  await resolveAdminAccessToken({ forceRefresh })
  const scope = getCachedAdminTokenScope()
  const scopes = scope
    ? scope.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  return {
    scopes,
    hasWriteDraftOrders: scopes.includes('write_draft_orders'),
  }
}
