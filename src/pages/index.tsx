import { SkipLink } from 'components/Links'
import { Header } from 'components/Header/Header'
import { Footer } from 'components/Footer'
import { Button, Description, Field, Label, Textarea, Select } from '@headlessui/react'
import clsx from 'clsx'
import { submitRawTx } from 'network'
import { useState } from 'react'
import { SupportChains } from 'constant'
import { LoadingView } from 'components/Loading/LoadingView'

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
        <h1>Hello World</h1>
      </div>
    </main>
  )
}
