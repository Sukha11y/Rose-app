import { defineConfig, type ConfigEnv, type UserConfig } from 'vite'

import baseConfig from './vite.config'

/**
 * Vite config used only by the Playwright suite.
 *
 * The checked-in `vite.config.ts` points HMR at `wss://<host>:443` because the
 * Figma Make preview is served through a TLS proxy. Under test there is no such
 * proxy, so the HMR client fails to connect and retries in a tight loop, which
 * floods the console and starves the page. Tests don't need hot reload at all,
 * so we turn it off.
 */
export default defineConfig(async (env: ConfigEnv): Promise<UserConfig> => {
  const base = (await baseConfig(env)) as UserConfig

  return {
    ...base,
    server: { ...base.server, hmr: false },
  }
})
