# ASA-Based Access Control Deployment Guide

This guide explains how to deploy and configure the non-transferable ASA (Algorand Standard Asset) identity tokens for the scholarship platform.

## Overview

The scholarship platform uses two non-transferable ASAs for role-based access control:
- **Student ID Token (ASA)**: Required to apply for scholarships
- **Club Member Token (ASA)**: Required to vote on scholarship applications

## Prerequisites

1. **Algorand Node/Indexer**: Access to Algorand testnet or mainnet
2. **Admin Wallet**: Wallet with sufficient ALGO for contract deployment and ASA creation (~1-2 ALGO)
3. **AlgoKit**: Installed and configured
4. **PyTeal**: For smart contract development

## Deployment Steps

### Step 1: Create the Non-Transferable ASAs

Non-transferable ASAs prevent users from selling or trading their identity tokens. This ensures tokens represent actual identity/role, not tradeable assets.

#### Create Student ID Token

```bash
goal asset create \
  --creator <ADMIN_WALLET_ADDRESS> \
  --name "Student ID Token" \
  --unitname "SID" \
  --total 1000000 \
  --decimals 0 \
  --defaultfrozen \
  --manager <ADMIN_WALLET_ADDRESS> \
  --reserve <ADMIN_WALLET_ADDRESS> \
  --clawback <ADMIN_WALLET_ADDRESS> \
  --freeze <ADMIN_WALLET_ADDRESS>
```

**Result**: Note the ASA ID (e.g., `1001`)

#### Create Club Member Token

```bash
goal asset create \
  --creator <ADMIN_WALLET_ADDRESS> \
  --name "Club Member Token" \
  --unitname "CMT" \
  --total 1000000 \
  --decimals 0 \
  --defaultfrozen \
  --manager <ADMIN_WALLET_ADDRESS> \
  --reserve <ADMIN_WALLET_ADDRESS> \
  --clawback <ADMIN_WALLET_ADDRESS> \
  --freeze <ADMIN_WALLET_ADDRESS>
```

**Result**: Note the ASA ID (e.g., `1002`)

### Step 2: Deploy Smart Contracts

#### Deploy IdentityTokens Contract

This contract manages token issuance and revocation.

```python
# In contracts/smart_contracts/identity/contract.py
# Update the deploy_config.py with:

{
    "name": "IdentityTokens",
    "version": "1.0.0",
    "verified": False,
    "global_state": {
        "student_id_asa": UInt64,
        "club_member_asa": UInt64,
    }
}
```

Deploy using AlgoKit:
```bash
algokit project deploy
```

**Configuration**:
```python
# After deployment, call:
contract.set_student_id_asa(1001)  # Student ID Token ASA ID
contract.set_club_member_asa(1002)  # Club Member Token ASA ID
```

#### Deploy ScholarshipPool Contract

Update `smart_contracts/bank/contract.py`:

```python
# In deploy_config.py
{
    "name": "ScholarshipPool",
    "global_state": {
        "student_id_asa": UInt64,  # NEW
        # ... existing fields
    }
}
```

After deployment:
```python
contract.set_student_id_asa(1001)  # Link to Student ID Token
```

#### Deploy ScholarshipVoting Contract

Update `smart_contracts/counter/contract.py`:

```python
# In deploy_config.py
{
    "name": "ScholarshipVoting",
    "global_state": {
        "club_member_asa": UInt64,  # NEW
        # ... existing fields
    }
}
```

After deployment:
```python
contract.set_club_member_asa(1002)  # Link to Club Member Token
```

### Step 3: Configure Frontend

Update the ASA IDs in the frontend components:

#### ScholarshipDashboard.tsx

```typescript
// /frontend/src/components/ScholarshipDashboard.tsx
const STUDENT_ID_ASA_ID = 1001  // Update with actual ASA ID
const CLUB_MEMBER_ASA_ID = 1002  // Update with actual ASA ID
```

#### AdminIdentityTokens.tsx

