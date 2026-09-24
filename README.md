# Food Mood frontend

## Run locally

1. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to the FastAPI server URL.
2. Run `npm install`, then `npm run dev`.

## Netlify

Set the `VITE_API_BASE_URL` environment variable in Netlify to the deployed FastAPI base URL, then deploy with build command `npm run build` and publish directory `dist`. The included `netlify.toml` preserves client-side routes on refresh.

## Product images

Image selection lives in `src/catalog.js`. Replace the local URLs there (or return image URLs from a future backend response) without changing the UI components.

## Vercel demo deployment

Deploy this repository to Vercel and set `VITE_API_BASE_URL` to the HTTPS URL
of the deployed Food Mood API. The included `vercel.json` keeps client-side
routes such as `/menu`, `/cart`, and `/owner/login` working after a refresh.
