import { createPublicClient, createWalletClient, http, type Address, type WalletClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { hashkeyTestnet } from 'viem/chains'
import { VITE_KYC_SBT_ADDRESS, KYC_ABI } from '../contracts'
import { type KycInfo, KycLevel, KycStatus } from '../types'

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
      const fee = await publicClient.readContract({
        address: VITE_KYC_SBT_ADDRESS,
        abi: KYC_ABI,
        functionName: 'registrationFee',
      })

      const { request } = await publicClient.simulateContract({
        address: VITE_KYC_SBT_ADDRESS,
        abi: KYC_ABI,
        functionName: 'requestKyc',
        args: [ensName],
        value: fee,
        account: this.account
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

  async requestKycAndApprove(ensName: string) {
    try {
      const fee = await publicClient.readContract({
        address: VITE_KYC_SBT_ADDRESS,
        abi: KYC_ABI,
        functionName: 'registrationFee',
      })

      const { request } = await publicClient.simulateContract({
        address: VITE_KYC_SBT_ADDRESS,
        abi: KYC_ABI,
        functionName: 'requestKycAndApprove',
        args: [ensName],
        value: fee,
        account: this.account
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('KYC auto approved:', receipt)
      return receipt
    } catch (error) {
      console.error('Error in auto KYC:', error)
      throw error
    }
  }

  async revokeKyc(userAddress: Address) {
    try {
      const { request } = await publicClient.simulateContract({
        address: VITE_KYC_SBT_ADDRESS,
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

  async checkKycStatus(address: Address) {
    try {
      const [isValid, level] = await publicClient.readContract({
        address: VITE_KYC_SBT_ADDRESS,
        abi: KYC_ABI,
        functionName: 'isHuman',
        args: [address]
      })
      
      return { isValid, level: level as KycLevel }
    } catch (error) {
      console.error('Error checking KYC status:', error)
      throw error
    }
  }

  async getKycInfo(address: Address) {
    try {
      const info = await publicClient.readContract({
        address: VITE_KYC_SBT_ADDRESS,
        abi: KYC_ABI,
        functionName: 'kycInfos',
        args: [address],
      }) as [string, number, number, bigint, `0x${string}`, boolean]

      return {
        ensName: info[0],
        level: info[1] as KycLevel,
        status: info[2] as KycStatus,
        expirationTime: info[3],
        ensNode: info[4],
        isWhitelisted: info[5]
      } satisfies KycInfo
    } catch (error) {
      console.error('Error getting KYC info:', error)
      throw error
    }
  }

  async getCurrentKycInfo() {
    try {
      return await this.getKycInfo(this.account)
    } catch (error) {
      console.error('Error getting current KYC info:', error)
      throw error
    }
  }
} 