```typescript
// /frontend/src/components/AdminIdentityTokens.tsx
const IDENTITY_CONTRACT_ID = 12345  // Update with contract ID
```

### Step 4: Issue Identity Tokens

Using the AdminIdentityTokens component:

1. **For Students**:
   - Navigate to Admin Panel → Identity Tokens → Issue Tab
   - Select "Student ID Token"
   - Enter student wallet address
   - Click "Issue Student ID Token"

2. **For Voters**:
   - Navigate to Admin Panel → Identity Tokens → Issue Tab
   - Select "Club Member Token"
   - Enter voter wallet address
   - Click "Issue Club Member Token"

Or use the smart contract directly:

```python
# Issue Student ID Token
contract.issue_student_id(student_wallet)

# Issue Club Member Token
contract.issue_club_member(voter_wallet)
```

## Access Control Flow

### Application Flow
1. Student connects wallet
2. Frontend calls `hasStudentId(wallet, STUDENT_ID_ASA_ID, algorand)`
3. If balance >= 1: Show "Apply" button (enabled)
4. If balance == 0: Show "Apply" button (disabled) with message "Must hold Student ID Token"
5. On submit, smart contract verifies:
   ```python
   student_balance = Txn.sender.asset_holding(self.student_id_asa).balance
   assert student_balance >= UInt64(1), "Must hold Student ID Token to apply"
   ```

### Voting Flow
1. Voter connects wallet
2. Frontend calls `hasClubMember(wallet, CLUB_MEMBER_ASA_ID, algorand)`
3. If balance >= 1: Show "Vote" button (enabled)
4. If balance == 0: Show "Vote" button (disabled) with message "Must hold Club Member Token"
5. On submit, smart contract verifies:
   ```python
   voter_balance = Txn.sender.asset_holding(self.club_member_asa).balance
   assert voter_balance >= UInt64(1), "Must hold Club Member Token to vote"
   ```

## Token Revocation

To revoke a token from a user (e.g., if they violated rules):

**Via AdminIdentityTokens Component**:
1. Navigate to Admin Panel → Identity Tokens → Revoke Tab
2. Select token type (Student ID or Club Member)
3. Enter wallet address
4. Click "Revoke Token"

**Direct Method**:
```python
# Revoke Student ID Token
contract.revoke_student_id(student_wallet)

# Revoke Club Member Token
contract.revoke_club_member(voter_wallet)
```

**How it works**:
- Admin calls `revoke_student_id(wallet)`
- Smart contract transfers token from user to admin (clawback)
- User's balance becomes 0
- User is immediately unable to apply/vote

## Asset Opt-In

Users must opt-in to ASAs before receiving tokens. This is typically automatic when:
1. Admin issues token
2. Smart contract call includes foreign asset reference

If manual opt-in needed:
```typescript
// frontend/src/utils/assetUtils.ts
await optInToAsset(STUDENT_ID_ASA_ID, algorand)
await optInToAsset(CLUB_MEMBER_ASA_ID, algorand)
```

## Testnet vs Mainnet

### Testnet Configuration
- Use AlgoKit default: `--network testnet`
- Create test ASAs for development
- Use test wallet addresses
- Minimal cost: ~1-2 test ALGO

### Mainnet Configuration
- Use: `--network mainnet`
- Create official ASAs
- Use real wallet addresses
- Real cost: ~0.001 ALGO per transaction

**Important**: Testnet and mainnet have separate ASA IDs. After mainnet deployment, update:
```typescript
const STUDENT_ID_ASA_ID = 1000001  // Mainnet ID
const CLUB_MEMBER_ASA_ID = 1000002  // Mainnet ID
```

## Security Considerations

### Non-Transferable Design
- ASAs created with `--defaultfrozen` and `--freeze <ADMIN>`
- Users cannot transfer tokens to others
- Prevents black market for identity tokens
- Admin can unfreeze for special cases if needed

### Clawback Authorization
- Admin has clawback permission
- Allows immediate revocation if needed
- Required for revoking tokens

