// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { BitcoinNetworkType, ChainConfig, ErrorCode } from 'constant'
import type { NextApiRequest, NextApiResponse } from 'next'
import { hexlify, Transaction } from 'ethers'
import * as bitcoin from 'bitcoinjs-lib'
import * as ecc from 'tiny-secp256k1'
bitcoin.initEccLib(ecc)

type ResponseData = {
  errorCode: number
  result: any
  errorMsg: string
}

export default function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const content = req.body
  const chain = content['chain']
  const tx = content['tx']
  try {
    var response = parseTransaction(chain, tx)
    jsonSuccessResponse(response, res)
  } catch (e) {
    jsonErrorResponse(e.message, res)
  }
}

function jsonSuccessResponse(object: object, res: NextApiResponse<ResponseData>) {
  res.status(200).json({ errorCode: ErrorCode.Success, result: object, errorMsg: '' })
}

function jsonErrorResponse(errorMsg: string, res: NextApiResponse<ResponseData>) {
  res.status(200).json({ errorCode: ErrorCode.Error, result: {}, errorMsg: errorMsg })
}

function parseTransaction(chain: string, tx: string): object {
  switch (chain) {
    case ChainConfig.Bitcoin:
      return parseBitcoinTransaction(tx, BitcoinNetworkType.MainNet)
    case ChainConfig.BitcoinRegTest:
      return parseBitcoinTransaction(tx, BitcoinNetworkType.RegTest)
    case ChainConfig.BitcoinTestNet:
      return parseBitcoinTransaction(tx, BitcoinNetworkType.TestNet)
    case ChainConfig.ETH:
      return parseEvmTx(tx)
    default:
      throw Error(`unknow chain type: ${chain}`)
  }
}

function parseEvmTx(txString: string) {
  var tx = Transaction.from(txString)
  return {
    type: tx.type,
    chainId: tx.chainId.toString(),
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    nonce: tx.nonce.toString(),
    gasLimit: tx.gasLimit.toString(),
    gasPrice: tx.gasPrice?.toString(),
    maxFeePerGas: tx.maxFeePerGas?.toString(),
    maxPriorityFeePerGas: tx.maxPriorityFeePerGas?.toString(),
    publicKey: tx.fromPublicKey,
    v: tx.signature.v,
    r: tx.signature.r,
    s: tx.signature.s,
    value: tx.value?.toString(),
    data: tx.data,
    blobs: tx.blobs?.toString(),
    accessList: tx.accessList?.toString(),
  }
}

function getBitcoinNetworkByFlag(networkFlag: number): bitcoin.Network {
  switch (networkFlag) {
    case BitcoinNetworkType.MainNet:
      return bitcoin.networks.bitcoin
    case BitcoinNetworkType.TestNet:
      return bitcoin.networks.testnet
    case BitcoinNetworkType.RegTest:
      return bitcoin.networks.regtest
    default:
      throw Error(`unknow networkFlag ${networkFlag}`)
  }
}

function parseBitcoinTransaction(txString: string, networkFlag: number) {
  console.log(`network ${networkFlag}`)
  var network = getBitcoinNetworkByFlag(networkFlag)
  var resRaw = bitcoin.Transaction.fromHex(txString)
  var inputs = []
  resRaw.ins.forEach((item, index) => {
    var input = {} as any
    input.hash = hexlify(item.hash.reverse())
    input.index = item.index
    input.sequence = item.sequence
    input.witness = []
    input.script = hexlify(item.script)
    item.witness.forEach((w, i) => {
      input.witness.push(hexlify(w))
    })
    inputs.push(input)
  })
  var outputs = []
  resRaw.outs.forEach((item, index) => {
    console.log(hexlify(item.script))
    var output = {} as any
    output.value = item.value.toString()
    output.script = hexlify(item.script)
    output.address = bitcoin.address.fromOutputScript(item.script, network)
    outputs.push(output)
  })
  var result = {
    hash: resRaw.getId(),
    version: resRaw.version,
    inputs: inputs,
    outputs: outputs,
    locktime: resRaw.locktime,
    virtualSize: resRaw.virtualSize(),
    vin_size: resRaw.ins.length,
    vout_size: resRaw.outs.length,
    size: resRaw.byteLength(),
    total_output: resRaw.outs.reduce((prev, item) => prev + parseInt(item.value.toString()), 0),
  }
  return result
}
