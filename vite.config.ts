import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Library build mode
  if (mode === 'lib') {
    return {
      plugins: [
        react(),
        dts({
          include: ['src/lib/**/*', 'src/types/**/*'],
          outDir: 'dist',
        }),
      ],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/lib/index.ts'),
          name: 'TextShape',
          formats: ['es', 'cjs'],
          fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'fabric'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              fabric: 'fabric',
            },
          },
        },
        outDir: 'dist',
        sourcemap: true,
      },
    };
  }

  // Demo build mode (default)
  return {
    plugins: [react()],
    base: '/',
  };
});
