export const SITE_NAME = 'MoonBerry'
export const SITE_TAGLINE = 'Perfumes, nails & hair care — crafted for India.'

export const CONTACT_EMAIL =
  import.meta.env.VITE_CONTACT_EMAIL?.trim() || 'moonberry.bussness@gmail.com'
export const CONTACT_PHONE = import.meta.env.VITE_CONTACT_PHONE?.trim() || ''
export const HAS_CONTACT_PHONE = Boolean(CONTACT_PHONE)
export const CONTACT_ADDRESS =
  import.meta.env.VITE_CONTACT_ADDRESS?.trim() ||
  'Ulhasnagar 3, Thane, Mumbai, Maharashtra, India'
