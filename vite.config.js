import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function normalizeShopifyStoreDomain(raw) {
  if (!raw) return ''
  let d = String(raw).trim()
  d = d.replace(/^https?:\/\//i, '')
  d = d.split('/')[0] || ''
  return d.replace(/\.$/, '').toLowerCase()
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const storeDomain = normalizeShopifyStoreDomain(env.VITE_SHOPIFY_STORE_DOMAIN)
  const apiVersion = env.VITE_SHOPIFY_API_VERSION || '2025-01'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: storeDomain
        ? {
            '/shopify-storefront': {
              target: `https://${storeDomain}`,
              changeOrigin: true,
              secure: true,
              rewrite: () => `/api/${apiVersion}/graphql.json`,
            },
          }
        : {},
    },
  }
})
