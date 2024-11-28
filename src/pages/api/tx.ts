// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ErrorCode } from 'constant'
import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = {
  errorCode: number
  result: any
  errorMsg: string
}

export default function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const content = req.body
  const chain = content['chain']
  const tx = content['tx']
  const response = {
    txid: 'nihao',
  }
  jsonSuccessResponse(response, res)
}

function jsonSuccessResponse(object: object, res: NextApiResponse<ResponseData>) {
  res.status(200).json({ errorCode: ErrorCode.Success, result: object, errorMsg: '' })
}

function jsonErrorResponse(errorMsg: string, res: NextApiResponse<ResponseData>) {
  res.status(200).json({ errorCode: ErrorCode.Error, result: {}, errorMsg: errorMsg })
}
