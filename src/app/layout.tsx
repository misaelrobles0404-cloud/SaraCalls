import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
        <html lang="es">
            <body className={inter.className}>
                <div className="cyber-grid"></div>
                {children}
            </body>
        </html>
    );
}
