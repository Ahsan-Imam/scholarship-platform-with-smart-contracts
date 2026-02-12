import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useMemo, useState } from 'react'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface CreateASAProps {
  openModal: boolean
  closeModal: () => void
}

const CreateASA = ({ openModal, closeModal }: CreateASAProps) => {
  const { activeAddress, transactionSigner } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [name, setName] = useState('MyToken')
  const [unit, setUnit] = useState('MTK')
  const [decimals, setDecimals] = useState('6')
  const [total, setTotal] = useState('1000000')
  const [loading, setLoading] = useState(false)

  const algorand = useMemo(() => {
    const algodConfig = getAlgodConfigFromViteEnvironment()
    const client = AlgorandClient.fromConfig({ algodConfig })
    client.setDefaultSigner(transactionSigner)
    return client
  }, [transactionSigner])

  const onCreate = async () => {
    if (!activeAddress) return enqueueSnackbar('Connect a wallet first', { variant: 'error' })
    setLoading(true)
    try {
      const result = await algorand.send.assetCreate({
        sender: activeAddress,
        total: BigInt(total),
        decimals: Number(decimals),
        unitName: unit,
        assetName: name,
        manager: activeAddress,
        reserve: activeAddress,
        freeze: activeAddress,
        clawback: activeAddress,
        defaultFrozen: false,
      })
      enqueueSnackbar(`ASA created. ID: ${result.assetId}`, { variant: 'success' })
      closeModal()
    } catch (e) {
      enqueueSnackbar((e as Error).message, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <dialog
      id="create_asa_modal"
      className={`${openModal ? 'flex' : 'hidden'} fixed inset-0 z-50 items-center justify-center bg-black/40 backdrop-blur-sm px-4`}
    >
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Create Token</h2>
          <p className="text-sm text-gray-500 mt-1">
            Deploy a new Algorand Standard Asset (ASA) for loyalty, stablecoin, or utility use.
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          {/* Token Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Token Name</label>
            <input
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="e.g. Campus Dollar"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">Full display name of your token.</p>
          </div>

          {/* Unit / Symbol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit / Symbol</label>
            <input
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="e.g. CUSD"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">Short ticker symbol (3–8 characters recommended).</p>
          </div>

          {/* Decimals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Decimals</label>
            <input
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="e.g. 6"
              value={decimals}
              onChange={(e) => setDecimals(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              Number of decimal places. 6 is common for stablecoin-style tokens.
            </p>
          </div>

          {/* Total Supply */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Supply (Base Units)</label>
            <input
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="e.g. 1000000"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              Total minted amount in base units (before applying decimals).
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={closeModal}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onCreate}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-md hover:bg-indigo-700 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {loading ? 'Creating Token...' : 'Create Token'}
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default CreateASA
