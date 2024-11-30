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
      <div className="flex w-full flex-col items-center">
        <h1>Decode Your Transaction</h1>
        <ActionArea />
      </div>
    </main>
  )
}

function ActionArea() {
  const [isOpenLoading, setIsOpenLoading] = useState<boolean>(false)
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
    setIsOpenLoading(true)
    submitRawTx(currentChain, rawTx)
      .then(res => {
        setPrasedTx(res)
      })
      .catch((error: Error) => {
        setPrasedTx({ error: error.message })
      })
      .finally(() => {
        setIsOpenLoading(false)
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
            'mt-3 block h-[1100px] w-full resize-none overflow-hidden rounded-lg border-2 border-black bg-white/5 px-3 py-1.5 text-xl',
            'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
          )}
          unselectable="off"
          value={JSON.stringify(parsedTx, null, 4)}
        />
      )}
      <LoadingView isOpen={isOpenLoading} close={() => setIsOpenLoading(false)} />
    </div>
  )
}
