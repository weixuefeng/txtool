import { Header } from 'components/Header/Header'
import { Footer } from 'components/Footer'
import Link from 'next/link'

export default function UsefulSitePage() {
  return (
    <div className={'main'}>
      <Header />
      <Main />
      <Footer />
    </div>
  )
}

function Main() {
  return (
    <main className={'container  py-4'} id="main">
      <div className="flex min-h-[600px] w-full flex-col">
        <UsefulArea />
      </div>
    </main>
  )
}

function UsefulArea() {
  return (
    <div className="w-full px-4">
      <div className="flex flex-col ">
        <SiteItem id={1} title={'Ed25519 sign & verify online'} url={'https://cyphr.me/ed25519_tool/ed.html'} />
        <SiteItem id={2} title={'Json format'} url={'https://json.cn'} />
        <SiteItem id={3} title={'Solana Document'} url={'https://solana.com/docs/rpc/http'} />
        <SiteItem id={4} title={'Mempool'} url={'https://mempool.space/'} />
      </div>
    </div>
  )
}

function SiteItem(props: { id: number; title: string; url: string }) {
  const { title, url, id } = props
  return (
    <Link target="_blank" href={url}>
      {id}. {title}: {url}
    </Link>
  )
}
