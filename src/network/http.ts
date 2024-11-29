import axios from 'axios'
import { ErrorCode } from 'constant'

type ResponseData = {
  errorCode: number
  result: any
  errorMsg: string
}

const TX = 'api/tx'

function get(url: string) {
  return axios.get(url)
}

async function post(url: string, body: object | undefined) {
  var res = await axios.post(url, body)
  return parseResponse(res)
}

function parseResponse(response: axios.AxiosResponse<any, any>) {
  if (response.status === 200) {
    var res = response.data as ResponseData
    if (res.errorCode == ErrorCode.Success) {
      return res.result
    } else {
      throw new Error(res.errorMsg)
    }
  } else {
    return { error: response.statusText, code: response.status }
  }
}

export function submitRawTx(chain: string = 'eth', tx: string) {
  return post(TX, { chain: chain, tx: tx })
}
