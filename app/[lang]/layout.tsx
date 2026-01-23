import { GoogleAnalytics } from "@next/third-parties/google"
import type { Metadata, Viewport } from "next"
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google"
import { notFound } from "next/navigation"
import { DiagramProvider } from "@/contexts/diagram-context"
import { DictionaryProvider } from "@/hooks/use-dictionary"
import type { Locale } from "@/lib/i18n/config"
import { i18n } from "@/lib/i18n/config"
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries"

import "../globals.css"

const plusJakarta = Plus_Jakarta_Sans({
    variable: "--font-sans",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
})

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
    weight: ["400", "500"],
})

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}

// Generate static params for all locales
export async function generateStaticParams() {
    return i18n.locales.map((locale) => ({ lang: locale }))
}

// Generate metadata per locale
export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>
}): Promise<Metadata> {
    const { lang: rawLang } = await params
    const lang = (rawLang in { en: 1, zh: 1, ja: 1 } ? rawLang : "en") as Locale

    // Default to English metadata
    const titles: Record<Locale, string> = {
        en: "DiagramAI - AI-Powered Diagram Generator",
        zh: "DiagramAI - AI 智能图表生成器",
        ja: "DiagramAI - AI パワー図表ジェネレーター",
    }

    const descriptions: Record<Locale, string> = {
        en: "Create AWS architecture diagrams, flowcharts, and technical diagrams using AI. Free online tool integrating draw.io with AI assistance for professional diagram creation.",
        zh: "使用 AI 创建 AWS 架构图、流程图和技术图表。免费在线工具，集成 draw.io 和 AI 助手，专业图表创建。",
        ja: "AI を使用して AWS アーキテクチャ図、フローチャート、技術図を作成します。draw.io と AI アシスタントを統合した無料オンラインツールでプロの図表を作成。",
    }

    return {
        title: titles[lang],
        description: descriptions[lang],
        keywords: [
            "AI diagram generator",
            "AWS architecture",
            "flowchart creator",
            "draw.io",
            "AI drawing tool",
            "technical diagrams",
            "diagram automation",
            "free diagram generator",
            "online diagram maker",
        ],
        authors: [{ name: "DiagramAI" }],
        creator: "DiagramAI",
        publisher: "DiagramAI",
        metadataBase: new URL("https://next-ai-drawio.jiang.jp"),
        openGraph: {
            title: titles[lang],
            description: descriptions[lang],
            type: "website",
            url: "https://next-ai-drawio.jiang.jp",
            siteName: "Next AI Draw.io",
            locale: lang === "zh" ? "zh_CN" : lang === "ja" ? "ja_JP" : "en_US",
            images: [
                {
                    url: "/architecture.png",
                    width: 1200,
                    height: 630,
                    alt: "Next AI Draw.io - AI-powered diagram creation tool",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: titles[lang],
            description: descriptions[lang],
            images: ["/architecture.png"],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
        icons: {
            icon: "/favicon.ico",
        },
        alternates: {
            languages: {
                en: "/en",
                zh: "/zh",
                ja: "/ja",
            },
        },
    }
}

export default async function RootLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode
    params: Promise<{ lang: string }>
}>) {
    const { lang } = await params
    if (!hasLocale(lang)) notFound()
    const validLang = lang as Locale
    const dictionary = await getDictionary(validLang)

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "DiagramAI",
        applicationCategory: "DesignApplication",
        operatingSystem: "Web Browser",
        description:
            "AI-powered diagram generator with targeted XML editing capabilities that integrates with draw.io for creating AWS architecture diagrams, flowcharts, and technical diagrams. Features diagram history, multi-provider AI support, and real-time collaboration.",
        url: "https://diagram-ai.jiang.jp",
        inLanguage: validLang,
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
        },
    }

    return (
        <html lang={validLang} suppressHydrationWarning>
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body
                className={`${plusJakarta.variable} ${jetbrainsMono.variable} antialiased`}
            >
                <DictionaryProvider dictionary={dictionary}>
                    <DiagramProvider>{children}</DiagramProvider>
                </DictionaryProvider>
            </body>
            {process.env.NEXT_PUBLIC_GA_ID && (
                <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
            )}
        </html>
    )
}
