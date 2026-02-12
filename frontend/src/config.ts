// Smart contract configuration
export const CONTRACT_APP_IDS = {
  scholarshipPool: BigInt(import.meta.env.VITE_SCHOLARSHIP_POOL_APP_ID || 0),
  scholarshipVoting: BigInt(import.meta.env.VITE_SCHOLARSHIP_VOTING_APP_ID || 0),
};

// Network configuration
export const NETWORK_CONFIG = {
  algodServer: import.meta.env.VITE_ALGOD_SERVER,
  algodPort: import.meta.env.VITE_ALGOD_PORT,
  algodToken: import.meta.env.VITE_ALGOD_TOKEN,
  network: import.meta.env.VITE_ALGOD_NETWORK || 'testnet',
  indexerServer: import.meta.env.VITE_INDEXER_SERVER,
  indexerPort: import.meta.env.VITE_INDEXER_PORT,
  indexerToken: import.meta.env.VITE_INDEXER_TOKEN,
};
