import type { Config } from "@level-ci/cli"

/**
 * Level CI project metadata.
 *
 * The token is read from the LEVEL_CI_TOKEN environment variable — locally from
 * your shell, in CI from the repository secret of the same name. Never hard-code
 * it here; this file is committed.
 */
export default {
  organization: "level-access-5628557662360117-org-rjtxk",
  project: "rose-app",
  token: process.env.LEVEL_CI_TOKEN,
  reportPaths: ["./level-ci-reports"],
} satisfies Config
