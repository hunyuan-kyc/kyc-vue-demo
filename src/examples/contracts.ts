import { parseAbi } from 'viem'
import { VITE_KYC_SBT_ADDRESS } from '../config/contracts'

export { VITE_KYC_SBT_ADDRESS }

export const KYC_ABI = parseAbi([
  // 事件
  'event KycRequested(address indexed user, string ensName)',
  'event KycRejected(address indexed user, string reason)',
  'event KycLevelUpdated(address indexed user, uint8 oldLevel, uint8 newLevel)',
  'event KycStatusUpdated(address indexed user, uint8 status)',
  'event KycRevoked(address indexed user)',
  'event AddressApproved(address indexed user, uint8 level)',

  // 用户函数
  'function requestKyc(string calldata ensName) external payable',
  'function requestKycAndApprove(string calldata ensName) external payable',
  'function isHuman(address account) external view returns (bool, uint8)',
  'function kycInfos(address) external view returns (string, uint8, uint8, uint256, bytes32, bool)',

  // 管理员函数
  'function approve(address user, uint8 level) external',
  'function reject(address user, string calldata reason) external',
  'function revokeKyc(address user) external',
  'function addAdmin(address admin) external',
  'function removeAdmin(address admin) external',

  // 所有者函数
  'function setRegistrationFee(uint256 newFee) external',
  'function setMinNameLength(uint256 newLength) external',
  'function setSuffix(string calldata newSuffix) external',
  'function setENSAndResolver(address _ens, address _resolver) external',
  'function transferOwnership(address newOwner) external',
  'function withdrawFees() external',
  
  // 查询函数
  'function registrationFee() external view returns (uint256)',
  'function minNameLength() external view returns (uint256)',
  'function suffix() external view returns (string)',
]) 