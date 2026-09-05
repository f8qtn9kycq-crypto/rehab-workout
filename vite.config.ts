import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: {
    __ENTRY_DEMO__: JSON.stringify(mode === 'development' || loadEnv(mode, '.', '').VERCEL_ENV === 'preview'),
  },
}));
