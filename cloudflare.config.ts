import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "bengkel-pos-syuhada",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-16",
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      DB: bindings.d1({ name: "bengkel-pos-db" }),
      AUTH_SECRET: bindings.secret(),
      ADMIN_EMAIL: bindings.secret(),
      ADMIN_PASSWORD: bindings.secret(),
      DEPOSIT_PROOFS: bindings.r2({ name: "syuhada-deposit-proofs" }),
    },
  }),
});
