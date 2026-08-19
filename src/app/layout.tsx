import type { Metadata, Viewport } from 'next';
import { Manrope, JetBrains_Mono, Rubik_Wet_Paint } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});
const rubikWetPaint = Rubik_Wet_Paint({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-wordmark',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Rick & Morty - Character Episodes Explorer',
  description:
    'SSR Frontend Developer (NextJS) challenge - Compare episodes between two Rick and Morty characters.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2f8f2f',
};

// Applies the theme class before first paint (an effect would run too late
// and cause a flash of the wrong theme).
const THEME_INIT_SCRIPT = `
  (function () {
    try {
      var stored = localStorage.getItem('theme');
      var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', dark);
    } catch (e) {}
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${jetbrainsMono.variable} ${rubikWetPaint.variable}`}
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
