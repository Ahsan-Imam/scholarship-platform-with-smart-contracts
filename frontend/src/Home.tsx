// src/components/Home.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import ScholarshipDashboard from './components/ScholarshipDashboard'
import SendAlgo from './components/SendAlgo'
import MintNFT from './components/MintNFT'
import CreateASA from './components/CreateASA'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [scholarshipModal, setScholarshipModal] = useState<boolean>(false)
  const [sendAlgoModal, setSendAlgoModal] = useState<boolean>(false)
  const [mintNftModal, setMintNftModal] = useState<boolean>(false)
  const [createAsaModal, setCreateAsaModal] = useState<boolean>(false)
  const { activeAddress } = useWallet()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-black text-white relative overflow-hidden">
      
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.25),transparent_60%)] pointer-events-none" />

      {/* Top Navigation */}
      <div className="absolute top-6 right-6 z-20">
        <button
          data-test-id="connect-wallet"
          className="px-6 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 transition-all text-sm font-semibold shadow-lg shadow-indigo-900/40"
          onClick={() => setOpenWalletModal(!openWalletModal)}
        >
          {activeAddress ? 'Wallet Connected' : 'Connect Wallet'}
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 lg:px-20">

        {/* Hero Section */}
        <section className="pt-28 pb-20 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent leading-tight">
            Decentralized Scholarships
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            Transparent, fair, and decentralized scholarship funding powered by Algorand. Donors contribute, students apply, communities vote, and funds distribute automatically.
          </p>

          <div className="mt-10 flex justify-center gap-4 flex-wrap">
            <button
              disabled={!activeAddress}
              onClick={() => setScholarshipModal(true)}
              className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold shadow-lg shadow-emerald-900/40"
            >
              Access Platform
            </button>

            <button
              disabled={!activeAddress}
              onClick={() => setSendAlgoModal(true)}
              className="px-8 py-3 rounded-xl border border-indigo-500 text-indigo-300 hover:bg-indigo-800/30 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold"
            >
              Send Funds
            </button>
          </div>
        </section>

        {/* Key Features Grid */}
        <section className="pb-24">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Platform Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Transparency */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-emerald-500 transition-all shadow-lg">
              <h3 className="text-lg font-semibold text-emerald-400">🔗 On-Chain Transparency</h3>
              <p className="text-slate-400 mt-3 text-sm">
                All donations and fund distributions are tracked on-chain. Real-time visibility into scholarship pool allocation and recipient wallets.
              </p>
            </div>

            {/* Low Fees */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-cyan-500 transition-all shadow-lg">
              <h3 className="text-lg font-semibold text-cyan-400">⚡ Low Transaction Fees</h3>
              <p className="text-slate-400 mt-3 text-sm">
                Algorand's sub-cent transaction fees mean more funds reach students. Reduce overhead compared to traditional scholarship systems.
              </p>
            </div>

            {/* Automation */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-indigo-500 transition-all shadow-lg">
              <h3 className="text-lg font-semibold text-indigo-400">⚙️ Automated Distribution</h3>
              <p className="text-slate-400 mt-3 text-sm">
                Smart contracts automatically release funds to selected students after voting ends. Trustless, permissionless fund delivery.
              </p>
            </div>

            {/* NFT Badges */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-pink-500 transition-all shadow-lg">
              <h3 className="text-lg font-semibold text-pink-400">🏆 NFT Achievement Badges</h3>
              <p className="text-slate-400 mt-3 text-sm">
                Scholarship recipients earn verifiable NFT badges representing their achievement. Portable portfolio credential on-chain.
              </p>
            </div>

            {/* Milestones */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-amber-500 transition-all shadow-lg">
              <h3 className="text-lg font-semibold text-amber-400">📊 Milestone Payouts</h3>
              <p className="text-slate-400 mt-3 text-sm">
                Funds released incrementally based on academic progress milestones. Ensures responsible scholarship usage and student success.
              </p>
            </div>

            {/* Refunds */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-rose-500 transition-all shadow-lg">
              <h3 className="text-lg font-semibold text-rose-400">↩️ Refund Protection</h3>
              <p className="text-slate-400 mt-3 text-sm">
                If funding goals aren't met, donations automatically return to donors. Community-driven targets with built-in safeguards.
              </p>
            </div>

          </div>
        </section>

        {/* Use Cases Section */}
        <section className="pb-24">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Campus Use Cases</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">

            {/* Emergency Aid */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-red-500 transition-all shadow-lg">
              <h4 className="text-lg font-semibold text-red-400 mb-3">🚨 Emergency Aid</h4>
              <p className="text-slate-400 text-sm">
                Rapid funding for unexpected hardships. One-wallet-one-vote community support. Funds released within hours.
              </p>
            </div>

            {/* Hackathon */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-purple-500 transition-all shadow-lg">
              <h4 className="text-lg font-semibold text-purple-400 mb-3">💻 Hackathon Grants</h4>
              <p className="text-slate-400 text-sm">
                Sponsor innovation and student-led projects. Fair voting determines grant recipients. Transparent allocation of prizes.
              </p>
            </div>

            {/* Merit Scholarships */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-blue-500 transition-all shadow-lg">
              <h4 className="text-lg font-semibold text-blue-400 mb-3">🎓 Merit Scholarships</h4>
              <p className="text-slate-400 text-sm">
                Recognize academic excellence. Community-voted awards. Milestone-based payouts for sustained achievement.
              </p>
            </div>

          </div>
        </section>

        {/* Values Section */}
        <section className="pb-24 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 text-white">Our Values</h2>
          <div className="space-y-4 text-slate-300">
            <p className="flex items-center gap-3 text-lg">
              <span className="text-emerald-400 font-bold">✓</span> <strong>Fairness:</strong> One-wallet-one-vote ensures equal participation
            </p>
            <p className="flex items-center gap-3 text-lg">
              <span className="text-emerald-400 font-bold">✓</span> <strong>Decentralization:</strong> Community decides scholarship outcomes
            </p>
            <p className="flex items-center gap-3 text-lg">
              <span className="text-emerald-400 font-bold">✓</span> <strong>Empowerment:</strong> Students own their scholarship journey
            </p>
            <p className="flex items-center gap-3 text-lg">
              <span className="text-emerald-400 font-bold">✓</span> <strong>Social Impact:</strong> Accessible funding for all backgrounds
            </p>
            <p className="flex items-center gap-3 text-lg">
              <span className="text-emerald-400 font-bold">✓</span> <strong>Transparency:</strong> Every transaction on-chain and verifiable
            </p>
          </div>
        </section>

      </div>

      {/* Modals */}
      <ConnectWallet openModal={openWalletModal} closeModal={() => setOpenWalletModal(false)} />
      <ScholarshipDashboard openModal={scholarshipModal} closeModal={() => setScholarshipModal(false)} />
      <SendAlgo openModal={sendAlgoModal} closeModal={() => setSendAlgoModal(false)} />
      <MintNFT openModal={mintNftModal} closeModal={() => setMintNftModal(false)} />
      <CreateASA openModal={createAsaModal} closeModal={() => setCreateAsaModal(false)} />
    </div>
  )
}

export default Home
