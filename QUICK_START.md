# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Install Dependencies
```bash
cd frontend
pnpm install
```

### 2. Configure Environment
The `.env` file is already configured for Algorand testnet:
```
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_ALGOD_NETWORK=testnet
VITE_PINATA_JWT=<already-configured>
```

### 3. Run Development Server
```bash
pnpm dev
```

Open: **http://localhost:5173**

### 4. Test the Platform

**Step 1: Connect Wallet**
- Click "Connect Wallet" (top-right)
- Select Pera, Defly, or other Algorand testnet wallet
- Approve connection

**Step 2: Get Testnet ALGO**
- Go to: https://bank.testnet.algorand.org/
- Paste your wallet address
- Request testnet ALGO (gets ~10 ALGO)

**Step 3: Explore Features**
- Click "Access Platform" button
- Use four tabs: Donate, Apply, Vote, Status

### 5. Smart Contracts (After Deployment)

**Deploy ScholarshipPool:**
```bash
cd contracts
python -m algokit deploy testnet
```

**Deploy ScholarshipVoting:**
```bash
cd contracts
python -m algokit deploy testnet
```

Update the app IDs in your frontend code.

---

## 📋 What's Included

### ✅ Smart Contracts
- **ScholarshipPool** - Manage donations and awards
- **ScholarshipVoting** - Handle applications and voting

### ✅ Frontend
- **ScholarshipDashboard** - All-in-one interface
- **Home Page** - Redesigned for scholarships
- **Utilities** - Helper functions for the platform

### ✅ Documentation
- **SCHOLARSHIP_PLATFORM.md** - Full platform guide
- **DEVELOPER_GUIDE.md** - Technical documentation
- **TRANSFORMATION_SUMMARY.md** - What changed and why

---

## 🎯 Key Features

| Feature | Status |
|---------|--------|
| 💰 Transparent Donations | ✅ Ready |
| 📝 Student Applications | ✅ Ready |
| 🗳️ Community Voting | ✅ Ready |
| 🏆 NFT Badges | ✅ Ready |
| 📊 Milestone Payouts | ✅ Ready |
| ↩️ Refund Protection | ✅ Ready |
| 🔗 On-Chain Tracking | ✅ Ready |
| ⚡ Low Fees | ✅ Ready |

---

## 🛠️ Component Overview

### Dashboard Tabs

**💳 Donate Tab**
- Input donation amount
- Contribute to scholarship pool
- Shows transaction confirmation

**📋 Apply Tab**
- Choose scholarship type
- Submit application details
- Application stored on IPFS

**🗳️ Vote Tab**
- View active proposals
- See vote counts
- Cast your vote (one per wallet)

**📊 Status Tab**
- View your donations
- Check awards received
- See NFT badge status
- View votes cast

---

## 🔐 Security Notes

- One-wallet-one-vote prevents double voting
- Admin functions require creator authentication
- All transactions on-chain and verifiable
- Smart contracts use assertions for validation

---

## 📱 Supported Wallets

- ✅ Pera Wallet
- ✅ Defly Wallet
- ✅ Exodus
- ✅ Lute
- ✅ KMD (local development)

---

## 🧪 Test Scenarios

### Scenario 1: Donate
1. Connect wallet
2. Go to "Donate" tab
3. Enter 1 ALGO
4. Confirm transaction
5. Check Status tab → Shows donation

### Scenario 2: Apply
1. Go to "Apply" tab
2. Select "Merit Scholarship"
3. Enter your name
4. Submit
5. See confirmation

### Scenario 3: Vote
1. Go to "Vote" tab
2. View proposals
3. Click "Cast Your Vote"
4. See vote confirmed
5. Can't vote again (one-per-wallet)

### Scenario 4: View Status
1. Go to "Status" tab
2. See all your metrics
3. View NFT badge status
4. Check voting history

---

## 📞 Troubleshooting

### Wallet won't connect
- Ensure you're on Algorand testnet
- Check wallet is installed and unlocked
- Try a different wallet

### Transactions fail
- Check you have testnet ALGO
- Verify app IDs are correct
- Check smart contracts are deployed

### IPFS not working
- Verify Pinata JWT in .env
- Check internet connection
- Try pinata.cloud website

---

## 📚 Learn More

- **Algorand Docs**: https://developer.algorand.org/
- **PyTeal**: https://pyteal.readthedocs.io/
- **Pinata**: https://www.pinata.cloud/
- **AlgoKit**: https://developer.algorand.org/docs/get-started/algokit/

---

## ✨ Next Steps

1. **Test on testnet** - Make sure all flows work
2. **Deploy contracts** - Use algokit to deploy
3. **Update app IDs** - Put contract IDs in frontend
4. **Gather feedback** - Let students and donors test
5. **Move to mainnet** - Launch for real when ready

---

**Welcome to decentralized scholarships! 🎓**
