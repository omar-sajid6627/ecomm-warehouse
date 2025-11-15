import { env } from './env';

export function resolveProductImageUrl(input: string, width = 1200): string {
  if (!input) return `${env.CLOUDINARY_BASE}/q_auto,f_auto,w_${width}/placeholder.jpg`;
  if (input.startsWith('http://') || input.startsWith('https://')) return input;
  return `${env.CLOUDINARY_BASE}/q_auto,f_auto,w_${width}/${input}.jpg`;
}
