import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { type AppKitNetwork } from '@reown/appkit/networks'

// Define the custom hashkey network
export const hashkey: AppKitNetwork = {
  id: 177,
  name: 'HashKey Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'HashKey EcoPoints',
    symbol: 'HSK',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.hsk.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HashKey Chain Explorer',
      url: 'https://hashkey.blockscout.com',
    },
  },
};

export const projectId = import.meta.env.VITE_PROJECT_ID || ""
if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [hashkey]

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
})