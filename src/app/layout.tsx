import '@/styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { Roboto } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Analytics } from '@/components/analytics';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TxTool - Blockchain Transaction Tool | Crypto Analysis Platform',
  description: 'Professional blockchain transaction parser and analysis tool. Decode raw transactions for Bitcoin, Ethereum, Solana, and Cosmos. EVM utilities and encoding converters for crypto developers.',
  keywords: 'blockchain, transaction parser, crypto tools, bitcoin transaction decoder, ethereum transaction, raw transaction, hex decoder, EVM tools, web3 utilities, blockchain explorer, crypto developer tools, base58, base64, timestamp converter, gas price, token balance, transaction hash, blockchain analysis, BTC, ETH, SOL, ATOM, taproot, segwit, P2PKH, P2SH, P2TR',
  authors: [{ name: 'TxTool Team' }],
  creator: 'TxTool',
  publisher: 'TxTool',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://txtool.fun/',
    title: 'TxTool - Blockchain Transaction Analysis Platform',
    description: 'Decode and analyze raw blockchain transactions. Tools for Bitcoin, Ethereum, Solana and Cosmos developers.',
    siteName: 'TxTool',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TxTool - Blockchain Transaction Parser',
    description: 'Professional tools for blockchain developers and analysts',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={roboto.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}