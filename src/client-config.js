// This is the single client-facing configuration file for a deployment.
// Keep its Food Mood defaults to run this project as-is. Copy the project for
// a new client, then change only these values and the product/menu data.
const fromEnv = (key, fallback) => import.meta.env[key] || fallback;

export const clientConfig = {
  businessName: fromEnv('VITE_BUSINESS_NAME', 'Food Mood'),
  businessSlug: fromEnv('VITE_BUSINESS_SLUG', 'food-mood'),
  currencyCode: fromEnv('VITE_CURRENCY_CODE', 'PKR'),
  currencyLocale: fromEnv('VITE_CURRENCY_LOCALE', 'en-PK'),
  logoUrl: fromEnv('VITE_LOGO_URL', '/foodmood-logo.jpeg'),
  heroImageUrl: fromEnv('VITE_HERO_IMAGE_URL', '/chicken-samosa-hero.png'),
  supportPhone: fromEnv('VITE_SUPPORT_PHONE', '0336 6860080'),
  supportWhatsApp: fromEnv('VITE_SUPPORT_WHATSAPP', '923366860080'),
  seoDescription: fromEnv('VITE_SEO_DESCRIPTION', 'Food Mood — food made with feeling.'),
  theme: {
    orange: fromEnv('VITE_THEME_ORANGE', '#f77713'),
    navy: fromEnv('VITE_THEME_NAVY', '#0b3f92'),
  },
};

export const money = value => `${clientConfig.currencyCode} ${Number(value || 0).toLocaleString(clientConfig.currencyLocale)}`;

export function applyClientBranding() {
  document.title = clientConfig.businessName;
  document.documentElement.style.setProperty('--orange', clientConfig.theme.orange);
  document.documentElement.style.setProperty('--navy', clientConfig.theme.navy);
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute('content', clientConfig.seoDescription);
}
