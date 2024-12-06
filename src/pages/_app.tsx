import 'styles/style.css'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { useRouter } from 'next/router'
import HeadGlobal from 'components/HeadGlobal'
import { GoogleAnalytics } from '@next/third-parties/google'
import { GoogleAdsense } from 'components/GoogleAdsense'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  return (
    <ThemeProvider defaultTheme="system" attribute="class">
      <HeadGlobal />
      <GoogleAnalytics gaId="G-J8Z0TLCKLJ" />
      <GoogleAdsense pId="7043042177746049" />
      <Component key={router.asPath} {...pageProps} />
    </ThemeProvider>
  )
}
export default MyApp
