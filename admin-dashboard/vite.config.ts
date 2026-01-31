import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      "/api": {
        target: "https://localhost:7053",
        changeOrigin: true,
        secure: false, // bỏ qua chứng chỉ self-signed
      },
    },
  },
});
