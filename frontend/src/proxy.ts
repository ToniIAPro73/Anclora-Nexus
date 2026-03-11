import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { normalizeNextPath } from '@/lib/private-area-access'

export async function proxy(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: Record<string, unknown>) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isLoginPage = req.nextUrl.pathname.startsWith('/login')
  const isAuthCallback = req.nextUrl.pathname.startsWith('/auth/callback')
  const isInvitePage = req.nextUrl.pathname.startsWith('/invite/')
  const isPrivateAreaPublic = req.nextUrl.pathname === '/private-area' || req.nextUrl.pathname.startsWith('/private-area/')
  const isRecoveryFlow =
    req.nextUrl.searchParams.has('code') ||
    req.nextUrl.searchParams.get('mode') === 'reset' ||
    req.nextUrl.searchParams.get('type') === 'recovery'

  if (isAuthCallback || isInvitePage || isPrivateAreaPublic) {
    return res
  }

  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (session && isLoginPage && !isRecoveryFlow) {
    const next = normalizeNextPath(req.nextUrl.searchParams.get('next'), '/dashboard')
    return NextResponse.redirect(new URL(next, req.url))
  }

  if (session && !isLoginPage) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login?error=session-invalid', req.url))
    }

    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()

    if (membershipError || !membership) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login?error=invitation-required', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|brand).*)'],
}
