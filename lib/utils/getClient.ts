import { LCDClient } from '@terra-money/terra.js'

export const getClient = async (chainId: string): Promise<LCDClient> => {
  let url: string

  switch (chainId) {
    case 'columbus-5':
      url = 'https://lcd.terra.dev'
      break
    case 'bombay-12':
      url = 'https://bombay-lcd.terra.dev'
      break
    case 'local':
      url = 'http://localhost:1317'
      break
    default:
      console.log("Invalid value for 'env'")
      console.log('Using values for local')
      url = 'http://localhost:1317'
      break
  }

  const client = new LCDClient({
    URL: url,
    chainID: chainId
  })

  return client
}