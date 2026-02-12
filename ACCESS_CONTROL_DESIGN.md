# Scholarship Platform Access Control System

## Overview

The scholarship platform implements **Algorand Standard Asset (ASA)-based role-based access control** to manage who can apply for scholarships and who can vote on applications.

### Key Design Principles

1. **Non-Transferable Identity Tokens**: ASAs created as non-fungible identity credentials that users cannot trade or sell
2. **Admin-Controlled Lifecycle**: Only administrators can issue and revoke tokens
3. **Instant Access Revocation**: Clawback functionality allows immediate token revocation
4. **Decentralized Verification**: Smart contracts verify token holdings on-chain; frontend validates using Algorand indexer
5. **User-Friendly Restrictions**: Clear messaging when users lack required tokens

## Architecture

### Three-Layer Access Control

```
┌─────────────────────────────────────────────────────────┐
│  SMART CONTRACTS (On-Chain Validation)                  │
├─────────────────────────────────────────────────────────┤
│  ScholarshipPool      → Requires Student ID Token      │
│  ScholarshipVoting    → Requires Club Member Token     │
│  IdentityTokens       → Issues/Revokes tokens          │
└─────────────────────────────────────────────────────────┘
         ▲
         │ Verification
         │
┌─────────────────────────────────────────────────────────┐
│  ALGORAND BLOCKCHAIN (Token Storage)                    │
├─────────────────────────────────────────────────────────┤
│  User Accounts       → Hold ASA balances                │
│  ASA Ledger          → Non-transferable identity tokens │
└─────────────────────────────────────────────────────────┘
         ▲
         │ Query
         │
┌─────────────────────────────────────────────────────────┐
│  FRONTEND VALIDATION (User Experience)                  │
├─────────────────────────────────────────────────────────┤
│  assetUtils.ts       → Check token balances             │
│  ScholarshipDashboard→ Show/Hide buttons                │
│  AdminIdentityTokens → Issue/Revoke tokens              │
└─────────────────────────────────────────────────────────┘
```

## Components

### 1. Smart Contracts

#### IdentityTokens Contract
**Location**: `/contracts/smart_contracts/identity/contract.py`

Manages all identity token operations:

```python
class IdentityTokens(ARC4Contract):
    # Configuration
    student_id_asa: UInt64
    club_member_asa: UInt64
    
    # Admin Methods
    @external
    def set_student_id_asa(self, asa_id: UInt64) -> None:
        """Configure Student ID token ASA ID"""
        assert Txn.sender == Global.creator_address, "Only creator"
        self.student_id_asa = asa_id
    
    @external
    def set_club_member_asa(self, asa_id: UInt64) -> None:
        """Configure Club Member token ASA ID"""
        assert Txn.sender == Global.creator_address, "Only creator"
        self.club_member_asa = asa_id
    
    # Issuance Methods
    @external
    def issue_student_id(self, student: Account) -> None:
        """Issue Student ID token to user"""
        assert Txn.sender == Global.creator_address, "Only creator"
        # Transfer from admin to student
        ITxnGroup.asset_transfer_txn(
            xfer_asset=self.student_id_asa,
            asset_receiver=student,
            asset_amount=UInt64(1),
        )
    
    @external
    def issue_club_member(self, member: Account) -> None:
        """Issue Club Member token to user"""
        assert Txn.sender == Global.creator_address, "Only creator"
        # Transfer from admin to member
        ITxnGroup.asset_transfer_txn(
            xfer_asset=self.club_member_asa,
            asset_receiver=member,
            asset_amount=UInt64(1),
        )
    
    # Revocation Methods
    @external
    def revoke_student_id(self, student: Account) -> None:
        """Revoke Student ID token from user"""
        assert Txn.sender == Global.creator_address, "Only creator"
        # Clawback: transfer from student to admin
        ITxnGroup.asset_transfer_txn(
            xfer_asset=self.student_id_asa,
            asset_sender=student,
            asset_receiver=Global.creator_address,
            asset_amount=Txn.sender.asset_holding(self.student_id_asa).balance,
        )
    
    @external
    def revoke_club_member(self, member: Account) -> None:
        """Revoke Club Member token from user"""
        assert Txn.sender == Global.creator_address, "Only creator"
        # Clawback: transfer from member to admin
        ITxnGroup.asset_transfer_txn(
            xfer_asset=self.club_member_asa,
            asset_sender=member,
            asset_receiver=Global.creator_address,
            asset_amount=Txn.sender.asset_holding(self.club_member_asa).balance,
        )
    
    # Verification Methods
    @external(read_only=True)
    def has_student_id(self, user: Account) -> bool:
        """Check if user holds Student ID token"""
        return user.asset_holding(self.student_id_asa).balance >= UInt64(1)
    
    @external(read_only=True)
    def has_club_member(self, user: Account) -> bool:
        """Check if user holds Club Member token"""
        return user.asset_holding(self.club_member_asa).balance >= UInt64(1)
    
    # Configuration Queries
    @external(read_only=True)
    def get_student_id_asa(self) -> UInt64:
        """Get Student ID ASA ID"""
        return self.student_id_asa
    
    @external(read_only=True)
    def get_club_member_asa(self) -> UInt64:
        """Get Club Member ASA ID"""
        return self.club_member_asa
```

