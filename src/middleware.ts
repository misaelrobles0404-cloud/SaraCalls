import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: req.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return req.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    req.cookies.set({ name, value, ...options });
                    response = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    });
                    response.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    req.cookies.set({ name, value: '', ...options });
                    response = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    });
                    response.cookies.set({ name, value: '', ...options });
                },
            },
        }
    );

    // IMPORTANTE: Usar getUser() en lugar de getSession() para mayor seguridad en el servidor
    const { data: { user } } = await supabase.auth.getUser();

    // Lógica de Redirección
    const isLoginPage = req.nextUrl.pathname.startsWith('/login');
    const isAdminPath = req.nextUrl.pathname.startsWith('/admin');
    const isSuperAdminPath = req.nextUrl.pathname.startsWith('/super-admin');

    if (!user && (isAdminPath || isSuperAdminPath)) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    if (user) {
        const isAdmin = user.email === "misaerobles0404@gmail.com" ||
            user.email === "misaelrobles0404@gmail.com";

        if (isLoginPage) {
            return NextResponse.redirect(new URL(isAdmin ? '/super-admin' : '/admin', req.url));
        }

        if (isSuperAdminPath && !isAdmin) {
            return NextResponse.redirect(new URL('/admin', req.url));
        }
    }

    return response;
}

export const config = {
    matcher: ['/admin/:path*', '/super-admin/:path*', '/login'],
};
