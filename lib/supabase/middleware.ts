import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // Obtener usuario
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  console.log('=== MIDDLEWARE DEBUG ===')
  console.log('Path:', request.nextUrl.pathname)
  console.log('User error:', userError)
  console.log('User:', user?.email || 'No user')
  console.log('User ID:', user?.id || 'No ID')

  // Definir rutas
  const isLoginPage = request.nextUrl.pathname === '/login'
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin')

  // Si está en página de admin y no está autenticado
  if (isAdminPage && !user) {
    console.log('No autenticado, redirigiendo a login')
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Si está autenticado y es página de admin, verificar rol
  if (isAdminPage && user) {
    console.log('Buscando perfil para user ID:', user.id)
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    console.log('Profile error:', profileError)
    console.log('Profile data:', profile)
    console.log('Profile role:', profile?.role)
    
    if (profileError) {
      console.log('Error obteniendo perfil:', profileError.message)
    }
    
    if (profile?.role !== 'admin') {
      console.log('No es admin, redirigiendo a home')
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    console.log('Es admin, permitiendo acceso')
  }

  // Si está en login y ya autenticado, redirigir a admin
  if (isLoginPage && user) {
    console.log('Usuario autenticado en login, redirigiendo a admin')
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return supabaseResponse
}