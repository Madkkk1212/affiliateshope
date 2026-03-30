import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Hidden Admin Path Protection
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || 'asjdnhashd'
  const isAdminPath = request.nextUrl.pathname.startsWith(`/${adminPath}`)
  
  // Block legacy /studio path
  if (request.nextUrl.pathname.startsWith('/studio')) {
    return NextResponse.rewrite(new URL('/not-found', request.url))
  }

  if (isAdminPath) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const loginSecret = process.env.NEXT_PUBLIC_LOGIN_PATH || 'y7z2k9'
    const dashboardSecret = process.env.NEXT_PUBLIC_DASHBOARD_PATH || 'm4n5b6'
    
    const loginPath = `/${adminPath}/${loginSecret}`
    const dashboardPath = `/${adminPath}/${dashboardSecret}`

    // Allow access to login page
    if (request.nextUrl.pathname === loginPath) {
      // If already logged in as admin, go to dashboard
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profile?.role === 'admin') {
          return NextResponse.redirect(new URL(dashboardPath, request.url))
        }
      }
      return supabaseResponse
    }

    if (!user) {
      return NextResponse.redirect(new URL(loginPath, request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Redirect /adminPath (root) to /adminPath/dashboard
    if (request.nextUrl.pathname === `/${adminPath}`) {
      return NextResponse.redirect(new URL(dashboardPath, request.url))
    }
  }

  return supabaseResponse
}
