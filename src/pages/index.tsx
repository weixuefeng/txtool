import { SkipLink } from 'components/Links'
import { Header } from 'components/Header/Header'
import { Footer } from 'components/Footer'
import { Button, Description, Field, Label, Textarea, Select } from '@headlessui/react'
import clsx from 'clsx'
import { submitRawTx } from 'network'
import { useState } from 'react'
import { SupportChains } from 'constant'

export default function Home() {
  return (
    <div className={'main'}>
      <SkipLink href="#main" text="Skip to main" />
      <Header />
      <Main />
      <Footer />
    </div>
  )
}

function Main() {
  return (
    <main className={'container py-20'} id="main">
      <div className="flex w-full flex-col items-center">
        <h1>Decode Your Transaction</h1>
        <ActionArea />
      </div>
    </main>
  )
}

function ActionArea() {
  const [rawTx, setRawTx] = useState<string>()
  const [parsedTx, setPrasedTx] = useState<object>()
  const [currentChain, setCurrentChain] = useState<string>(SupportChains[0])

  const handleInputChange = event => {
    console.log(event.target.value)
    setRawTx(event.target.value)
  }

  const handleSelectChain = event => {
    setCurrentChain(event.target.value)
  }

  const handleSubmitTx = () => {
    submitRawTx(currentChain, rawTx)
      .then(res => {
        setPrasedTx(res)
      })
      .catch((error: Error) => {
        console.log(error.message)
      })
  }

  return (
    <div className="w-full px-4">
      <Field>
        <Label className="text-sm/6 font-medium">Description</Label>
        <Description className="text-sm/6">This will be shown under the product title.</Description>
        <Field>
          <Label className="block">SelectChain</Label>
          <Select onChange={handleSelectChain} className="mt-1 block" name="country">
            {SupportChains &&
              SupportChains.map(item => {
                return <option key={item}>{item}</option>
              })}
          </Select>
        </Field>

        <Textarea
          onInput={handleInputChange}
          className={clsx(
            'mt-3 block min-h-40 w-full resize-none rounded-lg border-2 border-black bg-white/5 px-3 py-1.5 text-xl',
            'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
          )}
          rows={3}
        />
      </Field>
      <Button
        onClick={handleSubmitTx}
        className="ounded mt-5 bg-sky-600 px-4 py-2 text-sm text-white data-[active]:bg-sky-700 data-[hover]:bg-sky-500"
      >
        submit
      </Button>
      {parsedTx && (
        <Textarea
          disabled={true}
          className={clsx(
            'prose mt-3 block min-h-80 w-full rounded-lg border-2 border-black bg-white/5 px-3 py-1.5 text-xl lg:prose-xl',
            'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
          )}
          unselectable="off"
          value={JSON.stringify(parsedTx)}
        />
      )}
    </div>
  )
}
