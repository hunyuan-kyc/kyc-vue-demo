import { createPublicClient, createWalletClient, http, type Address, type WalletClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { hashkeyTestnet } from 'viem/chains'
import { KYC_CONTRACT_ADDRESS, KYC_ABI } from '../contracts'

const publicClient = createPublicClient({
  chain: hashkeyTestnet,
  transport: http('https://hk-testnet.rpc.alt.technology')
})

export class OwnerOperations {
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

  async setRegistrationFee(newFee: bigint) {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_CONTRACT_ADDRESS,
        abi: KYC_ABI,
        functionName: 'setRegistrationFee',
        args: [newFee],
        account: this.account
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('Registration fee updated:', receipt)
      return receipt
    } catch (error) {
      console.error('Error setting registration fee:', error)
      throw error
    }
  }

  async setMinNameLength(newLength: bigint) {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_CONTRACT_ADDRESS,
        abi: KYC_ABI,
        functionName: 'setMinNameLength',
        args: [newLength],
        account: this.account
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('Min name length updated:', receipt)
      return receipt
    } catch (error) {
      console.error('Error setting min name length:', error)
      throw error
    }
  }

  async setSuffix(newSuffix: string) {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_CONTRACT_ADDRESS,
        abi: KYC_ABI,
        functionName: 'setSuffix',
        args: [newSuffix],
        account: this.account
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('Suffix updated:', receipt)
      return receipt
    } catch (error) {
      console.error('Error setting suffix:', error)
      throw error
    }
  }

  async setENSAndResolver(ensAddress: Address, resolverAddress: Address) {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_CONTRACT_ADDRESS,
        abi: KYC_ABI,
        functionName: 'setENSAndResolver',
        args: [ensAddress, resolverAddress],
        account: this.account
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('ENS and Resolver updated:', receipt)
      return receipt
    } catch (error) {
      console.error('Error setting ENS and Resolver:', error)
      throw error
    }
  }

  async transferOwnership(newOwner: Address) {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_CONTRACT_ADDRESS,
        abi: KYC_ABI,
        functionName: 'transferOwnership',
        args: [newOwner],
        account: this.account
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('Ownership transferred:', receipt)
      return receipt
    } catch (error) {
      console.error('Error transferring ownership:', error)
      throw error
    }
  }

  async withdrawFees() {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_CONTRACT_ADDRESS,
        abi: KYC_ABI,
        functionName: 'withdrawFees',
        account: this.account
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('Fees withdrawn:', receipt)
      return receipt
    } catch (error) {
      console.error('Error withdrawing fees:', error)
      throw error
    }
  }

  async getContractConfig() {
    try {
      const [fee, minLength, suffix] = await Promise.all([
        publicClient.readContract({
          address: KYC_CONTRACT_ADDRESS,
          abi: KYC_ABI,
          functionName: 'registrationFee'
        }),
        publicClient.readContract({
          address: KYC_CONTRACT_ADDRESS,
          abi: KYC_ABI,
          functionName: 'minNameLength'
        }),
        publicClient.readContract({
          address: KYC_CONTRACT_ADDRESS,
          abi: KYC_ABI,
          functionName: 'suffix'
        })
      ])

      return {
        registrationFee: fee,
        minNameLength: minLength,
        suffix
      }
    } catch (error) {
      console.error('Error getting contract config:', error)
      throw error
    }
  }
} 