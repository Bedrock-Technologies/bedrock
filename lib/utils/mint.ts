import { getClient } from './getClient'
import { CacheContent, Metadata } from 'lib/types'
import { MintMsg } from '../../packages/cli/src/lib/types'
import { Coin, isTxError, MsgExecuteContract } from '@terra-money/terra.js'
import { create } from 'ipfs-http-client'
import {
  concat as uint8ArrayConcat,
  toString as uint8ArrayToString
} from 'uint8arrays'

export const mint = async (
  wallet: any, 
  cacheContent: CacheContent, 
  count: number,
  tokens: string[]
) => {
  if (cacheContent.contract_addr == '') return
  if (cacheContent.assets.length == 0) return
  if (cacheContent.chain_id == '') return

  // Load wallet & LCD client
  const lcd = await getClient(cacheContent.chain_id)

  console.log()

  // Select our NFT to mint
  const newAssets = cacheContent.assets.filter(
    (asset) => !tokens.includes(asset.split('.')[0])
  )

  // TODO: Randomize order

  if (newAssets.length < count) {
    console.log('No NFTs left to mint :(')
    return
  }

  if (cacheContent.contract_addr === '') return

  const execMsgs = []
  for (let i=0; i<count; i++) {
    const assetJson = `${newAssets[i].split('.')[0]}.json`
    const ipfsPath = `/ipfs/${cacheContent.cid}/${assetJson}`

    const mintMsg: MintMsg = {
      token_id: newAssets[i].split('.')[0],
      owner: wallet.walletAddress,
      token_uri: ipfsPath,
      extension: undefined,
    }

    const execMsg = { mint: mintMsg }
    execMsgs.push(
      new MsgExecuteContract(
        wallet.walletAddress,
        cacheContent.contract_addr,
        execMsg,
        [new Coin(cacheContent.config.price.denom, cacheContent.config.price.amount)]
      )
    )
  }  

  const sign_res = await wallet.sign({ msgs: execMsgs })
  const executeTxResult = await lcd.tx.broadcast(sign_res.result)

  if (isTxError(executeTxResult)) {
    console.log('Mint failed.')
    throw new Error(
      `mint failed. code: ${executeTxResult.code}, codespace: ${executeTxResult.codespace}, raw_log: ${executeTxResult.raw_log}`
    )
  }

  // If we reach here, mint succeeded
  const {
    wasm: { token_id }
  } = executeTxResult.logs[0].eventsByType

  return token_id[0]
}

const getIPFSContents = async (path: string) => {
  const url = 'https://dweb.link/api/v0'
  const ipfs = create({ url })

  const bufs: Uint8Array[] = []
  for await (const buf of ipfs.cat(path)) {
    bufs.push(buf)
  }
  const data = uint8ArrayConcat(bufs)
  return uint8ArrayToString(data)
}