#### ScholarshipPool Contract (Updated)
**Location**: `/contracts/smart_contracts/bank/contract.py`

Key additions for access control:

```python
class ScholarshipPool(ARC4Contract):
    # New fields
    student_id_asa: UInt64  # Student ID token requirement
    
    # Configuration
    @external
    def set_student_id_asa(self, asa_id: UInt64) -> None:
        """Configure Student ID token ASA ID"""
        assert Txn.sender == Global.creator_address, "Only creator"
        self.student_id_asa = asa_id
    
    # Application with access control
    @external
    def apply_for_scholarship(self) -> UInt64:
        """
        Apply for scholarship.
        Requires Student ID token if configured.
        """
        # ACCESS CONTROL: Check Student ID Token
        if self.student_id_asa > UInt64(0):
            student_balance = Txn.sender.asset_holding(
                self.student_id_asa
            ).balance
            assert (
                student_balance >= UInt64(1),
                "Must hold Student ID Token to apply"
            )
        
        # Store application
        app_id = Txn.sender.as_int()
        self.applications[app_id] = Application(
            student=Txn.sender,
            status="pending",
            amount=Txn.amount,
            timestamp=Global.latest_confirmed_block_timestamp(),
        )
        
        return app_id
```

#### ScholarshipVoting Contract (Updated)
**Location**: `/contracts/smart_contracts/counter/contract.py`

Key additions for access control:

```python
class ScholarshipVoting(ARC4Contract):
    # New fields
    club_member_asa: UInt64  # Club Member token requirement
    
    # Configuration
    @external
    def set_club_member_asa(self, asa_id: UInt64) -> None:
        """Configure Club Member token ASA ID"""
        assert Txn.sender == Global.creator_address, "Only creator"
        self.club_member_asa = asa_id
    
    # Voting with access control
    @external
    def vote_for_application(self, application_id: UInt64) -> UInt64:
        """
        Vote for an application.
        Requires Club Member token if configured.
        """
        # ACCESS CONTROL: Check Club Member Token
        if self.club_member_asa > UInt64(0):
            voter_balance = Txn.sender.asset_holding(
                self.club_member_asa
            ).balance
            assert (
                voter_balance >= UInt64(1),
                "Must hold Club Member Token to vote"
            )
        
        # Prevent double voting
        voter_id = Txn.sender.as_int()
        assert not self.has_voted(voter_id), "Already voted"
        
        # Record vote
        app_votes = self.votes.get(application_id, UInt64(0))
        self.votes[application_id] = app_votes + UInt64(1)
        self.voters[voter_id] = True
        
        return self.votes[application_id]
```

### 2. Frontend Utilities

#### assetUtils.ts
**Location**: `/frontend/src/utils/assetUtils.ts`

Provides token validation functions for frontend:

```typescript
// Check if wallet holds specific ASA
export async function checkAssetHolding(
  wallet: string,
  assetId: number,
  algorand: AlgorandClient
): Promise<boolean>

// Get wallet's balance of specific ASA
export async function getAssetBalance(
  wallet: string,
  assetId: number,
  algorand: AlgorandClient
): Promise<number>

// Convenience function: Check Student ID
export async function hasStudentId(
  wallet: string,
  studentIdAsaId: number,
  algorand: AlgorandClient
): Promise<boolean>

// Convenience function: Check Club Member
export async function hasClubMember(
  wallet: string,
  clubMemberAsaId: number,
  algorand: AlgorandClient
): Promise<boolean>

// Opt-in to ASA (required before receiving)
export async function optInToAsset(
  assetId: number,
  algorand: AlgorandClient
): Promise<string>

// Get detailed ASA information
export async function getAssetInfo(
  assetId: number,
  wallet: string,
  algorand: AlgorandClient
): Promise<AssetInfo | null>

// Check if ASA transfers are frozen for user
export async function isAssetFrozen(
  wallet: string,
  assetId: number,
  algorand: AlgorandClient
): Promise<boolean>

// Unified access control check
export async function checkAccessControl(
  wallet: string,
  studentIdAsaId?: number,
  clubMemberAsaId?: number,
  algorand?: AlgorandClient
): Promise<AccessControlStatus>
```

#### Type Definitions

