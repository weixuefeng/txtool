import { Header } from 'components/Header/Header'
import { Footer } from 'components/Footer'
import { Routers } from 'constant'
import Link from 'next/link'

export default function Home() {
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
    <main className={'container py-20'} id="main">
      <div className="flex h-[600px] w-full flex-col items-center">
        {Routers &&
          Routers.map((item, index) => (
            <Link href={item.path} key={index}>
              {item.name}
            </Link>
          ))}
      </div>
    </main>
  )
}
