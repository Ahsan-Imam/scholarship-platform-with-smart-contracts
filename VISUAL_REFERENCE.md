# ASA Access Control - Visual Reference & Cheat Sheet

## System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                   SCHOLARSHIP PLATFORM                         │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐         ┌──────────────────────┐          │
│  │  End User       │         │  Admin User          │          │
│  │  ┌───────────┐  │         │  ┌────────────────┐  │          │
│  │  │ Connect   │  │         │  │ AdminIdentity  │  │          │
│  │  │ Wallet    │  │         │  │ Tokens Panel   │  │          │
│  │  └─────┬─────┘  │         │  │ ┌────┬────┬──┐│  │          │
│  │        │        │         │  │ │Conf│Iss │Re││  │          │
│  │  ┌─────▼─────┐  │         │  │ └────┴────┴──┘│  │          │
│  │  │Check Token│  │         │  └────────┬───────┘  │          │
│  │  │  Balance  │  │         │           │          │          │
│  │  └─────┬─────┘  │         │           │          │          │
│  │        │        │         │           │          │          │
│  │  ┌─────▼──────────────────┴───────────┴───┐     │          │
│  │  │ Smart Contracts                        │     │          │
│  │  │ ┌──────────────────────────────────┐   │     │          │
│  │  │ │  IdentityTokens Contract         │   │     │          │
│  │  │ │  - Issue tokens                  │   │     │          │
│  │  │ │  - Revoke tokens                 │   │     │          │
│  │  │ │  - Check holdings                │   │     │          │
│  │  │ └──────────────────────────────────┘   │     │          │
│  │  │ ┌──────────────────────────────────┐   │     │          │
│  │  │ │  ScholarshipPool + Access        │   │     │          │
│  │  │ │  - Require Student ID to apply   │   │     │          │
│  │  │ │  - Check token on-chain          │   │     │          │
│  │  │ └──────────────────────────────────┘   │     │          │
│  │  │ ┌──────────────────────────────────┐   │     │          │
│  │  │ │  ScholarshipVoting + Access      │   │     │          │
│  │  │ │  - Require Club Member to vote   │   │     │          │
│  │  │ │  - Check token on-chain          │   │     │          │
│  │  │ └──────────────────────────────────┘   │     │          │
│  │  └──────────────────┬─────────────────────┘     │          │
│  │                     │                            │          │
│  └─────────────────────┼────────────────────────────┘          │
│                        │                                        │
│  ┌─────────────────────▼──────────────────────┐               │
│  │     ALGORAND BLOCKCHAIN                    │               │
│  │  ┌──────────────────────────────────────┐  │               │
│  │  │  Student ID Token (ASA)              │  │               │
│  │  │  - Non-transferable                  │  │               │
│  │  │  - User Holdings: Balance            │  │               │
│  │  │  - Can be clawed back                │  │               │
│  │  └──────────────────────────────────────┘  │               │
│  │  ┌──────────────────────────────────────┐  │               │
│  │  │  Club Member Token (ASA)             │  │               │
│  │  │  - Non-transferable                  │  │               │
│  │  │  - User Holdings: Balance            │  │               │
│  │  │  - Can be clawed back                │  │               │
│  │  └──────────────────────────────────────┘  │               │
│  └──────────────────────────────────────────────┘               │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

## Token Flow Diagram

### Issuance Flow
```
┌───────────────────────────────────────┐
│  Admin Issues Student ID Token        │
├───────────────────────────────────────┤
│                                       │
│  1. Admin enters student wallet       │
│     Example: AAAAA...ZZZZZ            │
│                                       │
│  2. Admin clicks "Issue Token"        │
│     └─→ Frontend calls smart contract │
│                                       │
│  3. Smart contract:                   │
│     - Verifies sender is creator      │
│     - Transfers 1 token from admin    │
│       to student wallet               │
│                                       │
│  4. Algorand blockchain:              │
│     Student wallet balance:           │
│     0 → 1                             │
│                                       │
│  5. Student can now apply!            │
│     "Apply" button becomes enabled    │
│                                       │
└───────────────────────────────────────┘
```

### Revocation Flow
```
┌───────────────────────────────────────┐
│  Admin Revokes Student ID Token       │
├───────────────────────────────────────┤
│                                       │
│  1. Admin enters student wallet       │
│     (who violated rules)              │
│                                       │
│  2. Admin clicks "Revoke Token"       │
│     └─→ Frontend calls smart contract │
│                                       │
│  3. Smart contract clawback:          │
│     - Uses clawback permission        │
│     - Transfers token from student    │
│       to admin account                │
│                                       │
│  4. Algorand blockchain:              │
│     Student wallet balance:           │
│     1 → 0                             │
│                                       │
│  5. Student access INSTANTLY gone!    │
│     "Apply" button becomes disabled   │
│                                       │
└───────────────────────────────────────┘
```

## Frontend Decision Tree

### Apply Button Logic
```
┌─────────────────────────────────┐
│  User opens ScholarshipDashboard │
└────────────┬────────────────────┘
             │
      ┌──────▼──────────┐
      │  Is wallet      │
      │  connected?     │
      └───┬──────┬──────┘
    NO    │     YES
    ┌─────▼──┐   │
    │ Button │   └────────┐
    │disabled│            │
    │"Conn.  │      ┌──────▼──────────┐
    │Wallet" │      │  Call Algorand  │
    └────────┘      │  indexer:       │
                    │  Asset balance  │
                    │  for Student ID │
                    └────┬────────┬───┘
              Balance>=1 │        │ Balance==0
              (HAS ID)   │        │ (NO ID)
                    ┌────▼───┐   ┌───▼────┐
                    │ Button │   │ Button │
                    │ enabled│   │disabled│
                    │"Apply" │   │"Get ID"│
                    └─────────   ├────────┤
                                 │Message:│
                                 │Must get│
                                 │Student │
                                 │ID Token│
                                 └────────┘
```

### Vote Button Logic
```
┌──────────────────────────────────┐
│  User opens ScholarshipDashboard  │
└────────────┬─────────────────────┘
             │
      ┌──────▼──────────┐
      │  Is wallet      │
      │  connected?     │
      └───┬──────┬──────┘
    NO    │     YES
    ┌─────▼──┐   │
    │ Buttons│   └────────┐
    │disabled│            │
    │"Conn.  │      ┌──────▼──────────┐
    │Wallet" │      │  Call Algorand  │
    └────────┘      │  indexer:       │
                    │  Asset balance  │
                    │  for Club Member│
                    └────┬────────┬───┘
             Balance>=1 │        │ Balance==0
             (MEMBER)   │        │ (NOT MEMBER)
                    ┌────▼──┐  ┌──▼─────┐
                    │ Buttons│ │ Buttons│
                    │enabled │ │disabled│
                    │"Vote"  │ │"Get    │
                    │        │ │Member" │
                    └────────┘ └────┬───┘
                                   │
                            ┌──────▼───┐
                            │ Message: │
                            │Must be   │
                            │Club      │
                            │Member    │
                            └──────────┘
```

## Smart Contract Verification Flow

### Application Submission
```
User clicks "Apply"
      │
      ▼
Frontend Validation
├─ Button enabled? YES (has Student ID)
├─ Form filled? YES
└─ Proceed to contract call
      │
      ▼
Smart Contract Receives Call
├─ Method: apply_for_scholarship()
└─ Sender: User's wallet
      │
      ▼
Contract Verification
├─ Is Student ID ASA configured?
│  └─ YES: Check balance
│         │
│         ▼
│         User balance of Student ID token
│         │
│         ├─ >= 1 → PASS ✓
│         └─ == 0 → FAIL ✗
│                  "Must hold Student ID Token"
│
└─ NO: Skip check (not configured)
      │
      ▼
Decision
├─ PASS → Store application on blockchain
└─ FAIL → Reject transaction
```

## Access Control Matrix

```
┌──────────────────┬─────────────────┬─────────────────┐
│ User Status      │ Frontend UI      │ Smart Contract  │
├──────────────────┼─────────────────┼─────────────────┤
│ Student ID Token │ Apply: Enabled  │ apply: Allowed  │
│ ✓ Has            │ Vote: Locked    │ vote: Blocked   │
├──────────────────┼─────────────────┼─────────────────┤
│ Club Member      │ Apply: Locked   │ apply: Blocked  │
│ ✓ Has            │ Vote: Enabled   │ vote: Allowed   │
├──────────────────┼─────────────────┼─────────────────┤
│ Both Tokens      │ Apply: Enabled  │ apply: Allowed  │
│ ✓ Student ID     │ Vote: Enabled   │ vote: Allowed   │
│ ✓ Club Member    │                 │                 │
├──────────────────┼─────────────────┼─────────────────┤
│ No Tokens        │ Apply: Locked   │ apply: Blocked  │
│ ✗ Neither        │ Vote: Locked    │ vote: Blocked   │
├──────────────────┼─────────────────┼─────────────────┤
│ Revoked          │ Apply: Locked   │ apply: Blocked  │
│ ✗ Was issued,    │ Vote: Locked    │ vote: Blocked   │
│   then revoked   │                 │                 │
└──────────────────┴─────────────────┴─────────────────┘
```

## File Structure

```
Scholarship Platform/
│
├── Smart Contracts (PyTeal)
│   ├── contracts/smart_contracts/
│   │   ├── identity/
│   │   │   ├── contract.py           ← Token management
│   │   │   ├── deploy_config.py      ← Deploy config
│   │   │   └── __init__.py
│   │   ├── bank/
│   │   │   └── contract.py           ← Apply with access control
│   │   └── counter/
│   │       └── contract.py           ← Vote with access control
│   │
│   └── Documentation
│       ├── ASA_DEPLOYMENT_GUIDE.md   ← Setup steps
│       └── DEVELOPER_GUIDE.md        ← Contract reference
│
├── Frontend (React/TypeScript)
│   ├── frontend/src/
│   │   ├── components/
│   │   │   ├── AdminIdentityTokens.tsx   ← Token management UI
│   │   │   └── ScholarshipDashboard.tsx  ← Platform with access checks
│   │   └── utils/
│   │       ├── assetUtils.ts         ← Token validation functions
│   │       └── scholarshipUtils.ts   ← Helper functions
│   │
│   └── CSS/Styling
│       └── styles/main.css           ← Tailwind styling
│
└── Documentation
    ├── IMPLEMENTATION_COMPLETE.md    ← You are here
    ├── ASA_COMPLETE_GUIDE.md         ← Overview & learning path
    ├── ASA_ACCESS_CONTROL_SUMMARY.md ← Quick reference
    ├── ACCESS_CONTROL_DESIGN.md      ← Technical deep dive
    ├── 00_START_HERE.md              ← Entry point
    └── ... (other docs)
```

## Configuration Checklist

### Before Testnet Deployment
```
SMART CONTRACTS:
☐ IdentityTokens contract compiled (PyTeal syntax OK)
☐ ScholarshipPool contract compiled (with Student ID ASA field)
☐ ScholarshipVoting contract compiled (with Club Member ASA field)

BLOCKCHAIN:
☐ Student ID Token ASA created (non-transferable)
  Note: ASA ID = ___________
☐ Club Member Token ASA created (non-transferable)
  Note: ASA ID = ___________

SMART CONTRACT CONFIG:
☐ IdentityTokens deployed
  App ID: ___________
☐ ScholarshipPool deployed
  App ID: ___________
  Called: set_student_id_asa(<STUDENT_ID_ASA_ID>)
☐ ScholarshipVoting deployed
  App ID: ___________
  Called: set_club_member_asa(<CLUB_MEMBER_ASA_ID>)

FRONTEND CONFIG:
☐ Updated ScholarshipDashboard.tsx with ASA IDs
  STUDENT_ID_ASA_ID = ___________
  CLUB_MEMBER_ASA_ID = ___________
☐ Frontend compiles without errors
☐ Algorand node accessible from frontend

TESTING:
☐ Issue test tokens to admin wallet
☐ Issue test tokens to student wallet
☐ Issue test tokens to voter wallet
☐ Verify UI updates correctly when tokens issued
☐ Test revocation
☐ Test complete workflow
```

## Key Terminal Commands

### Check Account Assets
```bash
goal account info -a <WALLET_ADDRESS>
```

### View ASA Details
```bash
goal asset info --id <ASA_ID>
```

### Deploy Contract
```bash
algokit project deploy --network testnet
```

### Query Blockchain
```bash
goal block info <BLOCK_NUMBER>
```

## Important URLs

### Testnet
- AlgoExplorer: https://testnet.algoexplorer.io
- Faucet: https://dispenser.testnet.aws.algodev.network
- Algodea: https://testnet-algodea.1-algo.com

### Mainnet
- AlgoExplorer: https://algoexplorer.io
- Algorand Network: https://www.algorand.com

## Quick Reference: Function Signatures

### Frontend (assetUtils.ts)
```typescript
checkAssetHolding(wallet, asaId, algorand): Promise<boolean>
getAssetBalance(wallet, asaId, algorand): Promise<number>
hasStudentId(wallet, studentIdAsaId, algorand): Promise<boolean>
hasClubMember(wallet, clubMemberAsaId, algorand): Promise<boolean>
optInToAsset(asaId, algorand): Promise<string>
getAssetInfo(asaId, wallet, algorand): Promise<AssetInfo | null>
isAssetFrozen(wallet, asaId, algorand): Promise<boolean>
checkAccessControl(wallet, studentId?, clubId?, algorand?): Promise<AccessControlStatus>
```

### Smart Contracts (PyTeal)
```python
# IdentityTokens
set_student_id_asa(asa_id: UInt64) -> None
set_club_member_asa(asa_id: UInt64) -> None
issue_student_id(student: Account) -> None
issue_club_member(member: Account) -> None
revoke_student_id(student: Account) -> None
revoke_club_member(member: Account) -> None
has_student_id(user: Account) -> bool
has_club_member(user: Account) -> bool

# ScholarshipPool
apply_for_scholarship() -> UInt64  # With Student ID check
set_student_id_asa(asa_id: UInt64) -> None

# ScholarshipVoting
vote_for_application(application_id: UInt64) -> UInt64  # With Club Member check
set_club_member_asa(asa_id: UInt64) -> None
```

## Troubleshooting Quick Guide

| Problem | Check | Solution |
|---------|-------|----------|
| Button stays disabled | Frontend config | Verify STUDENT_ID_ASA_ID in code |
| Token won't issue | User opted in? | Call optInToAsset() first |
| Apply fails on-chain | ASA configured? | Call set_student_id_asa() on contract |
| Revoke fails | Admin permission? | Verify clawback field in ASA info |
| Wrong network | Network setting | Update to testnet or mainnet |
| Token not showing | Indexer running? | Ensure Algorand node accessible |
| Different ASA IDs | Testnet vs Mainnet | Use correct IDs for network |

---

**Print this page as reference while testing!**

