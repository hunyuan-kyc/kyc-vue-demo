<template>
   <div class="pages">
      <h1>HunYuan on-chain KYC integration demo</h1>

      <select v-model="isTestnet" @change="changeEnvironment">
        <option value="true">测试环境</option>
        <option value="false">主网</option>
      </select>

      <appkit-button />
      <ActionButtonList />
      <!-- <InfoList /> -->

      <!-- 代码演示区域 -->
      <div class="code-demos">
         <!-- 左侧：前端接入示例 -->
         <div class="code-demo">
            <div class="code-header">
               <h2>Frontend Integration</h2>
               <button 
                  class="copy-btn"
                  :data-clipboard-text="frontendCode"
               >
                  Copy
               </button>
            </div>
            <pre><code v-html="highlightedFrontendCode"></code></pre>
         </div>

         <!-- 右侧：智能合约接入示例 -->
         <div class="code-demo">
            <div class="code-header">
               <h2>Smart Contract Integration</h2>
               <button 
                  class="copy-btn"
                  :data-clipboard-text="contractCode"
               >
                  Copy
               </button>
            </div>
            <pre><code v-html="highlightedContractCode"></code></pre>
         </div>
      </div>

      <!-- Download Link for PDF -->
      <div class="download-section">
         <h2>Download Smart Contract Audit Report</h2>
         <a href="/Smart Contract Audit Report 20250220(1).pdf" download class="download-btn">Download PDF</a>
      </div>
    </div>
</template>


<script lang="ts">
import {
  createAppKit,
} from '@reown/appkit/vue'
import { wagmiAdapter , networks, projectId } from './config/index'
// @ts-ignore
import ClipboardJS from 'clipboard'
import { onMounted, ref, computed, provide } from 'vue'

import ActionButtonList from "./components/ActionButton.vue"
import InfoList from "./components/InfoList.vue"
// @ts-ignore
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import { frontendCode, contractCode } from './examples/codeExamples'

// Initialize AppKit
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'HunYuan on-chain KYC integration demo',
    description: 'HunYuan on-chain KYC integration demo',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  }
})

export default {
  name: "App",
  components: {
    ActionButtonList,
    InfoList
  },
  setup() {
    const selectedNetwork = ref('hashkeyTestnet'); // 默认选择的网络
    const isTestnet = ref(true); // 默认选择测试环境

    const changeNetwork = () => {
      console.log('切换到网络:', selectedNetwork.value);
      // 这里可以添加切换网络的逻辑
    };

    const changeEnvironment = () => {
      console.log('切换到环境:', isTestnet.value);
      // 这里可以添加切换环境的逻辑
      selectedNetwork.value = isTestnet.value ? 'hashkeyTestnet' : 'hashkey';
    };

    // 计算合约地址
    const KYC_SBT_ADDRESS = computed(() => {
      return isTestnet.value 
        ? import.meta.env.VITE_KYC_SBT_ADDRESS_TEST 
        : import.meta.env.VITE_KYC_SBT_ADDRESS;
    });

    // 提供 KYC_SBT_ADDRESS 给子组件
    provide('KYC_SBT_ADDRESS', KYC_SBT_ADDRESS);

    const ENS_REGISTRY_ADDRESS = computed(() => {
      return isTestnet.value 
        ? import.meta.env.VITE_ENS_REGISTRY_ADDRESS_TEST 
        : import.meta.env.VITE_ENS_REGISTRY_ADDRESS;
    });

    const HSK_NODE = computed(() => {
      return isTestnet.value 
        ? import.meta.env.VITE_HSK_NODE_TEST 
        : import.meta.env.VITE_HSK_NODE;
    });

    const KYC_RESOLVER_ADDRESS = computed(() => {
      return isTestnet.value 
        ? import.meta.env.VITE_KYC_RESOLVER_ADDRESS_TEST 
        : import.meta.env.VITE_KYC_RESOLVER_ADDRESS;
    });

    const highlightedFrontendCode = hljs.highlight(
      frontendCode,
      { language: 'typescript' }
    ).value

    const highlightedContractCode = hljs.highlight(
      contractCode,
      { language: 'javascript' }
    ).value

    onMounted(() => {
      const clipboard = new ClipboardJS('.copy-btn')
      clipboard.on('success', (e) => {
        const btn = e.trigger as HTMLButtonElement
        btn.textContent = 'Copied!'
        setTimeout(() => {
          btn.textContent = 'Copy'
        }, 2000)
      })
    })

    return {
      frontendCode,
      contractCode,
      highlightedFrontendCode,
      highlightedContractCode,
      selectedNetwork,
      isTestnet,
      changeNetwork,
      changeEnvironment,
      KYC_SBT_ADDRESS,
      ENS_REGISTRY_ADDRESS,
      HSK_NODE,
      KYC_RESOLVER_ADDRESS
    }
  }
}
</script>

<style scoped>
.pages {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.code-demos {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 40px;
}

.code-demo {
  border-radius: 8px;
  padding: 20px;
  background: #282c34;  /* 深色背景 */
}

.code-demo h2 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1.5em;
  color: #fff;
}

pre {
  margin: 0;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  background: transparent;
}

code {
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.5;
}

/* 自定义滚动条样式 */
pre::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

pre::-webkit-scrollbar-track {
  background: #1e1e1e;
  border-radius: 4px;
}

pre::-webkit-scrollbar-thumb {
  background: #4a4a4a;
  border-radius: 4px;
}

pre::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.copy-btn {
  padding: 6px 12px;
  background: #4a4a4a;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.copy-btn:hover {
  background: #666;
}

.download-section {
  margin-top: 40px;
  text-align: center;
}

.download-btn {
  padding: 6px 12px;
  background: #4a90e2; /* Blue background */
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none; /* Remove underline */
  display: inline-block; /* Make it behave like a button */
  transition: background 0.2s;
}

.download-btn:hover {
  background: #357ABD; /* Darker blue on hover */
}
</style>