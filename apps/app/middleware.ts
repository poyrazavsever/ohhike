import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Korumaya alınmayacak ve herkesin girebileceği rotalar
const publicRoutes = ['/login', '/register', '/api'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Eğer istek herkese açık bir rotaya gidiyorsa (login/register) middleware'i es geç.
  // Not: publicRoutes dizisindeki herhangi bir string ile başlıyorsa es geçer.
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Tarayıcı çerezlerinden 'ohhike_token' anahtarını oku
  const token = request.cookies.get('ohhike_token')?.value;

  // Eğer token yoksa (kullanıcı giriş yapmamışsa) login'e yönlendir
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Eğer token varsa geçişine izin ver
  return NextResponse.next();
}

// Middleware'in hangi yollarda çalışacağını belirtiyoruz
// Next.js'in statik dosyalarını ve imajlarını filtreliyoruz
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public klasöründeki dosyalar vb.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
