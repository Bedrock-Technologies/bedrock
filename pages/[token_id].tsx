import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import {
  useWallet,
  useConnectedWallet,
  WalletStatus
} from '@terra-money/wallet-provider'

import { Modal } from 'components/Modal'
import { NftInfoResponse, OwnerOf } from 'lib/types'
import cacheContent from '../lib/cache.json'
import { getClient } from '../lib/utils/getClient'

export default function Index() {
  const { status, availableConnections, connect, disconnect } = useWallet()
  const connectedWallet = useConnectedWallet()

  const [nftInfo, setNFTInfo] = React.useState<NftInfoResponse | null>(null)
  const [roomNo, setRoomNo] = React.useState<string | null>(null)
  const [showModal, setShowModal] = React.useState(false)

  const router = useRouter()
  const { token_id } = router.query

  const imageStyle = 'h-32 w-32 rounded-xl mx-auto mb-4'

  const toggleDisconnect = () => {
    setShowModal(!showModal)
  }

  const abbreviateWalletAddress = (address: string) => {
    return address.length > 12
      ? address.slice(0, 6) + '...' + address.slice(-4)
      : address
  }

  function renderImage() {
    if (!roomNo) return
    return (
      <Image
        alt='nft logo'
        src={`/images/${roomNo}.png`}
        height='400'
        width='400'
        className={imageStyle}
      />
    )
  }

  function render() {
    if (!roomNo) { // TODO: Add loading indicator here
      return (
        <>
          <h2>You are not the owner of this NFT!</h2>
          <p>You need to be the owner to view this</p>
        </>
      )
    }

    return <div className='my-6' style={{ height: 400, width: 400 }}>{renderImage()}</div>
  }

  useEffect(() => {
    async function fetchSetNFTData(tokenId: string) {
      try {
        if (typeof connectedWallet === 'undefined') return
        const lcd = await getClient(connectedWallet.network.chainID)
        const ownership = (await lcd.wasm.contractQuery<NftInfoResponse>(
          cacheContent.contract_addr,
          {
            owner_of: { token_id: tokenId }
          }
        )) as unknown as OwnerOf

        if (ownership.owner === connectedWallet.walletAddress) {
          setRoomNo(tokenId.split('-')[0])
          const nftInfo = await lcd.wasm.contractQuery<NftInfoResponse>(
            cacheContent.contract_addr,
            {
              nft_info: { token_id: tokenId }
            }
          )

          console.log("Nft Info", nftInfo)

          // Mock NFT metadata
          

          setNFTInfo(nftInfo)
        }
      } catch (error) {
        console.log(error)
      }
    }
    if (status === WalletStatus.WALLET_CONNECTED) {
      const tokenId = token_id as string
      fetchSetNFTData(tokenId)
    }
  }, [connectedWallet?.walletAddress, status, token_id])

  return (
    <div
    className='flex items-center justify-center py-12'
    style={{
      // backgroundImage: 'url(/background.png)',
      // backgroundSize: 'cover',
      // backgroundColor: 'black',
      height: '100%',
      width: '100%'
    }}
    >
      <div className='flex-grow bg-white max-w-xl max-h-xl w-max rounded-3xl shadow-2xl px-5 py-12'>
        <div className='flex flex-col items-center justify-center'>
          <div className='flex flex-col items-center justify-center'>
            <h2 className='font-bold text-3xl text-blue-700'>
              {nftInfo?.extension?.name || 'NFT View Page'}
            </h2>

            <p className='text-base text-gray-700'>
              {nftInfo?.extension?.description || ``}
            </p>
          </div>

          {status === WalletStatus.WALLET_NOT_CONNECTED && (
            <>
              <div>
                <Image
                  className='rounded-xl'
                  src='/LooniesGif.gif'
                  height='400'
                  width='400'
                  alt='LooniesGif'
                />
              </div>

              {availableConnections
                .filter((_) => _.type === 'EXTENSION')
                .map(({ type, name, icon, identifier = '' }) => (
                  <button
                    key={'connection-' + type + identifier}
                    className='inline-flex items-center px-6 py-3 text-blue-700 font-bold rounded-2xl border-2 border-blue-600 bg-white focus:outline-none '
                    onClick={() => connect(type, identifier)}
                  >
                    <Image
                      src={icon}
                      alt={name}
                      width='1em'
                      height='1em'
                      className='mr-2'
                    />
                    Connect Wallet
                  </button>
                ))}
            </>
          )}

          {status === WalletStatus.WALLET_CONNECTED && render()}
          <button
            className='items-center px-6 py-3 border border-transparent text-xl font-medium rounded-2xl shadow-sm text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            onClick={() => router.push('/')}
          >
            Back to mint
          </button>
        </div>
      </div>
    </div>
  )
}
