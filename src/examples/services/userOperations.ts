import { createPublicClient, createWalletClient, http, type Address, type WalletClient, parseEther } from 'viem'
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
    const account = privateKeyToAccount(privateKey as `0x${string}`)
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
      console.log('KYC requested:', receipt)
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
      console.log('KYC revoked:', receipt)
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
      console.log('KYC restored:', receipt)
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
} 