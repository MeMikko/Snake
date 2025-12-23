export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

/**
 * Farcaster / Base MiniApp embed metadata
 * (structure kept identical to working example)
 */
const miniAppEmbed = `{
  "version": "1",
  "requestUser": true,
  "requestProfilePhoto": true,
  "imageUrl": "https://snake-tawny-three.vercel.app/og.png",
  "button": {
    "title": "Play Snake",
    "action": {
      "type": "launch_frame",
      "name": "Base Snake Daily",
      "url": "https://snake-tawny-three.vercel.app/",
      "splashImageUrl": "https://snake-tawny-three.vercel.app/splash.png",
      "splashBackgroundColor": "#0b0c10"
    }
  }
}`;

export const metadata: Metadata = {
  title: "Base Snake | Daily Mini App",
  description: "Daily Snake on Base MiniKit with check-ins, scores, and leaderboard."
};

/**
 * Theme initializer (MiniKit → localStorage → system)
 * (EI MUUTETTU)
 */
const themeInitializer = `(() => {
  try {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = window.localStorage.getItem('minikit-preferred-theme');
    const miniTheme = window.MiniKit?.theme;
    const resolved =
      storedTheme ??
      miniTheme ??
      (systemPrefersDark ? 'dark' : 'light');
    document.body.dataset.theme = resolved;
  } catch (error) {
    document.body.dataset.theme = 'light';
  }
})();`;

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* 🔑 CRITICAL: signal MiniKit readiness BEFORE React mounts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (window.MiniKit && typeof window.MiniKit.ready === 'function') {
                window.MiniKit.ready();
              }
            `
          }}
        />

        {/* Standard OpenGraph */}
        <meta property="og:title" content="Base Snake Daily" />
        <meta
          property="og:description"
          content="Play Snake daily, check in onchain, and climb the leaderboard."
        />
        <meta
          property="og:image"
          content="https://snake-tawny-three.vercel.app/og.png"
        />
        <meta name="twitter:card" content="summary_large_image" />

        {/* Farcaster Mini App embeds */}
        <meta name="fc:miniapp" content={miniAppEmbed} />
        <meta name="fc:frame" content={miniAppEmbed} />

        {/* Base Mini App identification */}
        <meta name="base:app_id" content="694a757e4d3a403912ed7c84" />

        {/* Base required OpenGraph mirrors */}
        <meta name="base:og_title" content="Base Snake Daily" />
        <meta
          name="base:og_description"
          content="Daily Snake with onchain check-ins and leaderboard."
        />
        <meta
          name="base:og_image_url"
          content="https://snake-tawny-three.vercel.app/og.png"
        />

        {/* Optional Base flags */}
        <meta name="base:noindex" content="false" />
      </head>

      <body>
        {/* Theme sync before render */}
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />

        {/* ✅ GLOBAL AUTH / CONTEXT */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
