import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const externalEnvs = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      externalEnvs
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["test/vitest.setup.ts"],
    },
    server: {
      host: "0.0.0.0",
      port: 5173
    }
  }
})