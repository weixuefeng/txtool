// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ErrorCode } from 'constant'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Transaction } from 'ethers'

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
    var response = parseEvmTx(tx)
    jsonSuccessResponse(response, res)
  } catch (e) {
    jsonErrorResponse(e.message, res)
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

function jsonSuccessResponse(object: object, res: NextApiResponse<ResponseData>) {
  res.status(200).json({ errorCode: ErrorCode.Success, result: object, errorMsg: '' })
}

function jsonErrorResponse(errorMsg: string, res: NextApiResponse<ResponseData>) {
  res.status(200).json({ errorCode: ErrorCode.Error, result: {}, errorMsg: errorMsg })
}
