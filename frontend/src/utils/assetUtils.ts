import { AlgorandClient } from '@algorandfoundation/algokit-utils'

/**
 * Asset validation utilities for ASA-based access control
 */

export interface AssetHolding {
  assetId: number
  balance: number
  frozen: boolean
}

/**
 * Check if a wallet holds a specific ASA
 */
export async function checkAssetHolding(
  walletAddress: string,
  assetId: number,
  algorand: AlgorandClient
): Promise<boolean> {
  try {
    const accountInfo = await algorand.client.algod.accountInformation(walletAddress).do()
    const assets = accountInfo.assets || []

    const holding = assets.find((a: any) => a['asset-id'] === assetId)
    return holding && holding.amount > 0
  } catch (error) {
    console.error('Error checking asset holding:', error)
    return false
  }
}

/**
 * Get asset balance for a wallet
 */
export async function getAssetBalance(
  walletAddress: string,
  assetId: number,
  algorand: AlgorandClient
): Promise<number> {
  try {
    const accountInfo = await algorand.client.algod.accountInformation(walletAddress).do()
    const assets = accountInfo.assets || []

    const holding = assets.find((a: any) => a['asset-id'] === assetId)
    return holding ? holding.amount : 0
  } catch (error) {
    console.error('Error getting asset balance:', error)
    return 0
  }
}

/**
 * Check if wallet has Student ID token
 */
export async function hasStudentId(
  walletAddress: string,
  studentIdAsaId: number,
  algorand: AlgorandClient
): Promise<boolean> {
  if (!studentIdAsaId) return false
  return checkAssetHolding(walletAddress, studentIdAsaId, algorand)
}

/**
 * Check if wallet has Club Member token
 */
export async function hasClubMember(
  walletAddress: string,
  clubMemberAsaId: number,
  algorand: AlgorandClient
): Promise<boolean> {
  if (!clubMemberAsaId) return false
  return checkAssetHolding(walletAddress, clubMemberAsaId, algorand)
}

/**
 * Opt-in to an ASA (required before receiving it)
 */
export async function optInToAsset(
  assetId: number,
  algorand: AlgorandClient
): Promise<string> {
  try {
    const transaction = await algorand.transactions.assetOptIn({
      assetId,
      account: algorand.config.defaultSender!,
    })

    const result = await algorand.transactions.send(transaction)
    return result.confirmation?.txid || ''
  } catch (error) {
    console.error('Error opting in to asset:', error)
    throw error
  }
}

/**
 * Get detailed asset info
 */
export interface AssetInfo {
  id: number
  name: string
  unitName: string
  decimals: number
  total: number
  frozen: boolean
  balance: number
}

export async function getAssetInfo(
  assetId: number,
  walletAddress: string,
  algorand: AlgorandClient
): Promise<AssetInfo | null> {
  try {
    const assetInfo = await algorand.client.algod.getAssetByID(assetId).do()
    const balance = await getAssetBalance(walletAddress, assetId, algorand)

    return {
      id: assetInfo.index,
      name: assetInfo.params.name || 'Unknown',
      unitName: assetInfo.params['unit-name'] || 'Unknown',
      decimals: assetInfo.params.decimals || 0,
      total: assetInfo.params.total || 0,
      frozen: assetInfo.params.frozen || false,
      balance,
    }
  } catch (error) {
    console.error('Error getting asset info:', error)
    return null
  }
}

/**
 * Check asset transfer status
 */
export async function isAssetFrozen(
  walletAddress: string,
  assetId: number,
  algorand: AlgorandClient
): Promise<boolean> {
  try {
    const accountInfo = await algorand.client.algod.accountInformation(walletAddress).do()
    const assets = accountInfo.assets || []

    const holding = assets.find((a: any) => a['asset-id'] === assetId)
    return holding ? holding['is-frozen'] : false
  } catch (error) {
    console.error('Error checking if asset is frozen:', error)
    return false
  }
}

/**
 * Access control checks
 */
export interface AccessControlStatus {
  canApply: boolean
  canVote: boolean
  studentIdBalance: number
  clubMemberBalance: number
  reasons: string[]
}

export async function checkAccessControl(
  walletAddress: string,
  studentIdAsaId: number,
  clubMemberAsaId: number,
  algorand: AlgorandClient
): Promise<AccessControlStatus> {
  const reasons: string[] = []
  let studentIdBalance = 0
  let clubMemberBalance = 0

  // Check Student ID
  if (studentIdAsaId) {
    studentIdBalance = await getAssetBalance(walletAddress, studentIdAsaId, algorand)
    if (studentIdBalance === 0) {
      reasons.push('Student ID Token required to apply')
    }
  }

  // Check Club Member
  if (clubMemberAsaId) {
    clubMemberBalance = await getAssetBalance(walletAddress, clubMemberAsaId, algorand)
    if (clubMemberBalance === 0) {
      reasons.push('Club Member Token required to vote')
    }
  }

  return {
    canApply: studentIdBalance > 0 || !studentIdAsaId,
    canVote: clubMemberBalance > 0 || !clubMemberAsaId,
    studentIdBalance,
    clubMemberBalance,
    reasons,
  }
}
