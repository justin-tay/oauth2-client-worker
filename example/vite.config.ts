import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const production = mode === 'production' || mode === 'preview';
  const pwaOptions: Partial<VitePWAOptions> = {
    mode: production ? 'production' : 'development',
    srcDir: 'src',
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    filename: 'serviceWorker.ts',
    strategies: 'injectManifest',
    manifest: {
      name: 'OAuth2 Client Worker Example',
      short_name: 'OAuth2 Client Worker',
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  };

  return {
    esbuild: {
      drop: production ? ['console', 'debugger'] : [],
    },
    plugins: [react(), VitePWA(pwaOptions)],
  };
});
