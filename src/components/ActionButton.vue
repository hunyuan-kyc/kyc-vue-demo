<template>
  <div>
        
    <!-- 添加余额显示 -->
    <div class="contract-info">
      <p>Balance: {{ formatBalance }} HSK</p>
    </div>

    <button @click="openAppKit">Open</button>
    <button @click="disconnect">Disconnect</button>
    
    <!-- 添加合约地址显示 -->
    <div class="contract-info">
      <p>Contract Address: 
        <a 
          :href="`https://hashkeychain-testnet-explorer.alt.technology/address/${KYC_SBT_ADDRESS}`" 
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ KYC_SBT_ADDRESS }}
        </a>
      </p>
    </div>
    <div class="contract-info">
      <p>GitHub: 
        <a 
          href="https://github.com/hunyuan-kyc/kyc-vue-demo" 
          target="_blank"
          rel="noopener noreferrer"
        >
        https://github.com/hunyuan-kyc/kyc-vue-demo
        </a>
      </p>
    </div>
    <div class="contract-info">
      <p>ABI : 
        <a 
          href="https://github.com/hunyuan-kyc/kyc-vue-demo/blob/master/src/abis/KycSBT.json" 
          target="_blank"
          rel="noopener noreferrer"
        >
        https://github.com/hunyuan-kyc/kyc-vue-demo/blob/master/src/abis/KycSBT.json
        </a>
      </p>
    </div>

    
    <!-- KYC Status Section -->
    <div class="kyc-section" v-if="isLoading">
      <p>Loading KYC status...</p>
    </div>

    <div class="kyc-section" v-else-if="kycInfo.ensName">
      <div class="kyc-info">
        <h3>KYC Information</h3>
        <p>ENS Name: {{ kycInfo.ensName }}</p>
        <p>Status: {{ getKycStatusText(kycInfo.status) }}</p>
        <p>Level: {{ getKycLevelText(kycInfo.level) }}</p>
        <p>Created: {{ formatDate(kycInfo.createTime) }}</p>
        
        <!-- 当状态是 REVOKED 时显示恢复按钮，否则显示撤销按钮 -->
        <button 
          v-if="kycInfo.status === KycStatus.REVOKED"
          @click="restoreKyc" 
          :disabled="isProcessing"
        >
          {{ isProcessing ? 'Processing...' : 'Restore KYC' }}
        </button>
        <button 
          v-else
          @click="revokeKyc" 
          :disabled="isProcessing"
        >
          {{ isProcessing ? 'Processing...' : 'Revoke KYC' }}
        </button>
      </div>
    </div>

    <!-- Request KYC Section -->
    <div class="kyc-section" v-else>
      <div class="ens-input-group">
        <input 
          v-model="ensNameWithoutSuffix" 
          placeholder="Enter ENS name"
          type="text"
        />
        <span class="ens-suffix">.hsk</span>
      </div>
      <button @click="requestKyc" :disabled="isProcessing">
        {{ isProcessing ? 'Processing...' : 'Request KYC' }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useDisconnect, useAppKit, useAppKitNetwork } from "@reown/appkit/vue";
import { networks } from "../config/index";
import { createPublicClient, createWalletClient, custom, parseEther, formatEther } from 'viem'
import { hashkeyTestnet } from '@reown/appkit/networks'
import KycSBTAbi from '../abis/KycSBT.json'
import { KYC_SBT_ADDRESS } from '../config/contracts'
import { KycLevel, KycStatus } from '../types/kyc'
import type { KycInfo } from '../types/kyc'

