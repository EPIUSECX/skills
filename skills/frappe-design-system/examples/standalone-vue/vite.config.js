import vue from '@vitejs/plugin-vue'
import frappeui from 'frappe-ui/vite'
import { defineConfig } from 'vite'

// No bench is needed to render the shell, so the proxy and boot-data plugins are off.
export default defineConfig({
  plugins: [frappeui({ frappeProxy: false, jinjaBootData: false, buildConfig: false }), vue()],
})
