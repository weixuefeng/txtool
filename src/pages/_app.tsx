import 'styles/style.css'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { useRouter } from 'next/router'
import HeadGlobal from 'components/HeadGlobal'
import { GoogleAnalytics } from '@next/third-parties/google'
import { GoogleAdsense } from 'components/GoogleAdsense'
import 'i18n'
import { GA_PID, GAD_PID } from 'constant/settings'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  return (
    <ThemeProvider defaultTheme="system" attribute="class">
      <HeadGlobal />
      <GoogleAnalytics gaId={GA_PID} />
      <GoogleAdsense pId={GAD_PID} />
      <Component key={router.asPath} {...pageProps} />
    </ThemeProvider>
  )
}
export default MyApp
