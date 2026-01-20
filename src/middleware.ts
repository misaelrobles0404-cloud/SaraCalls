import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    let res = NextResponse.next();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return req.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    res.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    res.cookies.set({ name, value: '', ...options });
                },
            },
        }
    );

    const {
        data: { session },
    } = await supabase.auth.getSession();

    // Si intentan acceder al admin sin sesión, redirigir al login
    if (!session && (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/super-admin'))) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // Protección específica para Super Admin
    if (session && req.nextUrl.pathname.startsWith('/super-admin')) {
        const isAdmin = session.user.email === "misaerobles0404@gmail.com" ||
            session.user.email === "misaelrobles0404@gmail.com";
        if (!isAdmin) {
            return NextResponse.redirect(new URL('/admin', req.url));
        }
    }

    // Si ya tiene sesión e intenta ir al login, mandarlo al lugar correcto
    if (session && req.nextUrl.pathname.startsWith('/login')) {
        const isAdmin = session.user.email === "misaerobles0404@gmail.com" ||
            session.user.email === "misaelrobles0404@gmail.com";
        if (isAdmin) {
            return NextResponse.redirect(new URL('/super-admin', req.url));
        }
        return NextResponse.redirect(new URL('/admin', req.url));
    }

    return res;
}

export const config = {
    matcher: ['/admin/:path*', '/super-admin/:path*', '/login'],
};
