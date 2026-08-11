#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

function loadDotEnv() {
  const path = resolve(process.cwd(), '.env')
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const value = trimmed.slice(idx + 1).trim()
    if (process.env[key] === undefined) process.env[key] = value
  }
}

loadDotEnv()

const { getCheckoutReadiness, handleHealthCheck } = await import('../lib-server/health.js')

const status = await handleHealthCheck()

console.log('MoonBerry checkout readiness\n')
console.log(`  Storefront API : ${status.storefront ? 'OK' : 'MISSING'}`)
if (status.storefront) {
  console.log('  Hosted proxy   : OK (uses SHOPIFY_STORE_DOMAIN + SHOPIFY_STOREFRONT_TOKEN)')
}
console.log(`  Admin API      : ${status.admin ? 'OK' : 'MISSING (required for COD)'}`)
if (status.admin) console.log(`  Admin auth     : ${status.adminAuth}`)
if (status.adminAuth === 'dev_dashboard') {
  const scopeLabel = status.adminScopes?.length ? status.adminScopes.join(', ') : '(none — scopes not granted)'
  console.log(`  Admin scopes   : ${scopeLabel}`)
  console.log(`  write_draft_orders : ${status.hasWriteDraftOrders ? 'YES' : 'NO'}`)
}
if (status.adminTokenError) console.log(`  Token error    : ${status.adminTokenError}`)
console.log(`  Razorpay keys  : ${status.razorpay ? 'OK' : 'MISSING (required for online payments)'}`)
console.log(`  COD ready      : ${status.codReady ? 'YES' : 'NO'}`)
console.log(`  Online payment : ${status.onlinePaymentReady ? 'YES' : 'NO'}`)
if (status.storeDomain) console.log(`  Store          : ${status.storeDomain}`)

if (!status.codReady) {
  console.log('\nTo fix checkout:')
  if (status.admin && status.hasWriteDraftOrders === false) {
    console.log('  1. Dev Dashboard → Moonberry Checkout → Versions → Create version')
    console.log('  2. Scopes: write_draft_orders,read_draft_orders,write_orders,read_orders')
    console.log('  3. Release the version')
    console.log('  4. Shopify Admin → Settings → Apps → Moonberry Checkout → Approve updated permissions')
  } else {
    console.log('  • Add SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET (Dev Dashboard)')
    console.log('  • Install the app on your store')
  }
  if (!status.razorpay) {
    console.log('  • Add RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET to enable online payments')
  }
  process.exit(1)
}

if (!status.onlinePaymentReady) {
  console.log('\nCOD is ready. Add RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET to enable online payments.')
  process.exit(0)
}

console.log('\nReady. Run: npm run dev → add to bag → /checkout → Pay securely')
process.exit(0)
