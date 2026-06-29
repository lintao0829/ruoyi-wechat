import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
  ],
  server: {
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
  // 小程序编译模式下的文件监听配置（解决第三方编辑器热更新失效问题）
  build: {
    watch: {
      // Rollup 的 chokidar 配置，强制使用轮询方式监听文件变化
      // 兼容 Trae AI / Cursor / VSCode Remote 等不触发 FSEvents 的编辑器
      chokidar: {
        usePolling: true,
        interval: 1000,
      },
    },
  },
})
