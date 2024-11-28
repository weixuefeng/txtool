import styles from 'styles/Home.module.scss'
import { SkipLink } from 'components/Links'
import { Header } from 'components/Header/Header'
import { Footer } from 'components/Footer'
import { Textarea } from '@headlessui/react'

export default function Home() {
  return (
    <div className={styles.container}>
      <SkipLink href="#main" text="Skip to main" />
      <Header />
      <Main />
      <Footer />
    </div>
  )
}

function Main() {
  return (
    <main className={styles.main} id="main">
      <SkipLink href="#footer" text="Skip to footer" />
      <article className="prose dark:prose-invert md:prose-lg lg:prose-xl">
        <h1>Decode Your Transaction</h1>
        <Textarea name="description"></Textarea>
      </article>
    </main>
  )
}
