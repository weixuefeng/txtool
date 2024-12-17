import { Header } from 'components/Header/Header'
import { Footer } from 'components/Footer'
import { Button, Textarea, Select } from '@headlessui/react'
import clsx from 'clsx'
import { submitRawTx } from 'network'
import { useState } from 'react'
import { SupportChains } from 'constant'
import { LoadingView } from 'components/Loading/LoadingView'
import 'i18next'
import i18next from 'i18next'

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
          <h1>1. {i18next.t('SelectChain')}</h1>
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
          <h1>2. {i18next.t('InputRawTranaction')}</h1>
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
          <h1>3. {i18next.t('DecodeTx')}</h1>
        </div>
        <Button onClick={handleSubmitTx} className="submit">
          {i18next.t('Decode')}
        </Button>
      </div>

      {parsedTx && (
        <div className="flex flex-col pt-8">
          <div className="flex-row">
            <h1>4. {i18next.t('Result')}</h1>
          </div>
          <Textarea
            disabled={true}
            className={clsx(
              'mt-3 block h-[1000px] w-full resize-none rounded-lg border-2 border-gray-600  px-3 py-1.5 text-xl',
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
