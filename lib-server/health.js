import { getServerConfig } from './env.js'
import { fetchAdminTokenInfo } from './shopify-admin-auth.js'

export function getCheckoutReadiness() {
  const config = getServerConfig()
  return {
    storefront: config.hasStorefront,
    admin: config.hasAdmin,
    adminAuth: config.hasLegacyAdminToken
      ? 'legacy_token'
      : config.hasDevDashboardAuth
        ? 'dev_dashboard'
        : 'missing',
    razorpay: config.hasRazorpay,
    codReady: config.hasStorefront && config.hasAdmin,
    storeDomain: config.storeDomain || null,
  }
}

export async function handleHealthCheck() {
  const readiness = getCheckoutReadiness()
  if (!readiness.admin || readiness.adminAuth !== 'dev_dashboard') {
    return readiness
  }

  try {
    const tokenInfo = await fetchAdminTokenInfo({ forceRefresh: true })
    return {
      ...readiness,
      adminScopes: tokenInfo.scopes,
      hasWriteDraftOrders: tokenInfo.hasWriteDraftOrders,
      codReady: readiness.codReady && tokenInfo.hasWriteDraftOrders,
    }
  } catch (error) {
    return {
      ...readiness,
      adminTokenError: error?.message || 'Could not fetch Admin API token.',
      codReady: false,
    }
  }
}
