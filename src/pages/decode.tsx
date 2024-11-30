import { Header } from 'components/Header/Header'
import { Footer } from 'components/Footer'
import { Button, Textarea, Select } from '@headlessui/react'
import clsx from 'clsx'
import { submitRawTx } from 'network'
import { useState } from 'react'
import { SupportChains } from 'constant'
import { LoadingView } from 'components/Loading/LoadingView'

export default function Decode() {
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
        <ActionArea />
      </div>
    </main>
  )
}

function Description() {
  return (
    <div className="flex flex-col">
      <h1>This page offers a transaction analysis feature. To use it, please follow these steps:</h1>
      <h2>1. Select the Blockchain: Choose the appropriate blockchain from the dropdown menu.</h2>
      <h2>2. Input the Raw Transaction: Enter the raw transaction data in the provided text box. </h2>
      <h2>3. Click the Submit Button: After entering the information, click the submit button.</h2>
      <h1>Once submitted, you will receive the original transaction data for further analysis.</h1>
    </div>
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
      <div className="flex flex-col">
        <div className="flex-row">
          <h1>1. Select Chain</h1>
        </div>
        <Select onChange={handleSelectChain} className="mt-4 block w-40" name="chain">
          {SupportChains &&
            SupportChains.map(item => {
              return <option key={item}>{item}</option>
            })}
        </Select>
      </div>

      <div className="flex flex-col pt-8">
        <div className="flex-row">
          <h1>2. Input Raw Transaction</h1>
        </div>
        <Textarea
          onInput={handleInputChange}
          className={clsx(
            'mt-3 block min-h-40 w-full resize-none rounded-lg border-2 border-black bg-white/5 px-3 py-1.5 text-xl',
            'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
          )}
          rows={3}
        />
      </div>

      <div className="flex flex-col pt-8">
        <div className="flex-row">
          <h1>3. Decode Tx</h1>
        </div>
        <Button
          onClick={handleSubmitTx}
          className="ounded mt-5 bg-sky-600 px-4 py-2 text-sm text-white data-[active]:bg-sky-700 data-[hover]:bg-sky-500"
        >
          Decode
        </Button>
      </div>

      {parsedTx && (
        <div className="flex flex-col pt-8">
          <div className="flex-row">
            <h1>4. DecodedTx</h1>
          </div>
          <Textarea
            disabled={true}
            className={clsx(
              'mt-3 block h-[1000px] w-full resize-none overflow-hidden rounded-lg border-2 border-gray-600  px-3 py-1.5 text-xl',
              'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
            )}
            unselectable="off"
            value={JSON.stringify(parsedTx, null, 4)}
          />
        </div>
      )}
      <LoadingView isOpen={isOpenLoading} close={() => setIsOpenLoading(false)} />
    </div>
  )
}
