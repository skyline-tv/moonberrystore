# Moonberry Storefront

Premium React + Tailwind storefront for Moonberry beauty/perfume brand, with Shopify Storefront API-ready integration.

## Local Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Shopify Environment Variables

Create a `.env` file (or set these in Vercel Project Settings -> Environment Variables):

```env
VITE_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=your_storefront_token
VITE_SHOPIFY_API_VERSION=2025-01
```

## Custom checkout API (Shopify orders + Razorpay)

The `/checkout` page posts to serverless routes in `api/checkout/` which create **real Shopify orders** via the Admin API (draft orders). Cash on delivery completes immediately; UPI/card open **Razorpay** on the same page (no Shopify redirect).

Copy `.env.example` to `.env` and set:

| Variable | Where | Purpose |
|----------|--------|---------|
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Server only | Create/complete draft orders |
| `SHOPIFY_STORE_DOMAIN` / `SHOPIFY_STOREFRONT_TOKEN` | Server | Validate cart on checkout |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Server | UPI & card payments |
| `VITE_RAZORPAY_KEY_ID` | Browser | Razorpay checkout modal |

**Shopify Admin token:** In Shopify Admin → Settings → Apps → Develop apps → create a custom app with scopes `write_draft_orders`, `read_draft_orders`, `write_orders`, `read_orders`. Install the app and copy the Admin API access token.

**Local dev:** `npm run dev` serves `/api/checkout/*` via a Vite plugin (same handlers as Vercel). Restart the dev server after changing server env vars.

## Vercel Deployment

This repo is Vercel-ready:

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- SPA route rewrites are configured in `vercel.json`

Deploy with either:

- Vercel dashboard (import GitHub repo)
- or Vercel CLI:

```bash
npm i -g vercel
vercel
vercel --prod
```