```typescript
interface AssetHolding {
  assetId: number
  balance: number
  isFrozen: boolean
}

interface AssetInfo {
  assetId: number
  name: string
  unitName: string
  total: number
  decimals: number
  manager: string
  reserve: string
  freeze: string
  clawback: string
  isFrozen: boolean
}

interface AccessControlStatus {
  canApply: boolean        // has Student ID (or not required)
  canVote: boolean         // has Club Member (or not required)
  hasStudentId: boolean    // holds Student ID token
  hasClubMember: boolean   // holds Club Member token
  reasons: string[]        // explanation if access denied
}
```

### 3. UI Components

#### AdminIdentityTokens Component
**Location**: `/frontend/src/components/AdminIdentityTokens.tsx`

Three-tab interface for admin token management:

1. **Configure Tab**: Set ASA IDs for Student ID and Club Member tokens
2. **Issue Tab**: Issue tokens to verified users
3. **Revoke Tab**: Revoke tokens from users (for violations, etc.)

#### ScholarshipDashboard Component
**Location**: `/frontend/src/components/ScholarshipDashboard.tsx`

Enhanced with access control:

- **Apply Tab**: Shows access status and disables button if user lacks Student ID token
- **Vote Tab**: Shows access status and disables button if user lacks Club Member token
- Real-time token balance checking via `checkAccessControl()`
- Clear error messages: "Must hold Student ID Token to apply"

## Access Control Flow

### Application Workflow

```
1. User Connects Wallet
   │
2. ScholarshipDashboard mounts
   │
3. Frontend calls: hasStudentId(walletAddress, STUDENT_ID_ASA_ID)
   │
   ├─ Balance >= 1 → "Apply" button ENABLED
   │  │
   │  └─ User clicks "Apply"
   │     │
   │     └─ Frontend submits to smart contract
   │        │
   │        └─ Contract verifies: asset_holding >= 1
   │           │
   │           └─ ACCEPTED → Application stored
   │
   └─ Balance == 0 → "Apply" button DISABLED
      │
      └─ Shows message: "Must hold Student ID Token"
         │
         └─ User sees button is locked
```

### Voting Workflow

```
1. Voter Connects Wallet
   │
2. ScholarshipDashboard mounts
   │
3. Frontend calls: hasClubMember(walletAddress, CLUB_MEMBER_ASA_ID)
   │
   ├─ Balance >= 1 → "Vote" buttons ENABLED
   │  │
   │  └─ User clicks "Vote"
   │     │
   │     └─ Frontend submits to smart contract
   │        │
   │        └─ Contract verifies: asset_holding >= 1
   │           │
   │           └─ ACCEPTED → Vote recorded
   │
   └─ Balance == 0 → "Vote" buttons DISABLED
      │
      └─ Shows message: "Must hold Club Member Token"
         │
         └─ User sees buttons are locked
```

## Token Lifecycle

### Issuance Process

1. **Admin** uses AdminIdentityTokens component
2. **Admin** enters verified user's wallet address
3. **Admin** clicks "Issue Student ID Token" or "Issue Club Member Token"
4. **Smart Contract** transfers 1 token from admin to user
5. **User's wallet** now shows 1 token holding
6. **User** is immediately eligible to apply/vote

### Revocation Process

