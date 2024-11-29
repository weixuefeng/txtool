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
