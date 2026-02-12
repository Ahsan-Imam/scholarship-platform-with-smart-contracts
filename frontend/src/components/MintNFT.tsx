import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useMemo, useState } from 'react'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { ipfsHttpUrl, pinFileToIPFS, pinJSONToIPFS } from '../utils/pinata'

interface MintNFTProps {
  openModal: boolean
  closeModal: () => void
}

const MintNFT = ({ openModal, closeModal }: MintNFTProps) => {
  const { activeAddress, transactionSigner } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [name, setName] = useState('AlgoNFT')
  const [description, setDescription] = useState('My first NFT!')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const algorand = useMemo(() => {
    const algodConfig = getAlgodConfigFromViteEnvironment()
    const client = AlgorandClient.fromConfig({ algodConfig })
    client.setDefaultSigner(transactionSigner)
    return client
  }, [transactionSigner])

  async function sha256Hex(data: Uint8Array): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(digest))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  const onMint = async () => {
    if (!activeAddress) return enqueueSnackbar('Connect a wallet first', { variant: 'error' })
    if (!file) return enqueueSnackbar('Select an image', { variant: 'error' })

    setLoading(true)
    try {
      // 1) Upload image
      const filePin = await pinFileToIPFS(file)
      const imageUrl = ipfsHttpUrl(filePin.IpfsHash)

      // 2) Create metadata
      const metadata = {
        name,
        description,
        image: imageUrl,
        image_mimetype: file.type || 'image/png',
        external_url: imageUrl,
        properties: {
          simple_property: 'Dashing Item',
        },
      }

      // 3) Upload metadata
      const jsonPin = await pinJSONToIPFS(metadata)
      const metadataUrl = `${ipfsHttpUrl(jsonPin.IpfsHash)}#arc3`

      // 4) ARC-3 metadata hash (sha256 of metadata JSON bytes)
      const metaBytes = new TextEncoder().encode(JSON.stringify(metadata))
      const metaHex = await sha256Hex(metaBytes)
      const metadataHash = new Uint8Array(metaHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)))

      // 5) Create ASA (NFT)
      const result = await algorand.send.assetCreate({
        sender: activeAddress,
        total: 1n,
        decimals: 0,
        unitName: name.slice(0, 8).replace(/\s+/g, ''),
        assetName: name,
        manager: activeAddress,
        reserve: activeAddress,
        freeze: activeAddress,
        clawback: activeAddress,
        url: metadataUrl,
        metadataHash,
        defaultFrozen: false,
      })

      enqueueSnackbar(`NFT minted. ASA ID: ${result.assetId}`, { variant: 'success' })
      closeModal()
    } catch (e) {
      enqueueSnackbar((e as Error).message, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
  <dialog
    id="mint_nft_modal"
    className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm ${
      openModal ? 'flex' : 'hidden'
    }`}
  >
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 relative animate-fadeIn">
      {/* Header */}
      <h3 className="text-2xl font-bold mb-6 text-gray-800">
        Mint NFT (ARC-3)
      </h3>

      {/* Form */}
      <div className="flex flex-col gap-5">
        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-600">
            NFT Name
          </label>
          <input
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            placeholder="Enter NFT name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-600">
            Description
          </label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition resize-none"
            placeholder="Describe your NFT"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* File Upload */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600">
            Upload Image
          </label>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-indigo-500 transition">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="fileUpload"
              disabled={loading}
            />

            <label
              htmlFor="fileUpload"
              className="cursor-pointer text-indigo-600 font-medium"
            >
              {file ? file.name : 'Click to upload image'}
            </label>

            {file && (
              <div className="mt-4">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="mx-auto max-h-48 rounded-lg shadow-md object-contain"
                />
              </div>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        {loading && (
          <div className="flex flex-col gap-2 mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-indigo-600 h-2 w-full animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              Uploading to IPFS & minting on Algorand...
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-8">
        <button
          onClick={closeModal}
          disabled={loading}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
        >
          Close
        </button>

        <button
          onClick={onMint}
          disabled={loading}
          className={`px-6 py-2 rounded-lg text-white font-semibold transition 
            ${
              loading
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Minting...
            </span>
          ) : (
            'Mint NFT'
          )}
        </button>
      </div>
    </div>
  </dialog>
)

}

export default MintNFT

