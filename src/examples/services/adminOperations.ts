import { createPublicClient, createWalletClient, http, type Address, type WalletClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { hashkeyTestnet } from 'viem/chains'
import { KYC_CONTRACT_ADDRESS, KYC_ABI } from '../contracts'
import { KycLevel } from '../types'

const publicClient = createPublicClient({
  chain: hashkeyTestnet,
  transport: http('https://hk-testnet.rpc.alt.technology')
})

export class AdminOperations {
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

  async approveKyc(userAddress: Address, level: KycLevel) {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_CONTRACT_ADDRESS,
        abi: KYC_ABI,
        functionName: 'approve',
        args: [userAddress, level],
        account: this.account
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('KYC approved:', receipt)
      return receipt
    } catch (error) {
      console.error('Error approving KYC:', error)
      throw error
    }
  }

  async rejectKyc(userAddress: Address, reason: string) {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_CONTRACT_ADDRESS,
        abi: KYC_ABI,
        functionName: 'reject',
        args: [userAddress, reason],
        account: this.account
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('KYC rejected:', receipt)
      return receipt
    } catch (error) {
      console.error('Error rejecting KYC:', error)
      throw error
    }
  }

  async revokeKyc(userAddress: Address) {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_CONTRACT_ADDRESS,
        abi: KYC_ABI,
        functionName: 'revokeKyc',
        args: [userAddress],
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

  async addAdmin(adminAddress: Address) {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_CONTRACT_ADDRESS,
        abi: KYC_ABI,
        functionName: 'addAdmin',
        args: [adminAddress],
        account: this.account
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('Admin added:', receipt)
      return receipt
    } catch (error) {
      console.error('Error adding admin:', error)
      throw error
    }
  }
} 