1. **Admin** detects violation or needs to remove access
2. **Admin** uses AdminIdentityTokens → Revoke tab
3. **Admin** enters user's wallet address
4. **Admin** clicks "Revoke Token"
5. **Smart Contract** claws back token from user
6. **User's balance** becomes 0
7. **User** immediately loses access (can't apply/vote)

## ASA Configuration

### Non-Transferable Design

```bash
goal asset create \
  --creator <ADMIN_WALLET> \
  --name "Student ID Token" \
  --unitname "SID" \
  --total 1000000 \
  --decimals 0 \
  --defaultfrozen              # Tokens start frozen
  --freeze <ADMIN_WALLET>      # Only admin can unfreeze
  --clawback <ADMIN_WALLET>    # Admin can reclaim tokens
```

**Key Properties**:
- **Non-Transferable**: Cannot send to other wallets
- **Non-Fungible**: Each token is unique (identity token, not currency)
- **Revocable**: Admin can instantly clawback
- **Frozen by Default**: Users cannot trade even if unfrozen

### Why This Design?

1. **Prevents Black Markets**: Users can't sell or trade identity tokens
2. **Ensures Authenticity**: Tokens represent actual identity verification
3. **Allows Revocation**: Instant access removal for policy violations
4. **Simple Management**: One token per user (balance >= 1 means "has access")

## Security Architecture

### Contract-Level Security

```python
# 1. Creator-Only Protection
assert Txn.sender == Global.creator_address, "Only creator"

# 2. Token Balance Verification
student_balance = Txn.sender.asset_holding(self.student_id_asa).balance
assert student_balance >= UInt64(1), "Insufficient balance"

# 3. Double-Vote Prevention
assert not self.has_voted(voter), "Already voted"

# 4. State Validation
assert application_exists, "Application not found"
```

### Frontend-Level Security

```typescript
// 1. Pre-Contract Validation
const canApply = await hasStudentId(wallet, STUDENT_ID_ASA_ID)
if (!canApply) {
  showError("Missing required token")
  return
}

// 2. UI State Management
button.disabled = !accessStatus.canApply

// 3. User Guidance
showMessage(accessStatus.reasons[0])
```

### Chain-Level Security

1. **Algorand Consensus**: All transactions immutable
2. **ASA Ledger**: Global record of all holdings
3. **Indexer**: Public, queryable ledger state
4. **Clawback Authorization**: Only admin can revoke

## Admin Responsibilities

### Issuance Guidelines

- ✅ Verify student identity before issuing Student ID token
- ✅ Verify voter eligibility before issuing Club Member token
- ✅ Maintain audit log of issued tokens
- ✅ Communicate token receipt to users

### Revocation Procedures

- ✅ Document reason for revocation
- ✅ Notify user before/after revocation
- ✅ Maintain audit trail
- ✅ Allow appeals/reinstatement process

### Key Management

- ✅ Store admin private key securely
- ✅ Use hardware wallet for mainnet
- ✅ Implement multi-signature for critical operations
- ✅ Regular key rotation policy

## Monitoring & Auditing

### Query Token Holdings

```bash
# Check user's tokens
goal account info -a <USER_WALLET>

# View ASA details
goal asset info --id <ASA_ID>
```

### Track Changes

**AlgoExplorer Dashboard**:
- Search wallet address → See all asset transfers
- Search ASA ID → See token distribution
- View transaction details → Verify issuance/revocation

**On-Chain Verification**:
```python
# Check if user still holds token
from algokit_utils import get_account

account = get_account(wallet_address)
if account.get_asset(ASA_ID).balance >= 1:
    print("User has token")
else:
    print("User revoked or transferred")
```

## Testing Access Control

### Test Case 1: Student Application Without Token
```typescript
const wallet = "STUDENT_WITHOUT_TOKEN"
const status = await checkAccessControl(wallet, STUDENT_ID_ASA_ID)
assert status.canApply === false
assert status.reasons[0].includes("Student ID Token")
```

### Test Case 2: Voter Without Membership
```typescript
const wallet = "VOTER_WITHOUT_MEMBERSHIP"
const status = await checkAccessControl(wallet, CLUB_MEMBER_ASA_ID)
assert status.canVote === false
assert status.reasons[0].includes("Club Member Token")
```

### Test Case 3: Issue and Verify Token
```typescript
const studentWallet = "NEW_STUDENT"
await issueStudentIdToken(studentWallet)  // Via smart contract

const balance = await getAssetBalance(studentWallet, STUDENT_ID_ASA_ID)
assert balance === 1

const status = await checkAccessControl(studentWallet, STUDENT_ID_ASA_ID)
assert status.canApply === true
```

### Test Case 4: Revoke and Verify Loss of Access
```typescript
const studentWallet = "REVOKED_STUDENT"
await revokeStudentIdToken(studentWallet)  // Via smart contract

const balance = await getAssetBalance(studentWallet, STUDENT_ID_ASA_ID)
assert balance === 0

const status = await checkAccessControl(studentWallet, STUDENT_ID_ASA_ID)
assert status.canApply === false
```

## Troubleshooting

### Issue: "Must hold Student ID Token" error
**Solution**: Admin must issue token to user first
```bash
# Check if token issued
goal account info -a <USER_WALLET>

# Issue token if missing
# Use AdminIdentityTokens component
```

### Issue: Frontend button stays disabled despite holding token
**Solution**: Check ASA ID configuration
```typescript
// Verify correct ASA IDs
console.log('Configured Student ID ASA:', STUDENT_ID_ASA_ID)
console.log('Actual token held:', await getAssetBalance(wallet, ASA_ID))
```

### Issue: Revoke fails
**Solution**: Ensure admin has clawback permission
```bash
goal asset info --id <ASA_ID>
# Check clawback field is set to admin wallet
```

## Best Practices

1. **Frontend Validation**: Always check access before showing buttons
2. **User Feedback**: Show clear reason if access denied
3. **Error Handling**: Handle network errors gracefully
4. **Admin Audit**: Log all token issuance/revocation
5. **Security Keys**: Use hardware wallet for admin key
6. **Regular Testing**: Test revocation flow monthly
7. **Documentation**: Explain token requirements to users

## Future Enhancements

- Multi-tier roles (e.g., GOLD/SILVER/BRONZE club membership)
- Expiring tokens (time-based membership)
- SBT (Soulbound Tokens) for permanent achievement badges
- DAO governance for token issuance decisions
- Automated appeal/reinstatement process

