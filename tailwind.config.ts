import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: 'hsl(var(--background, 222.2 84% 4.9%))',
                foreground: 'hsl(var(--foreground, 210 40% 98%))',
                primary: 'hsl(var(--primary, 199 89% 48%))',
                border: 'hsl(var(--border, 217.2 32.6% 17.5%))',
                muted: 'hsl(var(--muted, 217.2 32.6% 17.5%))',
                bg: {
                    DEFAULT: '#0B0F16',
                    surface: '#151A24',
                    glass: 'rgba(21, 26, 36, 0.7)',
                },
                accent: {
                    cyan: '#00E5FF',
                    violet: '#7C3AED',
                    success: '#00FFC3',
                },
                text: {
                    primary: '#F8FAFC',
                    secondary: '#94A3B8',
                    mono: '#E2E8F0',
                }
            },
            fontFamily: {
                heading: ["var(--font-space-grotesk)"],
                sans: ["var(--font-inter)"],
                mono: ["var(--font-jetbrains-mono)"],
            },
        },
    },
    plugins: [],
};
export default config;
