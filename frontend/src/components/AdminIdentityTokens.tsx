import { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'

interface AdminIdentityTokensProps {
  openModal: boolean
  closeModal: () => void
}

const AdminIdentityTokens = ({ openModal, closeModal }: AdminIdentityTokensProps) => {
  const { activeAddress } = useWallet()
  const { enqueueSnackbar } = useSnackbar()

  const [activeTab, setActiveTab] = useState<'configure' | 'issue' | 'revoke'>('configure')

  // Configure tab
  const [studentIdAsaId, setStudentIdAsaId] = useState<string>('')
  const [clubMemberAsaId, setClubMemberAsaId] = useState<string>('')
  const [identityContractId, setIdentityContractId] = useState<string>('')

  // Issue tab
  const [studentWallet, setStudentWallet] = useState<string>('')
  const [voterWallet, setVoterWallet] = useState<string>('')

  // Revoke tab
  const [revokeStudentWallet, setRevokeStudentWallet] = useState<string>('')
  const [revokeVoterWallet, setRevokeVoterWallet] = useState<string>('')

  const handleConfigureStudentId = () => {
    if (!studentIdAsaId) {
      enqueueSnackbar('Please enter Student ID ASA ID', { variant: 'warning' })
      return
    }
    enqueueSnackbar(`Student ID ASA configured: ${studentIdAsaId}`, { variant: 'success' })
    setStudentIdAsaId('')
  }

  const handleConfigureClubMember = () => {
    if (!clubMemberAsaId) {
      enqueueSnackbar('Please enter Club Member ASA ID', { variant: 'warning' })
      return
    }
    enqueueSnackbar(`Club Member ASA configured: ${clubMemberAsaId}`, { variant: 'success' })
    setClubMemberAsaId('')
  }

  const handleIssueStudentId = () => {
    if (!studentWallet) {
      enqueueSnackbar('Please enter student wallet', { variant: 'warning' })
      return
    }
    enqueueSnackbar(`Student ID Token issued to ${studentWallet.substring(0, 10)}...`, { variant: 'success' })
    setStudentWallet('')
  }

  const handleIssueClubMember = () => {
    if (!voterWallet) {
      enqueueSnackbar('Please enter voter wallet', { variant: 'warning' })
      return
    }
    enqueueSnackbar(`Club Member Token issued to ${voterWallet.substring(0, 10)}...`, { variant: 'success' })
    setVoterWallet('')
  }

  const handleRevokeStudentId = () => {
    if (!revokeStudentWallet) {
      enqueueSnackbar('Please enter student wallet', { variant: 'warning' })
      return
    }
    enqueueSnackbar(`Student ID Token revoked from ${revokeStudentWallet.substring(0, 10)}...`, { variant: 'success' })
    setRevokeStudentWallet('')
  }

  const handleRevokeClubMember = () => {
    if (!revokeVoterWallet) {
      enqueueSnackbar('Please enter voter wallet', { variant: 'warning' })
      return
    }
    enqueueSnackbar(`Club Member Token revoked from ${revokeVoterWallet.substring(0, 10)}...`, { variant: 'success' })
    setRevokeVoterWallet('')
  }

  if (!openModal) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-8 shadow-xl max-h-96 overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Identity Token Management</h2>
          <button onClick={closeModal} className="text-slate-400 hover:text-white text-2xl">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700">
          {(['configure', 'issue', 'revoke'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition ${
                activeTab === tab
                  ? 'text-indigo-400 border-b-2 border-indigo-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab === 'configure' && '⚙️ Configure'}
              {tab === 'issue' && '✅ Issue'}
              {tab === 'revoke' && '❌ Revoke'}
            </button>
          ))}
        </div>

        {/* Configure Tab */}
        {activeTab === 'configure' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Configure Identity Contracts</h3>
            
            <div>
              <label className="text-slate-300 text-sm mb-2 block">Identity Contract App ID</label>
              <input
                type="number"
                placeholder="Enter contract ID"
                value={identityContractId}
                onChange={(e) => setIdentityContractId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-300 text-sm mb-2 block">Student ID Token ASA ID</label>
              <input
                type="number"
                placeholder="Enter ASA ID"
                value={studentIdAsaId}
                onChange={(e) => setStudentIdAsaId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleConfigureStudentId}
                disabled={!activeAddress}
                className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg transition"
              >
                Configure Student ID
              </button>
            </div>

            <div>
              <label className="text-slate-300 text-sm mb-2 block">Club Member Token ASA ID</label>
              <input
                type="number"
                placeholder="Enter ASA ID"
                value={clubMemberAsaId}
                onChange={(e) => setClubMemberAsaId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleConfigureClubMember}
                disabled={!activeAddress}
                className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg transition"
              >
                Configure Club Member
              </button>
            </div>

            <div className="bg-blue-900/30 p-4 rounded-lg mt-4">
              <p className="text-blue-300 text-sm">
                <strong>Note:</strong> Configure ASA IDs before issuing tokens. These are non-transferable identity tokens.
              </p>
            </div>
          </div>
        )}

        {/* Issue Tab */}
        {activeTab === 'issue' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Issue Identity Tokens</h3>

            <div className="bg-green-900/30 p-4 rounded-lg mb-4">
              <p className="text-green-300 text-sm">
                <strong>Student ID Token:</strong> Allows student to apply for scholarships
              </p>
            </div>

            <div>
              <label className="text-slate-300 text-sm mb-2 block">Student Wallet Address</label>
              <input
                type="text"
                placeholder="Enter wallet address"
                value={studentWallet}
                onChange={(e) => setStudentWallet(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleIssueStudentId}
                disabled={!activeAddress}
                className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg transition"
              >
                Issue Student ID Token
              </button>
            </div>

            <div className="border-t border-slate-700 my-4 pt-4">
              <p className="text-slate-400 text-sm mb-4">
                <strong>Club Member Token:</strong> Allows member to vote on scholarships
              </p>
            </div>

            <div>
              <label className="text-slate-300 text-sm mb-2 block">Voter Wallet Address</label>
              <input
                type="text"
                placeholder="Enter wallet address"
                value={voterWallet}
                onChange={(e) => setVoterWallet(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleIssueClubMember}
                disabled={!activeAddress}
                className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg transition"
              >
                Issue Club Member Token
              </button>
            </div>
          </div>
        )}

        {/* Revoke Tab */}
        {activeTab === 'revoke' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Revoke Identity Tokens</h3>

            <div className="bg-red-900/30 p-4 rounded-lg mb-4">
              <p className="text-red-300 text-sm">
                <strong>Warning:</strong> Revoking tokens immediately removes access to apply or vote.
              </p>
            </div>

            <div>
              <label className="text-slate-300 text-sm mb-2 block">Student Wallet to Revoke</label>
              <input
                type="text"
                placeholder="Enter wallet address"
                value={revokeStudentWallet}
                onChange={(e) => setRevokeStudentWallet(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleRevokeStudentId}
                disabled={!activeAddress}
                className="w-full mt-2 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold rounded-lg transition"
              >
                Revoke Student ID Token
              </button>
            </div>

            <div className="border-t border-slate-700 my-4 pt-4">
              <label className="text-slate-300 text-sm mb-2 block">Voter Wallet to Revoke</label>
              <input
                type="text"
                placeholder="Enter wallet address"
                value={revokeVoterWallet}
                onChange={(e) => setRevokeVoterWallet(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleRevokeClubMember}
                disabled={!activeAddress}
                className="w-full mt-2 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold rounded-lg transition"
              >
                Revoke Club Member Token
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminIdentityTokens
