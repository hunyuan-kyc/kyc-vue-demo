export interface KycInfo {
  ensName: string
  level: number
  status: number
  expirationTime: bigint
  ensNode: `0x${string}`
  isWhitelisted: boolean
} 