import { LCDClient } from "@terra-money/terra.js"
import { getClient } from "lib/utils/getClient"
import { NextApiRequest, NextApiResponse } from "next"

const BATCH_SIZE = 25

export type AllTokensResponse = {
  success: boolean
  tokens?: string[]
  error?: string
}

async function fetchTokens(lcd: LCDClient, contract_address: string) {
  const { count } = await lcd.wasm.contractQuery(contract_address, { num_tokens: {} }) 
  const iters = Math.ceil(count / BATCH_SIZE)
  
  let all_tokens: string[] = []
  let last_token = undefined

  for (let i=0; i<iters; i++) {
    console.log(`Loading tokens ${i*BATCH_SIZE+1}-${(i+1)*BATCH_SIZE}`)
    const { tokens } = (await lcd.wasm.contractQuery(contract_address, { all_tokens: { limit: BATCH_SIZE, start_after: last_token } })) as { tokens: string[] }
    all_tokens = all_tokens.concat(tokens)
    last_token = tokens.slice(-1)[0]
  }
  
  return all_tokens
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AllTokensResponse>
) {
  if (req.method === 'GET') {
    const { chainId, contract_address } = req.body
    if (!['bombay-12', 'columbus-5'].includes(chainId)) {
      res.status(500).json({ success: false, error: "Invalid value for chainId"})
    }
    if (typeof contract_address !== 'string') {
      res.status(500).json({ success: false, error: "Invalid value for contract_address"})
    }
    const lcd = await getClient(chainId)
    const allTokens = await fetchTokens(lcd, contract_address)
    res.status(200).json({ success: true, tokens: allTokens })
  }
  res.status(404).json({ success: false, error: 'NOT FOUND' })
}