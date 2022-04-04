import { useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import {
  ConnectType,
  useWallet,
  WalletStatus
} from '@terra-money/wallet-provider'

import { getFiles } from './utils/ipfs'

function CIDPage() {
  const [cid, setCid] = useState<string | undefined>()
  const { status, connect } = useWallet()
  const navigate = useNavigate()

  const submitCid = async () => {
    if (typeof cid === 'undefined') {
      toast.warn('Please enter a valid CID from IPFS')
      return
    }
    // const toastLoadingId = toast.loading('Getting token data...')
    toast.promise(
      getFiles(cid),
      {
        pending: 'Fetching IPFS files...',
        success: 'IPFS fetch succeeded!',
        error: 'Error while fetching IPFS files :('
      }
    ).then(_ => navigate('/config'))
  }

  return (
    <div
      className='flex items-center justify-center py-12'
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        minHeight: '100vh',
        width: '100%'
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
      <div className='flex-grow bg-white max-w-xl w-max rounded-3xl shadow-2xl px-5 py-12'>
        <div className='flex flex-col items-center justify-center space-y-4'>
          {status === WalletStatus.WALLET_NOT_CONNECTED ? (
            <div className='flex flex-col items-center justify-center space-y-4'>
              <div className='items-center justify-center'>
                <button
                  className='mr-0 items-center px-6 py-3 border border-transparent text-xl font-medium rounded-2xl shadow-sm text-white bg-blue-700 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  onClick={() => connect(ConnectType.EXTENSION)}
                >
                  Connect Wallet
                </button>
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center space-y-8'>
              <div className='flex flex-col items-center justify-center'>
                <h2 className='font-bold text-center text-3xl text-blue-700'>
                  {'Getting Started'}
                </h2>

                <p className='text-base text-center text-gray-700 mt-2'>
                  {'Paste the IPFS CID for your assets below to get started!'}
                </p>
              </div>

              <input
                type='text'
                className='input inline-flex px-3 py-3 w-max-3xl w-9/12 border border-blue-700 text-l rounded-xl shadow-sm'
                placeholder='IPFS CID'
                onChange={(e) => setCid(e.currentTarget.value)}
              />

              <button
                className='inline-flex items-center px-6 py-3 border border-transparent text-xl font-medium rounded-2xl shadow-sm text-white bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                onClick={() => submitCid()}
              >
                Sync!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CIDPage
