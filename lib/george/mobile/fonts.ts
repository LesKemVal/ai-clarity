export const ANDROID_UTILITY_FONT =
  'Roboto, Inter, ui-sans-serif, system-ui, sans-serif'

export const IOS_GEORGE_FONT =
  'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif'

export function getGeorgeMobileFont(userAgent?: string) {
  if (!userAgent) return IOS_GEORGE_FONT

  const ua = userAgent.toLowerCase()

  const isAndroid = ua.includes('android')
  const isIOS =
    ua.includes('iphone') ||
    ua.includes('ipad') ||
    ua.includes('ipod')

  if (isAndroid) {
    return ANDROID_UTILITY_FONT
  }

  if (isIOS) {
    return IOS_GEORGE_FONT
  }

  return IOS_GEORGE_FONT
}
