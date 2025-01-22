import { createPublicClient, createWalletClient, http, type Address, type WalletClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { hashkeyTestnet } from 'viem/chains'
import { KYC_SBT_ADDRESS } from '@/config/contracts'
import KycSBTAbi from '@/abis/KycSBT.json'

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

  async setRegistrationFee(newFee: string) {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
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
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
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
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
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
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
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
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
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
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
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

  async setEnsFee(newFee: bigint) {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
        functionName: 'setEnsFee',
        args: [newFee],
        account: this.account
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('ENS fee updated:', receipt)
      return receipt
    } catch (error) {
      console.error('Error setting ENS fee:', error)
      throw error
    }
  }

  async getContractConfig() {
    try {
      const [registrationFee, ensFee, minLength, suffix, validityPeriod] = await Promise.all([
        publicClient.readContract({
          address: KYC_SBT_ADDRESS,
          abi: KycSBTAbi,
          functionName: 'registrationFee'
        }),
        publicClient.readContract({
          address: KYC_SBT_ADDRESS,
          abi: KycSBTAbi,
          functionName: 'ensFee'
        }),
        publicClient.readContract({
          address: KYC_SBT_ADDRESS,
          abi: KycSBTAbi,
          functionName: 'minNameLength'
        }),
        publicClient.readContract({
          address: KYC_SBT_ADDRESS,
          abi: KycSBTAbi,
          functionName: 'suffix'
        }),
        publicClient.readContract({
          address: KYC_SBT_ADDRESS,
          abi: KycSBTAbi,
          functionName: 'validityPeriod'
        })
      ])

      return {
        registrationFee,
        ensFee,
        minNameLength: minLength,
        suffix,
        validityPeriod
      }
    } catch (error) {
      console.error('Error getting contract config:', error)
      throw error
    }
  }

  /**
   * Approve ENS name for a user
   * @param user - User address
   * @param ensName - ENS name to approve (without suffix)
   */
  async approveEnsName(user: Address, ensName: string) {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
        functionName: 'approveEnsName',
        args: [user, ensName],
        account: this.account
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('ENS name approved:', receipt)
      return receipt
    } catch (error) {
      console.error('Error approving ENS name:', error)
      throw error
    }
  }

  /**
   * Check if ENS name is approved for a user
   * @param user - User address
   * @param ensName - ENS name to check (without suffix)
   * @returns boolean indicating if the ENS name is approved
   */
  async isEnsNameApproved(user: Address, ensName: string): Promise<boolean> {
    try {
      const isApproved = await publicClient.readContract({
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
        functionName: 'isEnsNameApproved',
        args: [user, ensName]
      })
      return isApproved as boolean
    } catch (error) {
      console.error('Error checking ENS name approval:', error)
      throw error
    }
  }
} 