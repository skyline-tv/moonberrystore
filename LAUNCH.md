# Launch today — MoonBerry on Vercel + Shopify

**Architecture:** React storefront on **Vercel** · catalog, cart, customers via **Shopify Storefront API** · **custom on-site checkout** · **all payments via Shopify** (COD + Shopify Payments invoice for UPI/card).

Customers stay on Moonberry for the entire checkout — contact, address, and payment.

---

## Launch checklist (~1 hour)

### 1. Shopify Dev Dashboard (required for checkout)

- [ ] [dev.shopify.com](https://dev.shopify.com) → create app → install on your store
- [ ] **Storefront API** scopes: products, cart, checkouts, customers (read/write as needed)
- [ ] **Admin API** scopes: `write_draft_orders`, `read_draft_orders`, `write_orders`, `read_orders`
- [ ] Products published to your **Headless** sales channel
- [ ] **Settings → Customer accounts** → **Legacy** (for `/login` on this site)

### 2. Environment variables

**Local `.env` and Vercel (Production):**

| Variable | Required |
|----------|----------|
| `VITE_SHOPIFY_STORE_DOMAIN` | Yes |
| `VITE_SHOPIFY_STOREFRONT_TOKEN` | Yes |
| `SHOPIFY_STORE_DOMAIN` | Yes |
| `SHOPIFY_STOREFRONT_TOKEN` | Yes |
| `SHOPIFY_CLIENT_ID` | Yes (Dev Dashboard) |
| `SHOPIFY_CLIENT_SECRET` | Yes (Dev Dashboard) |

Enable **Shopify Payments** in Admin → Settings → Payments for online UPI/card.

```bash
npm run check:env    # must print COD ready: YES
npm run build
npm run dev
```

### 3. Test locally

1. Add **Test** to bag → **Checkout**
2. Fill contact, address, choose **Cash on delivery**
3. **Place order (COD)** → order in **Shopify Admin → Orders** (tag `moonberry-headless`)

If the yellow banner appears, Admin credentials are missing — checkout cannot complete until they are set.

### 4. Deploy

```bash
git push origin main   # if GitHub connected to Vercel
```

Or: `npx vercel --prod`

### 5. Smoke test (production)

- [ ] Shop loads products
- [ ] Full checkout on Moonberry (no redirect)
- [ ] COD order appears in Shopify Admin
- [ ] Razorpay UPI/card if configured

---

## What runs where

| Feature | Where |
|---------|--------|
| Product pages, cart, checkout UI | Vercel (SPA) |
| Catalog, cart sync, login | Shopify Storefront API |
| Create order | Vercel `/api/checkout` → Shopify Admin draft order |
| COD | Moonberry form → Shopify order (pay on delivery) |
| UPI / Card | Moonberry form → Shopify invoice page → Shopify Payments |
| Fulfillment, inventory | Shopify Admin |

---

## Post-launch polish

- `VITE_CONTACT_PHONE` / `VITE_CONTACT_EMAIL`
- Custom domain on Vercel
- Newsletter integration
- Analytics

You are **launch-ready** once `npm run check:env` shows **COD ready: YES** and one test order succeeds.
