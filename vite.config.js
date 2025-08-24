import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: '/are-you-the-one/',
    plugins: [react()],
    define: {
      'process.env': env
    }
  }
})