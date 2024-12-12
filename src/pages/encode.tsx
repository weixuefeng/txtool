import { Header } from 'components/Header/Header'
import { Footer } from 'components/Footer'
import { Button, Textarea, Select } from '@headlessui/react'
import clsx from 'clsx'
import { useState } from 'react'
import { EncodeType, SupportEncodeTypes } from 'constant'
import { LoadingView } from 'components/Loading/LoadingView'
import { decodeBase58, decodeBase64, encodeBase58, encodeBase64, getBytes, hexlify } from 'ethers'
import i18next from 'i18next'

export default function EncodePage() {
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
  const [parsedTx, setPrasedTx] = useState<string>()
  const [currentChain, setCurrentChain] = useState<string>(SupportEncodeTypes[0])

  const handleInputChange = event => {
    console.log(event.target.value)
    setRawTx(event.target.value)
  }

  const handleSelectChain = event => {
    setCurrentChain(event.target.value)
  }

  const handleSubmitTx = () => {
    try {
      switch (currentChain) {
        case EncodeType.Base64ToHex:
          setPrasedTx(hexlify(decodeBase64(rawTx)))
          break
        case EncodeType.HexToBase64:
          let code = rawTx.valueOf()
          if (!code.startsWith('0x')) {
            code = '0x' + code
          }
          setPrasedTx(encodeBase64(code))
          break
        case EncodeType.Base58ToHex:
          setPrasedTx(decodeBase58(rawTx).toString(16))
          break
        case EncodeType.HexToBase58:
          setPrasedTx(encodeBase58(Buffer.from(rawTx, 'hex')))
          break
        case EncodeType.Base64ToBase58:
          setPrasedTx(encodeBase58(decodeBase64(rawTx)))
          break
        case EncodeType.Base58ToBase64:
          let code2 = decodeBase58(rawTx).toString(16)
          if (!code2.startsWith('0x')) {
            code2 = '0x' + code2
          }
          setPrasedTx(encodeBase64(code2))
          break
        case EncodeType.HexToString:
          var decoder = new TextDecoder()
          setPrasedTx(decoder.decode(getBytes(rawTx)))
          break
        case EncodeType.StringToHex:
          var coder = new TextEncoder()
          var data = coder.encode(rawTx)
          setPrasedTx(hexlify(data))
          break
        default:
          setPrasedTx('current not support : ' + currentChain)
          break
      }
    } catch (error) {
      setPrasedTx(error.message)
    }
  }

  return (
    <div className="w-full px-4">
      <div className="flex flex-col">
        <div className="flex-row">
          <h1>1. {i18next.t('SelectEncodeType')}</h1>
        </div>
        <Select onChange={handleSelectChain} className="mt-4 block w-40" name="chain">
          {SupportEncodeTypes &&
            SupportEncodeTypes.map(item => {
              return <option key={item}>{item}</option>
            })}
        </Select>
      </div>

      <div className="flex flex-col pt-8">
        <div className="flex-row">
          <h1>2. {i18next.t('InputRawInfo')}</h1>
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
          <h1>3. {currentChain}</h1>
        </div>
        <Button onClick={handleSubmitTx} className="submit">
          {i18next.t('Execute')}
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
              'mt-3 block h-[1000px] w-full resize-none overflow-hidden rounded-lg border-2 border-gray-600  px-3 py-1.5 text-xl',
              'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
            )}
            unselectable="off"
            value={parsedTx}
          />
        </div>
      )}
      <LoadingView isOpen={isOpenLoading} close={() => setIsOpenLoading(false)} />
    </div>
  )
}
