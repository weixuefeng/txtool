import i18next from 'i18next'

export const ErrorCode = {
  Success: 1,
  Error: 0,
}

export const BitcoinNetworkType = {
  MainNet: 0,
  TestNet: 1,
  RegTest: 2,
}

export const ChainConfig = {
  ETH: 'ETH',
  Bitcoin: 'Bitcoin',
  BitcoinTestNet: 'BitcoinTest',
  BitcoinRegTest: 'BitcoinRegTest',
  Solana: 'Solana',
}

export const SupportChains = [
  ChainConfig.ETH,
  ChainConfig.Bitcoin,
  ChainConfig.BitcoinTestNet,
  ChainConfig.BitcoinRegTest,
  ChainConfig.Solana,
]

export const EncodeType = {
  Base64ToHex: 'Base64ToHex',
  HexToBase64: 'HexToBase64',
  Base58ToHex: 'Base58ToHex',
  HexToBase58: 'HexToBase58',
  Base64ToBase58: 'Base64ToBase58',
  Base58ToBase64: 'Base58ToBase64',
  HexToString: 'HexToString',
  StringToHex: 'StringToHex',
  IntArrayToHex: 'IntArrayToHex',
  HexIntArrayToHex: 'HexIntArrayToHex',
  HexToIntArray: 'HexToIntArray',
}

export const SupportEncodeTypes = [
  EncodeType.Base64ToHex,
  EncodeType.HexToBase64,
  EncodeType.Base58ToHex,
  EncodeType.HexToBase58,
  EncodeType.Base64ToBase58,
  EncodeType.Base58ToBase64,
  EncodeType.HexToString,
  EncodeType.StringToHex,
  EncodeType.IntArrayToHex,
  EncodeType.HexToIntArray,
  EncodeType.HexIntArrayToHex,
]

export const Router = {
  Home: '/',
  Decode: '/decode',
  Evm: '/evm',
  Encode: '/encode',
}

class RouterInfo {
  name: string
  path: string
  constructor(name: string, path: string) {
    this.name = name
    this.path = path
  }
}

export const Routers = [
  new RouterInfo(i18next.t('Home'), Router.Home),
  new RouterInfo(i18next.t('DecodeTx'), Router.Decode),
  new RouterInfo(i18next.t('EvmTools'), Router.Evm),
  new RouterInfo(i18next.t('EncodeTools'), Router.Encode),
]
