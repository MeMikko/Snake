import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Base Snake | Daily Mini App',
  description: 'Daily Snake on Base MiniKit with check-ins, scores, and leaderboard.'
};

const themeInitializer = `(() => {
  try {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = window.localStorage.getItem('minikit-preferred-theme');
    const miniTheme = window.MiniKit?.themePreference;
    const resolved = (storedTheme && storedTheme !== 'system') ? storedTheme : (miniTheme && miniTheme !== 'system') ? miniTheme : (systemPrefersDark ? 'dark' : 'light');
    document.documentElement.dataset.theme = resolved;
  } catch (error) {
    document.documentElement.dataset.theme = 'light';
  }
})();`;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
        {children}
      </body>
    </html>
  );
}
