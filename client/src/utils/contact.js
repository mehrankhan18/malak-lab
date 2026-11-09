export const MALAK_LAB_PHONE = '0328 5027351';
export const MALAK_LAB_PHONE_LINK = '+923285027351';
export const MALAK_LAB_WHATSAPP = '923285027351';
export const MALAK_LAB_WHATSAPP_DISPLAY = '0328 5027351';

export function getMalakWhatsAppUrl(message = '') {
  const baseUrl = `https://wa.me/${MALAK_LAB_WHATSAPP}`;
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
}
