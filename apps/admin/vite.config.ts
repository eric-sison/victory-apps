import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react"
import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart(), // 1. Run this early so it can inject its virtual modules
    viteReact(),     // 2. Let React handle the JSX/TSX transformation next
    babel({ presets: [reactCompilerPreset()] }), // 3. Compile the React code
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
  ],
})

export default config
