import { useState, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { checkAccessControl } from '../utils/assetUtils'

interface ScholarshipDashboardProps {
  openModal: boolean
  closeModal: () => void
}

interface AccessStatus {
  canApply: boolean
  canVote: boolean
  hasStudentId: boolean
  hasClubMember: boolean
  reasons: string[]
}

const ScholarshipDashboard = ({ openModal, closeModal }: ScholarshipDashboardProps) => {
  const { activeAddress, algorand } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [activeTab, setActiveTab] = useState<'donate' | 'apply' | 'vote' | 'status'>('donate')
  const [donationAmount, setDonationAmount] = useState<string>('')
  const [studentName, setStudentName] = useState<string>('')
  const [applicationType, setApplicationType] = useState<'emergency' | 'hackathon' | 'merit'>('merit')
  
  // Access control state
  const [accessStatus, setAccessStatus] = useState<AccessStatus>({
    canApply: false,
    canVote: false,
    hasStudentId: false,
    hasClubMember: false,
    reasons: [],
  })
  const [loading, setLoading] = useState(true)

  // Configuration - update these with your actual ASA IDs from contract deployment
  const STUDENT_ID_ASA_ID = 0 // Set after ASA creation
  const CLUB_MEMBER_ASA_ID = 0 // Set after ASA creation

  // Check access control on mount and when address changes
  useEffect(() => {
    const checkAccess = async () => {
      if (!activeAddress || !algorand) {
        setAccessStatus({
          canApply: false,
          canVote: false,
          hasStudentId: false,
          hasClubMember: false,
          reasons: ['Wallet not connected'],
        })
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        // Only check if ASA IDs are configured (non-zero)
        const status = await checkAccessControl(
          activeAddress,
          STUDENT_ID_ASA_ID > 0 ? STUDENT_ID_ASA_ID : undefined,
          CLUB_MEMBER_ASA_ID > 0 ? CLUB_MEMBER_ASA_ID : undefined,
          algorand
        )

        setAccessStatus(status)
        
        // Show notifications for access restrictions
        if (!status.canApply && status.reasons.some(r => r.includes('Student ID'))) {
          enqueueSnackbar('You need a Student ID Token to apply', { variant: 'info' })
        }
        if (!status.canVote && status.reasons.some(r => r.includes('Club Member'))) {
          enqueueSnackbar('You need a Club Member Token to vote', { variant: 'info' })
        }
      } catch (error) {
        console.error('Error checking access:', error)
        setAccessStatus({
          canApply: false,
          canVote: false,
          hasStudentId: false,
          hasClubMember: false,
          reasons: ['Error checking access control'],
        })
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [activeAddress, algorand, enqueueSnackbar])

  const handleDonate = async () => {
    if (!activeAddress || !donationAmount) {
      enqueueSnackbar('Please enter amount', { variant: 'warning' })
      return
    }
    enqueueSnackbar(`Donation of ${donationAmount} ALGO submitted!`, { variant: 'success' })
    setDonationAmount('')
  }

  const handleApply = async () => {
    if (!activeAddress) {
      enqueueSnackbar('Please connect your wallet', { variant: 'warning' })
      return
    }
    if (!accessStatus.canApply) {
      enqueueSnackbar(
        accessStatus.reasons[0] || 'You do not have permission to apply',
        { variant: 'error' }
      )
      return
    }
    if (!studentName) {
      enqueueSnackbar('Please enter your name', { variant: 'warning' })
      return
    }
    enqueueSnackbar(`Application submitted for ${applicationType} scholarship!`, { variant: 'success' })
    setStudentName('')
  }

  const handleVote = (proposalId: string) => {
    if (!activeAddress) {
      enqueueSnackbar('Please connect your wallet', { variant: 'warning' })
      return
    }
    if (!accessStatus.canVote) {
      enqueueSnackbar(
        accessStatus.reasons[0] || 'You do not have permission to vote',
        { variant: 'error' }
      )
      return
    }
    enqueueSnackbar(`Voted for proposal ${proposalId}!`, { variant: 'success' })
  }

  if (!openModal) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-8 shadow-xl">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Scholarship Platform</h2>
          <button onClick={closeModal} className="text-slate-400 hover:text-white text-2xl">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700">
          {(['donate', 'apply', 'vote', 'status'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition ${
                activeTab === tab
                  ? 'text-indigo-400 border-b-2 border-indigo-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Donate Tab */}
        {activeTab === 'donate' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Support Scholarships</h3>
            <p className="text-slate-300 text-sm mb-4">
              Your contribution directly funds scholarships. Track donations on-chain with full transparency. Low Algorand fees ensure maximum funds reach students.
            </p>
            <input
              type="number"
              placeholder="Amount (ALGO)"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleDonate}
              disabled={!activeAddress}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg transition"
            >
              Donate Now
            </button>
          </div>
        )}

        {/* Apply Tab */}
        {activeTab === 'apply' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Apply for Scholarship</h3>
            <p className="text-slate-300 text-sm mb-4">
              Apply for emergency aid, hackathon grants, or merit scholarships. Store your application on IPFS. Community votes determine outcomes.
            </p>

            {/* Access Control Status */}
            {loading ? (
              <div className="bg-slate-800 p-4 rounded-lg">
                <p className="text-slate-300">Checking access control...</p>
              </div>
            ) : !accessStatus.canApply ? (
              <div className="bg-red-900/30 p-4 rounded-lg border border-red-700">
                <p className="text-red-300 font-medium mb-2">🔒 Access Restricted</p>
                {accessStatus.reasons.map((reason, idx) => (
                  <p key={idx} className="text-red-200 text-sm">{reason}</p>
                ))}
              </div>
            ) : (
              <div className="bg-green-900/30 p-4 rounded-lg border border-green-700">
                <p className="text-green-300 font-medium">✓ You can apply for scholarships</p>
              </div>
            )}

            <div>
              <label className="text-slate-300 text-sm mb-2 block">Scholarship Type</label>
              <select
                value={applicationType}
                onChange={(e) => setApplicationType(e.target.value as any)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="emergency">Emergency Aid</option>
                <option value="hackathon">Hackathon Grant</option>
                <option value="merit">Merit Scholarship</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Your Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleApply}
              disabled={!activeAddress || !accessStatus.canApply}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg transition"
            >
              {!activeAddress ? 'Connect Wallet' : !accessStatus.canApply ? 'Not Eligible' : 'Submit Application'}
            </button>
          </div>
        )}

        {/* Vote Tab */}
        {activeTab === 'vote' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Vote on Applicants</h3>
            <p className="text-slate-300 text-sm mb-4">
              Decentralized governance: One wallet, one vote. Community decides scholarship recipients. Fair and transparent voting on Algorand.
            </p>

            {/* Access Control Status */}
            {loading ? (
              <div className="bg-slate-800 p-4 rounded-lg">
                <p className="text-slate-300">Checking voting access...</p>
              </div>
            ) : !accessStatus.canVote ? (
              <div className="bg-red-900/30 p-4 rounded-lg border border-red-700">
                <p className="text-red-300 font-medium mb-2">🔒 Voting Restricted</p>
                {accessStatus.reasons.map((reason, idx) => (
                  <p key={idx} className="text-red-200 text-sm">{reason}</p>
                ))}
              </div>
            ) : (
              <div className="bg-green-900/30 p-4 rounded-lg border border-green-700">
                <p className="text-green-300 font-medium">✓ You can vote on proposals</p>
              </div>
            )}

            <div className="bg-slate-800 p-4 rounded-lg">
              <h4 className="text-white font-medium mb-3">Active Proposals</h4>
              <div className="space-y-3">
                {[
                  { id: '1', name: 'Emergency Aid - John', votes: 45 },
                  { id: '2', name: 'Hackathon Grant - Sarah', votes: 38 },
                  { id: '3', name: 'Merit Scholarship - Alex', votes: 52 },
                ].map((proposal) => (
                  <div key={proposal.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{proposal.name}</p>
                      <p className="text-indigo-400 text-xs">{proposal.votes} votes</p>
                    </div>
                    <button
                      onClick={() => handleVote(proposal.id)}
                      disabled={!activeAddress || !accessStatus.canVote}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded transition"
                    >
                      Vote
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Status Tab */}
        {activeTab === 'status' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Your Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">Your Donations</p>
                <p className="text-2xl font-bold text-indigo-400">0 ALGO</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">Award Received</p>
                <p className="text-2xl font-bold text-emerald-400">0 ALGO</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">NFT Badge</p>
                <p className="text-lg text-slate-300">—</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">Votes Cast</p>
                <p className="text-2xl font-bold text-slate-300">0</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ScholarshipDashboard

