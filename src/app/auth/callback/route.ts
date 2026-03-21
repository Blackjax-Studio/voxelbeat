import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/'
  const redirectTo = next.startsWith('/') ? `${origin}${next}` : next

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // If "next" is /auth/reset-password, or type is recovery, redirect to reset-password
      if (type === 'recovery' || next === '/auth/reset-password') {
        return NextResponse.redirect(`${origin}/auth/reset-password`)
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // Hello, Cloudflare!
      const isLocalEnv = process.env.NODE_ENVIRONMENT === 'development'
      if (isLocalEnv) {
        // we can be sure that origin is http://localhost:3000
        return NextResponse.redirect(redirectTo)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(redirectTo)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/error?message=${encodeURIComponent('Could not exchange code for session')}`)
}