### Admin Security
- Store admin private key securely
- Use hardware wallet for mainnet
- Implement access control on admin functions
- Audit all token issuance/revocation

### Indexer Queries
- Frontend uses Algorand indexer for checking balances
- No smart contract call overhead for verification
- Faster user experience
- Public query (no private data exposed)

## Monitoring & Verification

### Check Token Holdings
```bash
# Query a user's assets
goal account info -a <USER_WALLET>
```

### View ASA Details
```bash
# List all ASAs
goal asset info --id <ASA_ID>
```

### Monitor Transactions
- Use AlgoExplorer: https://testnet.algoexplorer.io
- Search by wallet address or ASA ID
- View token issuance/revocation history

## Troubleshooting

### Issue: User can't receive token
**Solution**: User must opt-in to ASA first
```bash
goal asset optin --assetid <ASA_ID>
```

### Issue: Revoke fails
**Solution**: Ensure admin has clawback permission
```bash
goal asset info --id <ASA_ID>  # Verify clawback field
```

### Issue: Apply/Vote buttons disabled despite holding token
**Solution**: Check if ASA IDs are correct in code
```typescript
// Verify in browser console
console.log('STUDENT_ID_ASA_ID:', STUDENT_ID_ASA_ID)
console.log('CLUB_MEMBER_ASA_ID:', CLUB_MEMBER_ASA_ID)
```

### Issue: Indexer queries timeout
**Solution**: Ensure Algorand node/indexer is running
```bash
algokit project run
```

## Examples

### Complete Deployment Script
```bash
#!/bin/bash

# 1. Create Student ID Token
STUDENT_ASA=$(goal asset create \
  --creator $ADMIN_WALLET \
  --name "Student ID" \
  --unitname "SID" \
  --total 1000000 \
  --decimals 0 \
  --defaultfrozen \
  --manager $ADMIN_WALLET \
  --reserve $ADMIN_WALLET \
  --clawback $ADMIN_WALLET \
  --freeze $ADMIN_WALLET | jq '.["asset-index"]')

# 2. Create Club Member Token
CLUB_ASA=$(goal asset create \
  --creator $ADMIN_WALLET \
  --name "Club Member" \
  --unitname "CMT" \
  --total 1000000 \
  --decimals 0 \
  --defaultfrozen \
  --manager $ADMIN_WALLET \
  --reserve $ADMIN_WALLET \
  --clawback $ADMIN_WALLET \
  --freeze $ADMIN_WALLET | jq '.["asset-index"]')

echo "Student ID ASA: $STUDENT_ASA"
echo "Club Member ASA: $CLUB_ASA"

# 3. Deploy contracts
algokit project deploy --network testnet

# 4. Configure contracts
# (Use AdminIdentityTokens component or direct contract calls)
```

### Frontend Integration Example
```typescript
// Check access and show appropriate UI
const checkAndApply = async () => {
  const status = await checkAccessControl(
    walletAddress,
    STUDENT_ID_ASA_ID,
    CLUB_MEMBER_ASA_ID,
    algorand
  )

  if (!status.canApply) {
    alert(`Cannot apply: ${status.reasons[0]}`)
    return
  }

  // Proceed with application
  await submitApplication()
}
```

## Next Steps

1. ✅ Deploy contracts with ASA support
2. ✅ Create non-transferable ASAs
3. ✅ Configure ASA IDs in frontend
4. ✅ Issue tokens to test users
5. ✅ Test access control flows
6. ✅ Monitor on blockchain explorer
7. ✅ Deploy to mainnet (if ready)

## Additional Resources

- [Algorand ASA Documentation](https://developer.algorand.org/docs/asa/asa-index/)
- [Non-Fungible Tokens](https://developer.algorand.org/docs/asa/nfts/)
- [AlgoKit Deployments](https://algorandfoundation.github.io/algokit-cli/)
- [PyTeal Documentation](https://pyteal.readthedocs.io/)

