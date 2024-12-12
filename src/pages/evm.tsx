import { Header } from 'components/Header/Header'
import { Footer } from 'components/Footer'
import { Button, Input, Field, Label, Description } from '@headlessui/react'
import clsx from 'clsx'
import { useState } from 'react'
import { LoadingView } from 'components/Loading/LoadingView'
import { ethers } from 'ethers'
import i18next from 'i18next'

class InputItem {
  name: string
  description: string

  constructor(name: string, description: string) {
    this.name = name
    this.description = description
  }
}

export default function EvmPage() {
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
        <EvmActionArea />
      </div>
    </main>
  )
}

function EvmActionArea() {
  const [isOpenLoading, setIsOpenLoading] = useState<boolean>(false)
  const [rpc, setRpc] = useState<ethers.JsonRpcProvider>()

  const handleInputChange = event => {
    var provider = new ethers.JsonRpcProvider(event.target.value)
    setRpc(provider)
  }

  return (
    <div className="w-full px-4">
      <div className="flex flex-col ">
        <p>0. Input Your Rpc Endpoint</p>
        <Input className={'mt-2'} placeholder="https://infura.io/xxxxx" onInput={handleInputChange} />
      </div>

      <div className="mt-6"></div>

      <ActionItem
        title="1. eth_chainId"
        items={undefined}
        execute={callback => {
          if (rpc == undefined) {
            callback('Please Input Rpc Endpoint')
            return
          }
          setIsOpenLoading(true)
          rpc
            .getNetwork()
            .then(res => {
              callback(JSON.stringify(res))
            })
            .catch(error => {
              callback(error.toString())
            })
            .finally(() => {
              setIsOpenLoading(false)
            })
        }}
      />

      <ActionItem
        title="2. getBalance"
        items={[new InputItem(i18next.t('FromAddress'), i18next.t('InputFromAddress'))]}
        execute={(callback, address) => {
          if (rpc == undefined) {
            callback('Please Input Rpc Endpoint')
            return
          }
          setIsOpenLoading(true)
          rpc
            .getBalance(address)
            .then(res => {
              callback(res.toString())
            })
            .catch(error => {
              callback(error.toString())
            })
            .finally(() => {
              setIsOpenLoading(false)
            })
        }}
      />

      <ActionItem
        title="3. getTokenBalance"
        items={[
          new InputItem(i18next.t('FromAddress'), i18next.t('InputFromAddress')),
          new InputItem(i18next.t('TokenAddress'), i18next.t('InputTokenAddress')),
        ]}
        execute={(callback, address, tokenAddress) => {
          if (rpc == undefined) {
            callback('Please Input Rpc Endpoint')
            return
          }
          setIsOpenLoading(true)
          var prefix = ethers.keccak256(ethers.toUtf8Bytes('balanceOf(address)')).substring(0, 10)
          var info = ethers.AbiCoder.defaultAbiCoder().encode(['address'], [address])
          var data = prefix + info.substring(2)
          console.log(data)
          rpc
            .call({
              to: tokenAddress,
              data: data,
            })
            .then(res => {
              callback(parseInt(res).toString())
            })
            .catch(error => {
              callback(error.toString())
            })
            .finally(() => {
              setIsOpenLoading(false)
            })
        }}
      />
      <ActionItem
        title={4 + '. ' + i18next.t('GetEip11555TokenBalance')}
        items={[
          new InputItem(i18next.t('FromAddress'), i18next.t('InputFromAddress')),
          new InputItem('TokenId', 'Input Token Id'),
          new InputItem(i18next.t('TokenAddress'), i18next.t('InputTokenAddress')),
        ]}
        execute={(callback, address, id, tokenAddress) => {
          if (rpc == undefined) {
            callback('Please Input Rpc Endpoint')
            return
          }
          setIsOpenLoading(true)
          var prefix = ethers.keccak256(ethers.toUtf8Bytes('balanceOf(address,uint256)')).substring(0, 10)
          console.log(prefix)
          var info = ethers.AbiCoder.defaultAbiCoder().encode(['address', 'uint256'], [address, id])
          var data = prefix + info.substring(2)
          rpc
            .call({
              to: tokenAddress,
              data: data,
            })
            .then(res => {
              callback(parseInt(res).toString())
            })
            .catch(error => {
              callback(error.toString())
            })
            .finally(() => {
              setIsOpenLoading(false)
            })
        }}
      />

      <ActionItem
        title="5. eth_gasPrice"
        items={undefined}
        execute={callback => {
          if (rpc == undefined) {
            callback('Please Input Rpc Endpoint')
            return
          }
          setIsOpenLoading(true)
          rpc
            .getFeeData()
            .then(res => {
              callback(JSON.stringify(res))
            })
            .catch(error => {
              callback(error.toString())
            })
            .finally(() => {
              setIsOpenLoading(false)
            })
        }}
      />

      <ActionItem
        title={6 + '. ' + i18next.t('BroadCastTranaction')}
        items={[new InputItem(i18next.t('RawTransaction'), i18next.t('InputRawTranaction'))]}
        execute={(callback, rawTransaction) => {
          if (rpc == undefined) {
            callback('Please Input Rpc Endpoint')
            return
          }
          setIsOpenLoading(true)
          rpc
            .broadcastTransaction(rawTransaction)
            .then(res => {
              callback(JSON.stringify(res))
            })
            .catch(error => {
              callback(error.toString())
            })
            .finally(() => {
              setIsOpenLoading(false)
            })
        }}
      />

      <LoadingView isOpen={isOpenLoading} close={() => setIsOpenLoading(false)} />
    </div>
  )
}

function ActionItem(props: { title: string; items: InputItem[] | undefined; execute: (...args: any) => void }) {
  const { title, items, execute } = props
  const [result, setResult] = useState<string | undefined>(undefined)
  const [param1, setParam1] = useState<string>()
  const [param2, setParam2] = useState<string>()
  const [param3, setParam3] = useState<string>()

  const handleInputChange0 = event => {
    setParam1(event.target.value)
  }

  const handleInputChange1 = event => {
    setParam2(event.target.value)
  }

  const handleInputChange2 = event => {
    setParam3(event.target.value)
  }

  function getFuncName(index: number) {
    switch (index) {
      case 0:
        return handleInputChange0
      case 1:
        return handleInputChange1
      case 2:
        return handleInputChange2
    }
  }

  function handleResult(result: string) {
    setResult(result)
  }

  const handleSubmit = () => {
    execute(handleResult, param1, param2, param3)
  }

  return (
    <div className="mt-4 flex flex-col">
      <p>
        {title}: {result}
      </p>
      {items &&
        items.map((item, index) => {
          return (
            <Field as="div" key={item.name}>
              <Label className="text-sm/6 font-medium ">{item.name}</Label>
              <Description className="text-sm/6 ">{item.description}</Description>
              <Input
                onInput={getFuncName(index)}
                className={clsx(
                  'mt-3 block w-full rounded-lg border-2 px-3 py-1.5 text-sm/6',
                  'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
                )}
              />
            </Field>
          )
        })}
      <Button onClick={handleSubmit} className={'submit'}>
        {i18next.t('Execute')}
      </Button>
    </div>
  )
}

function BaseActionArea() {
  const [isOpenLoading, setIsOpenLoading] = useState<boolean>(false)

  return (
    <div className="w-full px-4">
      <div className="flex flex-col"></div>
      <LoadingView isOpen={isOpenLoading} close={() => setIsOpenLoading(false)} />
    </div>
  )
}
