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
}

export const SupportChains = [
  ChainConfig.ETH,
  ChainConfig.Bitcoin,
  ChainConfig.BitcoinTestNet,
  ChainConfig.BitcoinRegTest,
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
  new RouterInfo('Home', Router.Home),
  new RouterInfo('Decode Transaction', Router.Decode),
  new RouterInfo('Evm Tools', Router.Evm),
  new RouterInfo('Encode Tools', Router.Encode),
]
