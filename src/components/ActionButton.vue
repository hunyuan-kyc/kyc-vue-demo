<template>
    <div>
      <button @click="openAppKit">Open</button>
      <button @click="disconnect">Disconnect</button>
      <button @click="switchToNetwork">Switch</button>
      
      <!-- Add KYC request section -->
      <div class="kyc-section">
        <input 
          v-model="ensName" 
          placeholder="Enter ENS name"
          type="text"
        />
        <button @click="requestKyc" :disabled="isLoading">
          {{ isLoading ? 'Processing...' : 'Request KYC' }}
        </button>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { ref } from 'vue';
  import { useDisconnect, useAppKit, useAppKitNetwork } from "@reown/appkit/vue";
  import { networks } from "../config/index";
  import { createPublicClient, createWalletClient, custom, parseEther } from 'viem'
  import { hashkeyTestnet } from '@reown/appkit/networks'
  import KycSBTAbi from '../abis/KycSBT.json'
  
  const KYC_CONTRACT_ADDRESS = '0x0f362c05fb3Fadca687648F412abE2A6d6450D70'
  
  export default {
    name: "ActionButtonList",
    setup() {
      const { disconnect } = useDisconnect();
      const { open } = useAppKit();
      const networkData = useAppKitNetwork();
      const ensName = ref('');
      const isLoading = ref(false);
  
      const openAppKit = () => open();
      const switchToNetwork = () => networkData.value.switchNetwork(networks[1]);
  
      const requestKyc = async () => {
        if (!ensName.value) {
          alert('Please enter an ENS name')
          return
        }
  
        if (!window.ethereum) {
          alert('Please install MetaMask!')
          return
        }
  
        try {
          isLoading.value = true;
  
          const publicClient = createPublicClient({
            chain: hashkeyTestnet,
            transport: custom(window.ethereum)
          })
  
          const walletClient = createWalletClient({
            chain: hashkeyTestnet,
            transport: custom(window.ethereum)
          })
  
          const [address] = await walletClient.requestAddresses()
  
          const { request } = await publicClient.simulateContract({
            address: KYC_CONTRACT_ADDRESS,
            abi: KycSBTAbi,
            functionName: 'requestKyc',
            args: [ensName.value],
            account: address,
            value: parseEther('0.01')
          })
  
          const hash = await walletClient.writeContract(request)
          console.log('Transaction Hash:', hash)
          
          alert('KYC request submitted. Waiting for confirmation...')
          
          const receipt = await publicClient.waitForTransactionReceipt({ hash })
          console.log('Transaction confirmed:', receipt)
          alert('KYC request confirmed!')
  
        } catch (error: any) {
          console.error('Error requesting KYC:', error)
          alert('Error requesting KYC: ' + error.message)
        } finally {
          isLoading.value = false
        }
      }
  
      return {
        disconnect,
        openAppKit,
        switchToNetwork,
        ensName,
        requestKyc,
        isLoading
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
  
  input {
    padding: 10px;
    border: 2px solid black;
    border-radius: 6px;
    font-size: 16px;
  }
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  </style>
  