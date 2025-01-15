import { parseAbi } from 'viem'
import { KYC_SBT_ADDRESS } from '../config/contracts'

export { KYC_SBT_ADDRESS }

export const KYC_ABI = parseAbi([
  // 事件
  'event KycRequested(address indexed user, string ensName)',
  'event KycStatusUpdated(address indexed user, uint8 status)',
  'event KycRevoked(address indexed user)',
  'event KycRestored(address indexed user)',

  // 用户函数
  'function requestKyc(string calldata ensName) external payable',
  'function revokeKyc(address user) external',
  'function restoreKyc(address user) external',
  'function getKycInfo(address account) external view returns (string, uint8, uint8, uint256)',
  'function isHuman(address account) external view returns (bool, uint8)',

  // 查询函数
  'function minNameLength() external view returns (uint256)',
  'function suffix() external view returns (string)',
]) 