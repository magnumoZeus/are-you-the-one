import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/are-you-the-one/',
  plugins: [react()],
})
