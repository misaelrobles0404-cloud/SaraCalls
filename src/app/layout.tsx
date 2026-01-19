import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "SaraCalls.AI | Revolucionando la Voz con IA",
    description: "Sistemas de Voz de Nueva Generación",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" className="dark">
            <body className="bg-[#050505] text-white antialiased">
                <div className="cyber-grid"></div>
                {children}
            </body>
        </html>
    );
}
