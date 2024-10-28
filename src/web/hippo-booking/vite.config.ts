import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const externalEnvs = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), mkcert({ savePath: "./certs" })],
    define: {
      externalEnvs,
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["test/vitest.setup.ts"],
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
    },
    devServer: {
      https: {
        cert: "./certs/cert.pem",
        key: "./certs/dev.pem",
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        }
      }
    }
  };
});
