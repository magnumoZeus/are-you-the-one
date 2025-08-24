import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/are-you-the-one/',   // keep this for GitHub Pages
  plugins: [react()],
})
