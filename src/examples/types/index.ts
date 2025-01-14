export enum KycLevel {
  NONE,
  BASIC,
  ADVANCED,
  PREMIUM
}

export enum KycStatus {
  NONE,
  PENDING,
  APPROVED,
  REJECTED,
  REVOKED
}

export interface KycInfo {
  ensName: string
  level: KycLevel
  status: KycStatus
  expirationTime: bigint
  ensNode: `0x${string}`
  isWhitelisted: boolean
} 