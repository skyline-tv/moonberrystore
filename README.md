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
