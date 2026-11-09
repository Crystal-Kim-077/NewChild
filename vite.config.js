import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * base: GitHub Pages 저장소 경로
 * publicDir: 이미지 원본 폴더(images)를 그대로 정적 파일로 제공한다.
 */
export default defineConfig({
  base: '/NewChild/',
  publicDir: 'images',
  plugins: [react()],
});
