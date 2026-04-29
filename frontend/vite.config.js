import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const nm = path.join(__dirname, 'node_modules')

// React Router v7 ships ESM-first; its CJS entry is in dist/development/*.js
// Vite 5's @rollup/plugin-commonjs can't resolve it via the exports map.
// This plugin intercepts the bare specifiers before that resolver runs.
function reactRouterV7Fix() {
  return {
    name: 'react-router-v7-fix',
    enforce: 'pre',
    resolveId(id) {
      if (id === 'react-router') {
        return path.join(nm, 'react-router/dist/development/index.js')
      }
      if (id === 'react-router/dom') {
        return path.join(nm, 'react-router/dist/development/dom-export.js')
      }
    },
  }
}

export default defineConfig({
  plugins: [reactRouterV7Fix(), react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
})
