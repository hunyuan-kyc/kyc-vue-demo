import { createPublicClient, createWalletClient, http, type Address, type WalletClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { hashkey } from 'viem/chains'
import { KYC_SBT_ADDRESS } from '@/config/contracts'
import KycSBTAbi from '@/abis/KycSBT.json'

const publicClient = createPublicClient({
  chain: hashkey,
  transport: http('https://mainnet.hsk.xyz')
})

export class OwnerOperations {
  private client: WalletClient
  private account: Address

  constructor(privateKey: string) {
    const account = privateKeyToAccount(privateKey as `0x${string}`)
    this.account = account.address
    this.client = createWalletClient({
      account,
      chain: hashkey,
      transport: http('https://mainnet.hsk.xyz')
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

  async approveKyc(user: Address) {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
        functionName: 'approveKyc',
        args: [user],
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
} 