import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18n } from './lib/i18n/config'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 检查路径是否已经包含语言前缀
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return

  // 如果是根路径或其他没有语言前缀的路径，重定向到中文
  const locale = 'zh'
  request.nextUrl.pathname = `/${locale}${pathname}`
  
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  // 匹配所有路径，除了以下这些：
  matcher: [
    // 排除所有内部路径 (_next)
    '/((?!_next|api|favicon.ico|.*\\..*|manifest.webmanifest|robots.txt|sitemap.xml).*)',
  ],
}