export default {
  name: "ActionButtonList",
  setup() {
    const { disconnect } = useDisconnect();
    const { open } = useAppKit();
    const networkData = useAppKitNetwork();
    const ensNameWithoutSuffix = ref('');
    const isLoading = ref(true);
    const isProcessing = ref(false);
    const currentAddress = ref<string>('');
    const balance = ref<bigint>(0n)

    const kycInfo = ref<KycInfo>({
      ensName: '',
      level: KycLevel.NONE,
      status: KycStatus.NONE,
      createTime: 0n,
    });

    const openAppKit = () => open();
    const switchToNetwork = () => networkData.value.switchNetwork(networks[1]);

    const getPublicClient = () => {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask!')
      }
      return createPublicClient({
        chain: hashkeyTestnet,
        // @ts-ignore
        transport: custom(window.ethereum)
      })
    }

    const getWalletClient = () => {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask!')
      }
      return createWalletClient({
        chain: hashkeyTestnet,
        // @ts-ignore
        transport: custom(window.ethereum)
      })
    }

    const checkKycStatus = async () => {
      try {
        isLoading.value = true;
        const publicClient = getPublicClient()
        const walletClient = getWalletClient()
        const [address] = await walletClient.requestAddresses()
        console.log('Using KYC address:', KYC_SBT_ADDRESS)
        const info = await publicClient.readContract({
          address: KYC_SBT_ADDRESS,
          abi: KycSBTAbi,
          functionName: 'getKycInfo',
          args: [address],
        }) as [string, number, number, bigint]

        console.log(info, 'info checkKycStatus')
        
        kycInfo.value = {
          ensName: info[0],
          level: info[1] as KycLevel,
          status: info[2] as KycStatus,
          createTime: info[3],
        }
      } catch (error) {
        console.error('Error checking KYC status:', error)
      } finally {
        isLoading.value = false
      }
    }

    const getCurrentAddress = async () => {
      try {
        const walletClient = getWalletClient()
        const [address] = await walletClient.requestAddresses()
        return address
      } catch (error) {
        console.error('Error getting current address:', error)
        return ''
      }
    }

    const formatBalance = computed(() => {
      return Number(formatEther(balance.value)).toFixed(4)
    })

    const getBalance = async (address: string) => {
      try {
        const publicClient = getPublicClient()
        const newBalance = await publicClient.getBalance({ address: address as `0x${string}` })
        balance.value = newBalance
      } catch (error) {
        console.error('Error getting balance:', error)
      }
    }

    const updateAddressAndKycStatus = async () => {
      const address = await getCurrentAddress()
      if (address !== currentAddress.value) {
        currentAddress.value = address
        await Promise.all([
          checkKycStatus(),
          getBalance(address)
        ])
      }
    }

    // 监听地址变化
    watch(currentAddress, async (newAddress) => {
      if (newAddress) {
        await Promise.all([
          checkKycStatus(),
          getBalance(newAddress)
        ])
      }
    })

    // 监听区块变化以更新余额
    onMounted(() => {
      const publicClient = getPublicClient()
      publicClient.watchBlocks({
        onBlock: async () => {
          if (currentAddress.value) {
            await getBalance(currentAddress.value)
          }
        },
      })
    })

    const getTotalFee = async () => {
      try {
        const publicClient = getPublicClient()
        const fee = await publicClient.readContract({
          address: KYC_SBT_ADDRESS,
          abi: KycSBTAbi,
          functionName: 'getTotalFee',
        }) as bigint
        return fee
      } catch (error) {
        console.error('Error getting total fee:', error)
        throw error
      }
    }

    const requestKyc = async () => {
      if (!ensNameWithoutSuffix.value) {
        alert('Please enter an ENS name')
        return
      }

      const fullEnsName = `${ensNameWithoutSuffix.value}.hsk`

      try {
        isProcessing.value = true;
        await updateAddressAndKycStatus();
        const walletClient = getWalletClient()
        const [address] = await walletClient.requestAddresses()

        // 获取总费用
        const totalFee = await getTotalFee()

        const publicClient = getPublicClient()
        const { request } = await publicClient.simulateContract({
          address: KYC_SBT_ADDRESS,
          abi: KycSBTAbi,
          functionName: 'requestKyc',
          args: [fullEnsName],
          account: address,
          value: totalFee  // 使用获取到的总费用
        })

        const hash = await walletClient.writeContract(request)
        console.log('Transaction Hash:', hash)
        
        alert('KYC request submitted. Waiting for confirmation...')
        
        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        console.log('Transaction confirmed:', receipt)
        alert('KYC request confirmed!')

        await checkKycStatus()
      } catch (error: any) {
        console.error('Error requesting KYC:', error)
        alert('Error requesting KYC: ' + error.message)
      } finally {
        isProcessing.value = false
      }
    }

    const revokeKyc = async () => {
      try {
        isProcessing.value = true;
        await updateAddressAndKycStatus();
        const walletClient = getWalletClient()
        const [address] = await walletClient.requestAddresses()

        const publicClient = getPublicClient()
        const { request } = await publicClient.simulateContract({
          address: KYC_SBT_ADDRESS,
          abi: KycSBTAbi,
          functionName: 'revokeKyc',
          args: [address],
          account: address
        })

        const hash = await walletClient.writeContract(request)
        console.log('Transaction Hash:', hash)
        
        alert('KYC revoke submitted. Waiting for confirmation...')
        
        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        console.log('Transaction confirmed:', receipt)
        alert('KYC revoked successfully!')

        // Refresh KYC status
        await checkKycStatus()
      } catch (error: any) {
        console.error('Error revoking KYC:', error)
        alert('Error revoking KYC: ' + error.message)
      } finally {
        isProcessing.value = false
      }
    }

    const restoreKyc = async () => {
      try {
        isProcessing.value = true;
        await updateAddressAndKycStatus();
        const walletClient = getWalletClient()
        const [address] = await walletClient.requestAddresses()

        const publicClient = getPublicClient()
        const { request } = await publicClient.simulateContract({
          address: KYC_SBT_ADDRESS,
          abi: KycSBTAbi,
          functionName: 'restoreKyc',
          args: [address],
          account: address
        })

        const hash = await walletClient.writeContract(request)
        console.log('Transaction Hash:', hash)
        
        alert('KYC restore submitted. Waiting for confirmation...')
        
        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        console.log('Transaction confirmed:', receipt)
        alert('KYC restored successfully!')

        // Refresh KYC status
        await checkKycStatus()
      } catch (error: any) {
        console.error('Error restoring KYC:', error)
        alert('Error restoring KYC: ' + error.message)
      } finally {
        isProcessing.value = false
      }
    }

    const getKycStatusText = (status: KycStatus) => {
      const statusMap: Record<KycStatus, string> = {
        [KycStatus.NONE]: 'None',
        [KycStatus.PENDING]: 'Pending',
        [KycStatus.APPROVED]: 'Approved',
        [KycStatus.REVOKED]: 'Revoked'
      }
      return statusMap[status] || 'Unknown'
    }

    const getKycLevelText = (level: KycLevel) => {
      const levelMap: Record<KycLevel, string> = {
        [KycLevel.NONE]: 'None',
        [KycLevel.BASIC]: 'Basic',
        [KycLevel.ADVANCED]: 'Advanced',
        [KycLevel.PREMIUM]: 'Premium',
        [KycLevel.ULTIMATE]: 'Ultimate'
      }
      return levelMap[level] || 'Unknown'
    }

    const formatDate = (timestamp: bigint) => {
      if (timestamp === 0n) return 'N/A'
      return new Date(Number(timestamp) * 1000).toLocaleString()
    }

    onMounted(async () => {
      await updateAddressAndKycStatus()
    })

    if (window.ethereum) {
      // @ts-ignore
      window.ethereum.on('accountsChanged', async () => {
        await updateAddressAndKycStatus()
      })
    }

    return {
      disconnect,
      openAppKit,
      switchToNetwork,
      ensNameWithoutSuffix,
      requestKyc,
      revokeKyc,
      isLoading,
      isProcessing,
      kycInfo,
      getKycStatusText,
      getKycLevelText,
      formatDate,
      restoreKyc,
      KycStatus,
      currentAddress,
      KYC_SBT_ADDRESS,
      formatBalance,
    };
  },
};
</script>

<style scoped>
.kyc-section {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.kyc-info {
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 100%;
}

.kyc-info h3 {
  margin-top: 0;
}

input {
  padding: 10px;
  border: 2px solid black;
  border-radius: 6px;
  font-size: 16px;
}

button {
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ens-input-group {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
}

.ens-input-group input {
  width: 100%;
  padding-right: 50px; /* 为后缀留出空间 */
}

.ens-suffix {
  position: absolute;
  right: 10px;
  color: #666;
  pointer-events: none;
  user-select: none;
}

.contract-info {
  margin: 10px 0;
  padding: 10px;
  border-radius: 6px;
}

.contract-info a {
  color: #0066cc;
  text-decoration: none;
  word-break: break-all;
}

.contract-info a:hover {
  text-decoration: underline;
}
</style>

