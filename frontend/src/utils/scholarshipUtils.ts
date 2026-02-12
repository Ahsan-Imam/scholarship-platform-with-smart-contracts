// Scholarship platform utilities and helper functions

export interface DonationRecord {
  donor: string
  amount: number
  timestamp: number
  txnId: string
}

export interface ScholarshipApplication {
  studentId: string
  name: string
  type: 'emergency' | 'hackathon' | 'merit'
  ipfsHash: string
  votes: number
  awarded: boolean
  awardAmount: number
}

export interface ScholarshipStats {
  totalFundsRaised: number
  totalApplications: number
  totalVotes: number
  awardsDistributed: number
  badgesIssued: number
}

/**
 * Format ALGO amount from microAlgos
 */
export function formatAlgo(microAlgos: number | bigint): string {
  const num = typeof microAlgos === 'bigint' ? Number(microAlgos) : microAlgos
  return (num / 1_000_000).toFixed(6).replace(/\.?0+$/, '')
}

/**
 * Format wallet address (abbreviated)
 */
export function ellipseAddress(address: string, chars = 4): string {
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`
}

/**
 * Get scholarship type label with emoji
 */
export function getScholarshipLabel(type: 'emergency' | 'hackathon' | 'merit'): string {
  const labels: Record<string, string> = {
    emergency: '🚨 Emergency Aid',
    hackathon: '💻 Hackathon Grant',
    merit: '🎓 Merit Scholarship',
  }
  return labels[type] || type
}

/**
 * Calculate scholarship stats from application data
 */
export function calculateStats(
  donations: DonationRecord[],
  applications: ScholarshipApplication[]
): ScholarshipStats {
  const awarded = applications.filter((a) => a.awarded)
  return {
    totalFundsRaised: donations.reduce((sum, d) => sum + d.amount, 0),
    totalApplications: applications.length,
    totalVotes: applications.reduce((sum, a) => sum + a.votes, 0),
    awardsDistributed: awarded.length,
    badgesIssued: awarded.length,
  }
}

/**
 * Sort applications by vote count (descending)
 */
export function sortByVotes(applications: ScholarshipApplication[]): ScholarshipApplication[] {
  return [...applications].sort((a, b) => b.votes - a.votes)
}

/**
 * Filter applications by type
 */
export function filterByType(
  applications: ScholarshipApplication[],
  type: 'emergency' | 'hackathon' | 'merit'
): ScholarshipApplication[] {
  return applications.filter((a) => a.type === type)
}

/**
 * Check if funding goal is met
 */
export function isFundingGoalMet(totalFunds: number, goal: number): boolean {
  return totalFunds >= goal
}
