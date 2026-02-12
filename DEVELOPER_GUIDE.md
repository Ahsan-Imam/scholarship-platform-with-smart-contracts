# Scholarship Platform - Developer Guide

## Project Structure

```
contracts/
├── smart_contracts/
│   ├── bank/
│   │   ├── contract.py          # ScholarshipPool contract
│   │   └── deploy_config.py
│   └── counter/
│       ├── contract.py          # ScholarshipVoting contract
│       └── deploy_config.py
└── tests/
    └── *.py                     # Contract tests

frontend/
├── src/
│   ├── components/
│   │   ├── ScholarshipDashboard.tsx    # Main scholarship UI
│   │   └── ... (other components)
│   ├── utils/
│   │   ├── scholarshipUtils.ts         # Helper functions
│   │   └── ... (other utilities)
│   ├── Home.tsx                        # Redesigned homepage
│   └── App.tsx
└── package.json
```

## Smart Contracts

### ScholarshipPool (Bank Contract)
Manages all donation and award logic.

**Key Methods:**
```python
contribute(payment: PaymentTransaction) -> UInt64
  # Donor sends ALGO, tracks total contribution
  
award_scholarship(student: Account, amount: UInt64) -> UInt64
  # Admin distributes funds to student
  # Automatically sends ALGO payment
  
mark_badge_recipient(student: Account) -> None
  # Award NFT badge to recipient
  
get_donation(donor: Account) -> UInt64
  # View donor's total contribution
  
get_award(student: Account) -> UInt64
  # View student's total award
  
get_total_funds() -> UInt64
  # Check remaining pool balance
  
has_badge(student: Account) -> bool
  # Check if student has badge
```

### ScholarshipVoting (Counter Contract)
Manages applications and democratic voting.

**Key Methods:**
```python
submit_application() -> UInt64
  # Student submits application
  # Returns total application count
  
vote_for_application(application_id: UInt64) -> UInt64
  # One wallet = one vote (prevents double voting)
  # Returns new vote count for application
  
get_votes_for_application(application_id: UInt64) -> UInt64
  # View vote count for specific application
  
get_total_applications() -> UInt64
  # View total applications submitted
  
get_total_votes() -> UInt64
  # View total votes cast across all applications
```

## Frontend Components

### ScholarshipDashboard.tsx
Main UI component with four tabs:

**Donate Tab**
- Input donation amount
- Contribute to scholarship pool
- Shows on-chain transparency message
- Low Algorand fees highlighted

**Apply Tab**
- Select scholarship type (emergency, hackathon, merit)
- Submit application with student details
- Notes about IPFS storage of applications
- Explains community voting process

**Vote Tab**
- View active scholarship proposals
- See vote counts (demo data)
- One-wallet-one-vote system
- Cast votes on applicants

**Status Tab**
- View personal donations
- View awards received
- Check NFT badge status
- See votes cast

### Home.tsx (Updated)
Redesigned homepage featuring:
- Scholarship-focused hero section
- 6 key platform features with icons
- 3 campus use case cards
- 5 core values section
- Minimal, easy-to-navigate design

## Utility Functions

### scholarshipUtils.ts
Helper functions for scholarship platform:

```typescript
formatAlgo(microAlgos: number | bigint): string
  # Format microAlgos to readable ALGO amount

ellipseAddress(address: string, chars?: number): string
  # Shorten wallet address display

getScholarshipLabel(type: string): string
  # Get display label with emoji for scholarship type

calculateStats(donations: [], applications: []): ScholarshipStats
  # Aggregate platform statistics

sortByVotes(applications: []): []
  # Sort applications by vote count

filterByType(applications: [], type: string): []
  # Filter applications by scholarship type

isFundingGoalMet(totalFunds: number, goal: number): boolean
  # Check if funding threshold reached
```

## Getting Started - Development

### 1. Setup Environment
```bash
cd frontend
pnpm install
```

### 2. Configure Network
Edit `.env`:
```
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_INDEXER_SERVER=https://testnet-idx.algonode.cloud
VITE_PINATA_JWT=<your-pinata-jwt>
```

### 3. Run Development Server
```bash
pnpm dev
```

Open `http://localhost:5173`

### 4. Deploy Contracts (Testnet)

#### Setup: Configure Deployer Mnemonic

Before deploying, you need to configure which wallet will deploy the contracts.

##### macOS:
```bash
cd contracts

# Set your deployer mnemonic (seed phrase from your wallet)
export ALGOKIT_DEPLOYER_MNEMONIC="word1 word2 word3 ... word25"

# Or create a .env file in the contracts folder
echo 'ALGOKIT_DEPLOYER_MNEMONIC="your seed phrase here"' > .env
```

