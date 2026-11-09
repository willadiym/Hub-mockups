import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
export default defineConfig({base:process.env.VITE_BASE_PATH||'/',build:{rollupOptions:{input:{status:fileURLToPath(new URL('./index.html',import.meta.url)),notifications:fileURLToPath(new URL('./notifications.html',import.meta.url))}}}});
