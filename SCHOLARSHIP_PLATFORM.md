# Decentralized Scholarship Platform

A transparent, fair, and decentralized scholarship funding system powered by Algorand blockchain.

## Overview

The platform enables:

- **Donors** to contribute funds transparently to scholarship pools
- **Students** to apply for scholarships (emergency aid, hackathon grants, merit scholarships) with applications stored on IPFS
- **Communities** to vote democratically (one-wallet-one-vote) on scholarship recipients
- **Automatic fund distribution** via smart contracts after voting concludes
- **NFT badges** for scholarship recipients as verifiable achievements
- **Milestone-based payouts** to ensure responsible scholarship usage
- **Refund protection** if funding goals aren't met

## Key Features

### 🔗 On-Chain Transparency
All donations and fund distributions tracked on Algorand blockchain. Real-time visibility into scholarship pool allocation and recipient wallets.

### ⚡ Low Transaction Fees
Algorand's sub-cent transaction fees mean more funds reach students. Reduce overhead compared to traditional scholarship systems.

### ⚙️ Automated Distribution
Smart contracts automatically release funds to selected students after voting ends. Trustless, permissionless fund delivery.

### 🏆 NFT Achievement Badges
Scholarship recipients earn verifiable NFT badges representing their achievement. Portable portfolio credential on-chain.

### 📊 Milestone Payouts
Funds released incrementally based on academic progress milestones. Ensures responsible scholarship usage and student success.

### ↩️ Refund Protection
If funding goals aren't met, donations automatically return to donors. Community-driven targets with built-in safeguards.

## Real Campus Use Cases

### 🚨 Emergency Aid
Rapid funding for unexpected hardships. Community-supported through democratic voting. Funds released within hours.

### 💻 Hackathon Grants
Sponsor innovation and student-led projects. Fair voting determines grant recipients. Transparent allocation of prizes.

### 🎓 Merit Scholarships
Recognize academic excellence. Community-voted awards. Milestone-based payouts for sustained achievement.

## Platform Values

- **Fairness**: One-wallet-one-vote ensures equal participation regardless of donation size
- **Decentralization**: Community decides scholarship outcomes, not centralized authorities
- **Empowerment**: Students own their scholarship journey and success metrics
- **Social Impact**: Accessible funding for students from all backgrounds
- **Transparency**: Every transaction on-chain and cryptographically verifiable

## Smart Contracts

### ScholarshipPool Contract (Bank)
Manages donations and scholarship awards:
- `contribute()` - Donors send ALGO to pool
- `award_scholarship()` - Admin awards funds to selected students
- `mark_badge_recipient()` - Award NFT badges
- `get_donation()` - View donor contribution
- `get_award()` - View student award amount
- `get_total_funds()` - Check pool balance

### ScholarshipVoting Contract (Counter)
Manages applications and voting:
- `submit_application()` - Student submits application
- `vote_for_application()` - Community member votes (one-wallet-one-vote)
- `get_votes_for_application()` - View vote count
- `get_total_applications()` - View application count
- `get_total_votes()` - View total votes cast

## Getting Started

### Prerequisites
- Node.js and npm/pnpm
- Algorand testnet wallet (Pera, Defly, or other)
- Test ALGO from faucet

### Installation

```bash
cd frontend
pnpm install
pnpm dev
```

Visit `http://localhost:5173` to access the platform.

## How It Works

### For Donors
1. Connect your Algorand wallet
2. Visit "Access Platform" → Donate tab
3. Enter donation amount
4. Transaction confirmed on-chain
5. Track contributions in real-time

### For Students
1. Connect your wallet
2. Visit "Access Platform" → Apply tab
3. Select scholarship type and submit details
4. Application stored on IPFS
5. Await community voting results

### For Voters
1. Connect your wallet
2. Visit "Access Platform" → Vote tab
3. View active scholarship proposals
4. Cast one vote per wallet
5. Voting weight equal for all participants

### After Voting
1. Smart contract automatically calculates winners
2. Funds transfer to selected students
3. Recipients earn NFT achievement badges
4. Milestone payouts begin according to schedule

## Network Configuration

Testnet endpoints (configured in `.env`):
```
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_INDEXER_SERVER=https://testnet-idx.algonode.cloud
```

## Security Considerations

- Smart contracts use `assert` statements to validate conditions
- Admin functions require creator authentication
- Double-voting prevented with box storage
- One-wallet-one-vote ensures fair participation
- All fund transfers transparent on-chain

## Future Enhancements

- Governance token support for weighted voting
- Time-locked milestone releases
- Multi-signature admin controls
- DAO treasury integration
- Scholarship marketplace for peer-to-peer funding

## License

MIT

---

**Built on Algorand** - The sustainable blockchain platform for real-world applications.
