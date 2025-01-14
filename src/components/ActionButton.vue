<template>
  <div>
    <button @click="openAppKit">Open</button>
    <button @click="disconnect">Disconnect</button>
    <button @click="switchToNetwork">Switch</button>
    
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
        <p>Expiration: {{ formatDate(kycInfo.expirationTime) }}</p>
        <button @click="revokeKyc" :disabled="isProcessing">
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
import { ref, onMounted } from 'vue';
import { useDisconnect, useAppKit, useAppKitNetwork } from "@reown/appkit/vue";
import { networks } from "../config/index";
import { createPublicClient, createWalletClient, custom, parseEther } from 'viem'
import { hashkeyTestnet } from '@reown/appkit/networks'
import KycSBTAbi from '../abis/KycSBT.json'
import type { KycInfo } from '../types/kyc'

const KYC_CONTRACT_ADDRESS = '0x6a32FAB197356f1eCFB6C5824427D6c8d469099c'

export default {
  name: "ActionButtonList",
  setup() {
    const { disconnect } = useDisconnect();
    const { open } = useAppKit();
    const networkData = useAppKitNetwork();
    const ensNameWithoutSuffix = ref('');
    const isLoading = ref(true);
    const isProcessing = ref(false);
    const kycInfo = ref<KycInfo>({
      ensName: '',
      level: 0,
      status: 0,
      expirationTime: 0n,
      ensNode: '0x0000000000000000000000000000000000000000000000000000000000000000',
      isWhitelisted: false
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

        const info = await publicClient.readContract({
          address: KYC_CONTRACT_ADDRESS,
          abi: KycSBTAbi,
          functionName: 'kycInfos',
          args: [address],
        }) as [string, number, number, bigint, `0x${string}`, boolean]

        console.log(info, 'info checkKycStatus')
        
        // 解构数组并赋值给对象
        kycInfo.value = {
          ensName: info[0],
          level: info[1],
          status: info[2],
          expirationTime: info[3],
          ensNode: info[4],
          isWhitelisted: info[5]
        }
      } catch (error) {
        console.error('Error checking KYC status:', error)
      } finally {
        isLoading.value = false
      }
    }

    const requestKyc = async () => {
      if (!ensNameWithoutSuffix.value) {
        alert('Please enter an ENS name')
        return
      }

      // 添加 .hsk 后缀
      const fullEnsName = `${ensNameWithoutSuffix.value}.hsk`

      try {
        isProcessing.value = true;
        const walletClient = getWalletClient()
        const [address] = await walletClient.requestAddresses()

        const publicClient = getPublicClient()
        const { request } = await publicClient.simulateContract({
          address: KYC_CONTRACT_ADDRESS,
          abi: KycSBTAbi,
          functionName: 'requestKycAndApprove',
          args: [fullEnsName], // 使用带后缀的完整名称
          account: address,
          value: parseEther('0.01')
        })

        const hash = await walletClient.writeContract(request)
        console.log('Transaction Hash:', hash)
        
        alert('KYC request submitted. Waiting for confirmation...')
        
        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        console.log('Transaction confirmed:', receipt)
        alert('KYC request confirmed!')

        // Refresh KYC status
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
        const walletClient = getWalletClient()
        const [address] = await walletClient.requestAddresses()

        const publicClient = getPublicClient()
        const { request } = await publicClient.simulateContract({
          address: KYC_CONTRACT_ADDRESS,
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

    const getKycStatusText = (status: number) => {
      const statusMap = {
        1: 'Pending',
        2: 'Approved',
        3: 'Rejected',
        4: 'Revoked'
      }
      // @ts-ignore
      return statusMap[status] || 'Unknown'
    }

    const getKycLevelText = (level: number) => {
      const levelMap = {
        0: 'None',
        1: 'Basic',
        2: 'Advanced',
        3: 'PREMIUM'
      }
      // @ts-ignore
      return levelMap[level] || 'Unknown'
    }

    const formatDate = (timestamp: bigint) => {
      if (timestamp === 0n) return 'N/A'
      return new Date(Number(timestamp) * 1000).toLocaleString()
    }

    onMounted(async () => {
      await checkKycStatus()
    })

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
      formatDate
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
</style>
