import { LCDClient } from "@terra-money/terra.js"
import { getClient } from "lib/utils/getClient"
import { NextApiRequest, NextApiResponse } from "next"

const BATCH_SIZE = 25

export type MyTokensResponse = {
  success: boolean
  tokens?: string[]
  error?: string
}

async function fetchTokens(lcd: LCDClient, contract_address: string, owner: string) {
  let myTokens: string[] = [];
  let last_token = undefined
  while (true) {
    const msg = { tokens: { limit: BATCH_SIZE, owner: owner, start_after: last_token } }
    try {
      const { tokens } = (await lcd.wasm.contractQuery(contract_address, msg)) as { tokens: string[] | undefined }
      if (typeof tokens === 'undefined') break
      if (tokens.length < BATCH_SIZE) {
        myTokens = myTokens.concat(tokens)
        break
      }
      last_token = tokens.slice(-1)[0]
      myTokens = myTokens.concat(tokens)
    } catch (error) { break }
  }
  
  return myTokens
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MyTokensResponse>
) {
  if (req.method === 'GET') {
    const { chainId, contract_address, owner } = req.body
    if (!['bombay-12', 'columbus-5'].includes(chainId)) {
      res.status(500).json({ success: false, error: "Invalid value for chainId"})
    }
    if (typeof contract_address !== 'string') {
      res.status(500).json({ success: false, error: "Invalid value for contract_address"})
    }
    if (typeof owner !== 'string') {
      res.status(500).json({ success: false, error: "Invalid value for contract_address"})
    }
    const lcd = await getClient(chainId)
    const allTokens = await fetchTokens(lcd, contract_address, owner)
    res.status(200).json({ success: true, tokens: allTokens })
  }
  res.status(404).json({ success: false, error: 'NOT FOUND' })
}