import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Completely disabled - no middleware processing
  return NextResponse.next()
}

export const config = {
  matcher: [
    // No matchers - middleware completely disabled
  ],
}