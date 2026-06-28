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

const { getCheckoutReadiness } = await import('../lib-server/health.js')

const status = getCheckoutReadiness()

console.log('MoonBerry checkout readiness\n')
console.log(`  Storefront API : ${status.storefront ? 'OK' : 'MISSING'}`)
console.log(`  Admin API      : ${status.admin ? 'OK' : 'MISSING (required for COD)'}`)
if (status.admin) console.log(`  Admin auth     : ${status.adminAuth}`)
console.log(`  Razorpay       : ${status.razorpay ? 'OK' : 'optional'}`)
console.log(`  COD ready      : ${status.codReady ? 'YES' : 'NO'}`)
if (status.storeDomain) console.log(`  Store          : ${status.storeDomain}`)

if (!status.codReady) {
  console.log('\nTo test COD, add either:')
  console.log('  • SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET (Dev Dashboard — recommended in 2026)')
  console.log('  • or SHOPIFY_ADMIN_ACCESS_TOKEN (legacy custom app shpat_ token)')
  console.log('Dev Dashboard: Settings → Apps → Build apps in Dev Dashboard')
  process.exit(1)
}

console.log('\nReady. Run: npm run dev → add to bag → /checkout → Cash on delivery')
process.exit(0)
