# Single-client storefront setup

Food Mood remains the working default. To sell the system to another business,
copy the frontend and backend into a new private repository pair, then follow
this checklist before deployment.

## Change one client configuration

Copy `.env.example` to `.env` and set the `VITE_*` values. The key fields are:

- business name and unique slug
- currency code and locale
- logo, hero image, support phone and WhatsApp number
- SEO description and the two theme colours
- deployed backend URL in `VITE_API_BASE_URL`

`src/client-config.js` is the central place for the public storefront identity.
It applies the browser title, description, theme, currency formatting,
client-specific browser-storage names and AI assistant name. Use its logo and
hero values when replacing the storefront assets. Do not put API keys,
database credentials or payment secrets in a Vite environment variable:
frontend values are public.

## Replace client assets

Use the same file names in `public/` or change `VITE_LOGO_URL` and
`VITE_HERO_IMAGE_URL`. Replace category images only when they match the new
catalogue; otherwise the UI automatically uses category icons.

## Configure business data

After the buyer's backend is live, use the owner portal to add their menu,
product variants, stock, delivery zones, minimum subtotal, opening hours and
payment destination. These routine changes need no code deployment.

## Deploy separately per buyer

Each buyer needs their own frontend deployment, FastAPI service, PostgreSQL
database, `.env` values, JWT secret, AI API key and owner account. This keeps
orders, customer data, audit logs and administration isolated.

## Pre-launch test

Run `npm run build`, then test the customer website, owner sign-in, menu
management, delivery fee, minimum subtotal, payment-reference flow and AI
assistant using the buyer's data.
