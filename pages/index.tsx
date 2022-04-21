import React, { useEffect } from 'react'
import Image from 'next/image'

import {
  useWallet,
  useConnectedWallet,
  ConnectType,
  ConnectedWallet
} from '@terra-money/wallet-provider'

import { FAQ } from 'components/FAQ'
import { Mint } from 'components/Mint'

import { toast, ToastContainer } from 'react-toastify'
import { CacheContent } from 'lib/types'
import { mint } from 'lib/utils/mint'
import router from 'next/router'

import { title } from '../public/frontend-config.json'
import cacheContent from '../lib/cache.json'
import { getClient } from 'lib/utils/getClient'
import { LCDClient } from '@terra-money/terra.js'
import { MyTokens } from 'components/MyTokens'
import api from 'lib/utils/api-client'


const loadNumTokens = async (setter: any) => {
  api.get('numTokens', { 
    chainId: cacheContent.chain_id,
    contract_address: cacheContent.contract_addr,
  })
  .then((res) => res.json())
  .then(setter)
  .catch((error) => {
    console.error(error)
  })
}

const loadMyTokens = async (owner: string, setter: any) => {
  api.get('numTokens', { 
    chainId: cacheContent.chain_id,
    contract_address: cacheContent.contract_addr,
    owner: owner,
  })
  .then((res) => res.json())
  .then(setter)
  .catch((error) => {
    console.error(error)
  })
}

export default function Index() {
  const { connect } = useWallet()
  const [tokensLoaded, setTokensLoaded] = React.useState<number | undefined>(undefined)
  const [myTokens, setMyTokens] = React.useState<string[]>([])
  const connectedWallet = useConnectedWallet()

  useEffect(() => {
    const loadTokens = async (_connectedWallet: ConnectedWallet) => {
      try {
        const lcd = await getClient(_connectedWallet.network.chainID || 'columbus-5')
        loadNumTokens(setTokensLoaded)
        loadMyTokens(_connectedWallet.walletAddress, setMyTokens)
      } catch (error) {
        console.log("Error while loading tokens...")
        console.log(error)
      }
      
    }
    if (typeof tokensLoaded === 'undefined' && typeof connectedWallet !== 'undefined') {
      loadTokens(connectedWallet)
    }
  }, [connectedWallet])

  const handleClickMint = async (mintCount: number) => {
    if (!connectedWallet) {
      toast.warn('Please connect wallet')
    }
    if (typeof tokensLoaded !== 'undefined') {
      const token_ids = await toast.promise(
        mint(connectedWallet, cacheContent as CacheContent, mintCount),
        {
          pending: "Minting token(s)...",
          success: "Token(s) minted!",
          error: "Could not mint token(s)"
        }
      )
      console.log('Minted', token_ids)

      if (typeof token_ids !== 'undefined') {
        setMyTokens(myTokens.concat(token_ids))
        router.push(`/#my_tokens`)
      }
    }
  }

  return (
    <div
      className='py-12'
      style={{
        // backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
      }}
    >
      <ToastContainer
        position='top-right'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
      />
      <div className='bg-white max-w-xl mx-auto rounded-3xl shadow-2xl px-5 py-12'>
        <div className='flex flex-col items-center justify-center space-y-12'>
          <h2 className='text-center text-3xl font-extrabold text-gray-900 sm:text-4xl'>
            { title }
          </h2>

          <div>
            <Image
              className='rounded-xl'
              src='/img.png'
              height='300'
              width='300'
              alt='Blurred room image'
            />
          </div>

          {connectedWallet?.connectType !== ConnectType.EXTENSION ? (
            <button
              className='mintButton inline-flex items-center px-6 py-3 border border-transparent text-xl font-medium rounded-2xl shadow-sm text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              onClick={() => connect(ConnectType.EXTENSION)}
            >
              Connect!
            </button>
          ) : (
            <>
              <Mint 
                disabled={typeof tokensLoaded === 'undefined'}
                mintCallback={handleClickMint} 
                mintCost={parseFloat(cacheContent.config.price.amount)/1_000_000}
                tokensMinted={tokensLoaded || 0}
                tokenSupply={cacheContent.config.max_token_count}
              />
              { myTokens.length > 0 && <MyTokens tokensOwned={myTokens} /> }
            </>
          )}

          <FAQ />

        </div>
      </div>
    </div>
  )
}
