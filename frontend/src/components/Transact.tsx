import { algo, AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface TransactInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const Transact = ({ openModal, setModalState }: TransactInterface) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [receiverAddress, setReceiverAddress] = useState<string>('')

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({ algodConfig })

  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const handleSubmitAlgo = async () => {
    setLoading(true)

    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Please connect wallet first', { variant: 'warning' })
      return
    }

    try {
      enqueueSnackbar('Sending transaction...', { variant: 'info' })
      const result = await algorand.send.payment({
        signer: transactionSigner,
        sender: activeAddress,
        receiver: receiverAddress,
        amount: algo(1),
      })
      enqueueSnackbar(`Transaction sent: ${result.txIds[0]}`, { variant: 'success' })
      setReceiverAddress('')
    } catch (e) {
      enqueueSnackbar('Failed to send transaction', { variant: 'error' })
    }

    setLoading(false)
  }

  const isValidAddress = receiverAddress.length === 58

  return (
    <dialog
      id="transact_modal"
      className={`modal ${openModal ? 'modal-open' : ''}`}
    >
      <div className="modal-box bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Send Payment
          </h3>
          <button
            type="button"
            onClick={() => setModalState(false)}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Recipient Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            data-test-id="receiver-address"
            placeholder="Enter Algorand wallet address"
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition
              ${
                receiverAddress.length === 0
                  ? 'border-gray-300 focus:ring-2 focus:ring-indigo-500'
                  : isValidAddress
                  ? 'border-green-400 focus:ring-2 focus:ring-green-400'
                  : 'border-red-400 focus:ring-2 focus:ring-red-400'
              }
            `}
          />
          {receiverAddress.length > 0 && !isValidAddress && (
            <p className="text-xs text-red-500 mt-1">
              Address must be 58 characters long
            </p>
          )}
        </div>

        {/* Amount Display */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Amount
          </label>
          <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-medium">
            1 ALGO
          </div>
        </div>

        {/* Success Message Area Placeholder */}
        <div className="min-h-[24px] mb-4 text-sm text-green-600 text-center">
          {/* Snackbar handles success, this is reserved area for clean layout */}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            data-test-id="send-algo"
            onClick={handleSubmitAlgo}
            disabled={!isValidAddress || loading}
            className={`w-full py-3 rounded-xl font-medium text-white transition
              ${
                !isValidAddress || loading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'
              }
            `}
          >
            {loading ? (
              <span className="loading loading-spinner" />
            ) : (
              'Send 1 ALGO'
            )}
          </button>

          <button
            type="button"
            onClick={() => setModalState(false)}
            className="w-full py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default Transact
