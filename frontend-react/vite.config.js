import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0', // 도커 내부에서 외부 접속을 허용하기 위해 필수
    proxy: {
      // 1. /api 로 시작하는 요청은 인텔리제이(8080)로 보낸다!
      '/api': {
        target: 'http://host.docker.internal:8080',
        changeOrigin: true,
      },
      // 2. 로그인/인증 요청도 인텔리제이로!
      '/auth': {
        target: 'http://host.docker.internal:8080',
        changeOrigin: true,
      },
      // 3. 업로드된 이미지 요청도 인텔리제이로!
      '/images': {
        target: 'http://host.docker.internal:8080',
        changeOrigin: true,
      }
    },
    watch: {
      usePolling: true,
    }
  }
})