##### Windows (PowerShell):
```powershell
cd contracts

# Set your deployer mnemonic
$env:ALGOKIT_DEPLOYER_MNEMONIC="word1 word2 word3 ... word25"

# Or create a .env file in the contracts folder
Add-Content -Path .env -Value 'ALGOKIT_DEPLOYER_MNEMONIC="your seed phrase here"'
```

**How to get your mnemonic:**
1. Open your Algorand wallet (e.g., Pera Wallet, Exodus, etc.)
2. Go to Settings/Security
3. Show your seed phrase (25 words)
4. Copy all 25 words in order (separated by spaces)

#### Option A: Deploy to Algorand Testnet (Recommended)

##### macOS:
```bash
cd contracts

# Install dependencies
poetry install

# Install AlgoKit
pip3 install algokit

# Deploy to testnet
algokit project deploy testnet
```

##### Windows (PowerShell):
```powershell
cd contracts

# Install dependencies
poetry install

# Install AlgoKit
pip install algokit

# Deploy to testnet
algokit project deploy testnet
```

#### Option B: Deploy to Local Network (Requires Docker)

If you have Docker running:

##### macOS:
```bash
cd contracts

# Ensure Docker is running
# Check with: docker ps

# Start local Algorand node
algokit localnet start

# In a new terminal, deploy contracts
cd contracts
algokit project deploy localnet
```

##### Windows (PowerShell):
```powershell
cd contracts

# Ensure Docker Desktop is running

# Start local Algorand node
algokit localnet start

# In a new terminal, deploy contracts
cd contracts
algokit project deploy localnet
```

**Troubleshooting LocalNet:**
- Ensure Docker is installed and running
- Run `docker ps` to verify Docker is accessible
- If you get port conflicts, stop other services using ports 4001-4003, 8980, 9392

**Note**: 
- **Testnet**: Recommended for development and testing (requires ALGO for fees)
- **LocalNet**: Local blockchain for rapid testing (requires Docker)
- The IdentityTokens contract can be deployed separately if needed
- ScholarshipPool and ScholarshipVoting contracts are automatically deployed
- Save your deployer mnemonic securely - DO NOT commit it to git

## Key Design Decisions

### Minimal Changes to Existing Contracts
- Reused Bank contract structure → ScholarshipPool
- Reused Counter structure → ScholarshipVoting
- Maintained box storage patterns
- Kept ARC4 interfaces compatible

### Simple, Clean UI
- Single dashboard with tabs (no clutter)
- Color-coded scholarship types
- Emoji icons for quick recognition
- Clear success/warning messages
- Responsive grid layouts

### One-Wallet-One-Vote
- `has_voted` box map prevents double voting
- Fair participation regardless of donation size
- True democratic governance
- Box storage ensures efficient on-chain checks

### Transparent Fund Tracking
- All donations stored in `donations` box map
- Awards tracked separately in `awards` box map
- Total pool balance always queryable
- IPFS integration for application details

## Testing

### Contract Tests

#### macOS:
```bash
cd contracts
python3 -m pytest tests/
```

#### Windows (PowerShell):
```powershell
cd contracts
python -m pytest tests/
```

### Frontend Tests (if configured)
```bash
cd frontend
pnpm test
```

## Future Enhancements

1. **Governance Token Integration**
   - Weighted voting by token holdings
   - DAO treasury management

2. **Milestone-Based Releases**
   - Time-locked fund distribution
   - Academic progress verification
   - Smart contract automation

3. **Refund Mechanism**
   - Automatic refunds if goals unmet
   - Voting period timeouts
   - Donor withdrawal functionality

4. **NFT Marketplace**
   - Scholarship badges as trading assets
   - Peer-to-peer scholarship funding
   - Achievement portfolio

5. **Analytics Dashboard**
   - Real-time platform statistics
   - Fund flow visualization
   - Student success metrics

## Deployment Checklist

- [ ] Test contracts on testnet
- [ ] Deploy ScholarshipPool contract
- [ ] Deploy ScholarshipVoting contract
- [ ] Update app IDs in frontend
- [ ] Configure Pinata IPFS gateway
- [ ] Test all UI flows
- [ ] Set up initial admin wallet
- [ ] Write deployment documentation
- [ ] Conduct security audit
- [ ] Launch on mainnet (when ready)

## Support Resources

- **Algorand Docs**: https://developer.algorand.org/
- **AVM Debugger**: https://github.com/algorand/avm-debugger
- **PyTeal Docs**: https://pyteal.readthedocs.io/
- **Pinata IPFS**: https://www.pinata.cloud/
- **AlgoKit**: https://developer.algorand.org/docs/get-started/algokit/

---

**Happy coding! Build decentralized scholarships for student empowerment.** 🚀
