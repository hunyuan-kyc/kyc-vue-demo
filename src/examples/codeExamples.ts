export const frontendCode = `import { createPublicClient, createWalletClient, http, type Address, type WalletClient, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { hashkeyTestnet } from 'viem/chains'
import { KYC_SBT_ADDRESS } from '@/config/contracts'
import KycSBTAbi from '@/abis/KycSBT.json'
import { type KycInfo, KycLevel, KycStatus } from '../types/index'

const publicClient = createPublicClient({
  chain: hashkeyTestnet,
  transport: http('https://hk-testnet.rpc.alt.technology')
})

export class UserOperations {
  private client: WalletClient
  private account: Address

  constructor(privateKey: string) {
    const account = privateKeyToAccount(privateKey as \`0x\${string}\`)
    this.account = account.address
    this.client = createWalletClient({
      account,
      chain: hashkeyTestnet,
      transport: http('https://hk-testnet.rpc.alt.technology')
    })
  }

  async requestKyc(ensName: string) {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
        functionName: 'requestKyc',
        args: [ensName],
        account: this.account,
        value: parseEther('0.01')
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      return receipt
    } catch (error) {
      console.error('Error requesting KYC:', error)
      throw error
    }
  }

  async revokeKyc() {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
        functionName: 'revokeKyc',
        args: [this.account],
        account: this.account
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      return receipt
    } catch (error) {
      console.error('Error revoking KYC:', error)
      throw error
    }
  }

  async restoreKyc() {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
        functionName: 'restoreKyc',
        args: [this.account],
        account: this.account
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      return receipt
    } catch (error) {
      console.error('Error restoring KYC:', error)
      throw error
    }
  }

  async getKycInfo(address: Address) {
    try {
      const info = await publicClient.readContract({
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
        functionName: 'getKycInfo',
        args: [address],
      }) as [string, number, number, bigint]

      const kycInfo: KycInfo = {
        ensName: info[0],
        level: info[1] as KycLevel,
        status: info[2] as KycStatus,
        createTime: info[3]
      }

      return kycInfo
    } catch (error) {
      console.error('Error getting KYC info:', error)
      throw error
    }
  }

  async isHuman(address: Address) {
    try {
      const [isValid, level] = await publicClient.readContract({
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
        functionName: 'isHuman',
        args: [address],
      }) as [boolean, number]

      return {
        isValid,
        level: level as KycLevel
      }
    } catch (error) {
      console.error('Error checking human status:', error)
      throw error
    }
  }
}`

export const contractCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IKycSBT {
    enum KycLevel { NONE, BASIC, ADVANCED, PREMIUM, ULTIMATE }
    enum KycStatus { NONE, APPROVED, REVOKED }

    // Events
    event KycRequested(address indexed user, string ensName);
    event KycLevelUpdated(address indexed user, KycLevel oldLevel, KycLevel newLevel);
    event KycStatusUpdated(address indexed user, KycStatus status);
    event KycRevoked(address indexed user);
    event KycRestored(address indexed user);
    event AddressApproved(address indexed user, KycLevel level);
    event ValidityPeriodUpdated(uint256 newPeriod);

    // Core functions
    function requestKyc(string calldata ensName) external payable;
    function revokeKyc(address user) external;
    function restoreKyc(address user) external;
    function isHuman(address account) external view returns (bool, uint8);
    function getKycInfo(address account) external view returns (
        string memory ensName,
        KycLevel level,
        KycStatus status,
        uint256 createTime
    );

    // Configuration functions
    function setValidityPeriod(uint256 newPeriod) external;
}

/**
 * @title KYC Demo Contract
 * @notice Demonstrates how to integrate with KycSBT system
 */
contract KycDemo {
    IKycSBT public kycSBT;
    
    // Events
    event KycRequested(address indexed user, string ensName);
    event KycRevoked(address indexed user);
    event KycRestored(address indexed user);
    event HumanVerified(address indexed user, bool isHuman, uint8 level);
    
    constructor(address _kycSBT) {
        kycSBT = IKycSBT(_kycSBT);
    }
    
    /**
     * @notice Request KYC verification with ENS name
     * @param ensName The ENS name to register
     */
    function requestUserKyc(string calldata ensName) external payable {
        // Forward the call to KycSBT contract
        kycSBT.requestKyc{value: msg.value}(ensName);
        emit KycRequested(msg.sender, ensName);
    }
    
    /**
     * @notice Revoke user's KYC status
     * @param user Address of the user to revoke
     */
    function revokeUserKyc(address user) external {
        kycSBT.revokeKyc(user);
        emit KycRevoked(user);
    }
    
    /**
     * @notice Restore user's KYC status
     * @param user Address of the user to restore
     */
    function restoreUserKyc(address user) external {
        kycSBT.restoreKyc(user);
        emit KycRestored(user);
    }
    
    /**
     * @notice Check if an address belongs to a verified human
     * @param account Address to check
     * @return isHuman Whether the address is verified
     * @return level KYC level of the address
     */
    function checkHuman(address account) external view returns (bool isHuman, uint8 level) {
        return kycSBT.isHuman(account);
    }
    
    /**
     * @notice Get detailed KYC information for a user
     * @param account Address to query
     */
    function getUserKycInfo(address account) external view returns (
        string memory ensName,
        IKycSBT.KycLevel level,
        IKycSBT.KycStatus status,
        uint256 createTime
    ) {
        return kycSBT.getKycInfo(account);
    }
} ` 