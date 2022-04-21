import { getClient } from "lib/utils/getClient"
import { NextApiRequest, NextApiResponse } from "next"

export type NumTokensResponse = {
  success: boolean
  count?: number
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NumTokensResponse>
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
    const { count } = await lcd.wasm.contractQuery(contract_address, { num_tokens: {} }) 
    res.status(200).json({ success: true, count: count })
  }
}