import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // Create the supabase client
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

  if (isAuthCallback || isInvitePage) {
    return res
  }

  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (session && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Harden access: authenticated users must have an ACTIVE org membership.
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
