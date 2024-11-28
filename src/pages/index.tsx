import styles from 'styles/Home.module.scss'
import { SkipLink } from 'components/Links'
import { Header } from 'components/Header/Header'
import { Footer } from 'components/Footer'
import { Button, Description, Field, Label, Textarea } from '@headlessui/react'
import clsx from 'clsx'
import { submitRawTx } from 'network'
import { useState } from 'react'

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
        <ActionArea />
      </article>
    </main>
  )
}

function ActionArea() {
  const [rawTx, setRawTx] = useState<string>()

  const handleInputChange = event => {
    console.log(event.target.value)
    setRawTx(event.target.value)
  }

  const handleSubmitTx = () => {
    console.log(rawTx)
    submitRawTx('eth', rawTx)
      .then(res => {
        console.log(res)
      })
      .catch((error: Error) => {
        console.log(error.message)
      })
  }

  return (
    <div className="w-full max-w-md px-4">
      <Field>
        <Label className="text-sm/6 font-medium text-black">Description</Label>
        <Description className="text-sm/6 text-black/50">This will be shown under the product title.</Description>
        <Textarea
          onInput={handleInputChange}
          className={clsx(
            'mt-3 block w-full resize-none rounded-lg border-2 border-black bg-white/5 py-1.5 px-3 text-xl text-black ',
            'data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25 focus:outline-none'
          )}
          rows={3}
        />
      </Field>
      <Button
        onClick={handleSubmitTx}
        className="ounded data-[hover]:bg-sky-500 data-[active]:bg-sky-700 mt-5 bg-sky-600 py-2 px-4 text-sm text-white"
      >
        submit
      </Button>
    </div>
  )
}
