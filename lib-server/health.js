import { getServerConfig } from './env.js'

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
  return getCheckoutReadiness()
}
