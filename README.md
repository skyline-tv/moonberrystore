# Moonberry Storefront

Premium React + Tailwind storefront for **MoonBerry** — frontend on **Vercel**, catalog/orders/admin on **Shopify**.

**→ Launch checklist: see [LAUNCH.md](./LAUNCH.md)**

## Local Setup

```bash
npm install
cp .env.example .env   # fill in Shopify tokens
npm run dev
```

`npm run dev` serves the storefront, `/shopify-storefront` (Shopify proxy), and `/api/checkout/*` — same routes as Vercel.

## Build

```bash
npm run build
npm run preview
```

## Environment variables

See `.env.example` and [LAUNCH.md](./LAUNCH.md) for the full list.

**Local browsing:** `VITE_SHOPIFY_STORE_DOMAIN`, `VITE_SHOPIFY_STOREFRONT_TOKEN`.

**Checkout (COD):** `SHOPIFY_CLIENT_ID` + `SHOPIFY_CLIENT_SECRET` (Dev Dashboard).

**Hosted storefront:** also set `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_TOKEN` on Vercel so `/shopify-storefront` can proxy catalog and cart requests server-side.

## Custom checkout

Orders are created in **Shopify Admin** from `/checkout` via serverless API routes — no Shopify hosted checkout redirect. See README section in repo history or LAUNCH.md for Razorpay setup.

## Vercel Deployment

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Add all env vars from LAUNCH.md before going live

```bash
npx vercel --prod
```
