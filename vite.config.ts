import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/calculadora-pj-internacional/',
  test: {
    environment: 'happy-dom',
    coverage: {
      provider: 'v8'
    }
  }
})
