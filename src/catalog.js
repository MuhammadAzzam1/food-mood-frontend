// Central image mapping keeps product and category visuals consistent.
const emojiByWord = { burger: '🍔', pizza: '🍕', samosa: '🥟', fries: '🍟', chicken: '🍗', roll: '🌯', drink: '🥤', dessert: '🍰', deal: '🍽️', default: '🍴' };
const findEmoji = value => emojiByWord[Object.keys(emojiByWord).find(word => String(value || '').toLowerCase().includes(word))] || emojiByWord.default;
import { clientConfig } from './client-config';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const resolveImageUrl = value => value?.startsWith('/') ? `${apiBaseUrl}${value}` : value || null;
export function normalizeCategory(raw) { return Array.isArray(raw) ? { id: raw[0], name: raw[1] || `Category ${raw[0]}` } : raw; }
const normalizeVariant = variant => { const stockQuantity = Math.max(0, Number(variant.stock_quantity ?? variant.stockQuantity ?? 0)); const reservedQuantity = Math.max(0, Number(variant.reserved_quantity ?? variant.reservedQuantity ?? 0)); const availableQuantity = Math.max(0, Number(variant.available_quantity ?? variant.availableQuantity ?? stockQuantity - reservedQuantity)); return { id: variant.id, name: variant.name || variant.variant_name || 'Standard', price: Number(variant.price), stockQuantity, reservedQuantity, availableQuantity }; };
export function normalizeProduct(raw) { if (!Array.isArray(raw)) { const variants = (raw.variants || []).map(normalizeVariant); return { ...raw, image_url: resolveImageUrl(raw.image_url), variants, totalStock: variants.reduce((sum, v) => sum + v.stockQuantity, 0), totalReserved: variants.reduce((sum, v) => sum + v.reservedQuantity, 0), totalAvailable: variants.reduce((sum, v) => sum + v.availableQuantity, 0), fromPrice: variants.length ? Math.min(...variants.map(v => v.price)) : 0 }; } const [id, category_id, name, description, variants] = raw; const normalizedVariants = (variants || []).map(v => Array.isArray(v) ? normalizeVariant({ id: v[0], name: v[1], price: v[2], stock_quantity: v[3], reserved_quantity: v[4], available_quantity: v[5] }) : normalizeVariant(v)); return { id, category_id, name: name || `${clientConfig.businessName} item ${id}`, description: description || '', variants: normalizedVariants, totalStock: normalizedVariants.reduce((sum, v) => sum + v.stockQuantity, 0), totalReserved: normalizedVariants.reduce((sum, v) => sum + v.reservedQuantity, 0), totalAvailable: normalizedVariants.reduce((sum, v) => sum + v.availableQuantity, 0), fromPrice: normalizedVariants.length ? Math.min(...normalizedVariants.map(v => v.price)) : 0 }; }
export const categoryImage = item => findEmoji(item.name);
const categoryPhotos = {
  samosa: '/category-samosa.jpeg',
  rolls: '/category-rolls.jpeg',
  pizza: '/category-mini-pizza.jpeg',
  wontons: '/category-wontons.jpeg',
  kebabs: '/category-kebabs.jpeg',
};
export const categoryPhoto = item => categoryPhotos[Object.keys(categoryPhotos).find(word => String(item?.name || '').toLowerCase().includes(word))] || null;
export const productImage = item => item.image || findEmoji(item.name);
