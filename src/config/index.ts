import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { hashkey, type AppKitNetwork } from '@reown/appkit/networks'

export const projectId = import.meta.env.VITE_PROJECT_ID || ""
if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [hashkey]

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
})