import { NextRequest, NextResponse } from 'next/server'

// Define the locales we support
export const locales = ['en', 'th']
export const defaultLocale = 'en'

// Get the preferred locale from the request
function getLocale(request: NextRequest) {
  // Use user's preferred locale from their Accept-Language header if available
  const acceptedLanguage = request.headers.get('accept-language')
  if (acceptedLanguage) {
    const preferredLocale = acceptedLanguage.split(',')[0].trim().split('-')[0]
    if (locales.includes(preferredLocale)) {
      return preferredLocale
    }
  }
  
  // Check the URL for a locale if specified
  const pathname = request.nextUrl.pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  
  if (pathnameHasLocale) {
    return pathname.split('/')[1]
  }
  
  return defaultLocale
}

export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const pathname = request.nextUrl.pathname
  
  // Skip middleware for public files and api routes
  if (
    [
      '/favicon.ico',
      '/api',
    ].some(path => pathname.startsWith(path)) ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }
  
  // Get locale from URL or user preference
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )
  
  // Redirect if there is no locale in URL
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request)
    
    // Preserve the existing query parameters
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith('/') ? pathname : `/${pathname}`}${request.nextUrl.search}`,
        request.url
      )
    )
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)'],
}
