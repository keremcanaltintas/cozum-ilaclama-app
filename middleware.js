import { NextResponse } from 'next/server';
import { verifyToken } from './app/lib/auth';

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Statik dosyalar, resimler ve serbest bırakılacak API rotaları
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/login') ||
        pathname.startsWith('/api/admin-setup') ||
        pathname.includes('.') || // logo.jpg, favicon.ico gibi uzantılı dosyalar
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next();
    }

    // Çerezlerden token'ı al
    const token = request.cookies.get('auth_token')?.value;

    // Token doğrulaması yap
    const payload = await verifyToken(token);

    // Oturum kapalıysa ve giriş sayfası harici bir yere gitmeye çalışıyorsa yönlendir
    if (!payload && pathname !== '/login') {
        // Eğer bir API isteği ise yönlendirme yerine 401 JSON hatası dön
        if (pathname.startsWith('/api/')) {
            return NextResponse.json(
                { success: false, error: "Yetkisiz erişim. Oturumunuz kapalı veya geçersiz." }, 
                { status: 401 }
            );
        }

        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Oturum açıksa ve tekrar login sayfasına gitmeye çalışıyorsa ana sayfaya at
    if (payload && pathname === '/login') {
        const homeUrl = new URL('/', request.url);
        return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Next.js statik dosyaları hariç tüm rotalarda middleware'i tetikle
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
