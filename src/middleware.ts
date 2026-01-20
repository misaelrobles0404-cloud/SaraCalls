import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    // Si intentan acceder al admin sin sesión, redirigir al login
    if (!session && req.nextUrl.pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // Si ya tiene sesión e intenta ir al login, mandarlo al admin
    if (session && req.nextUrl.pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/admin', req.url));
    }

    return res;
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
};
