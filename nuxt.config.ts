import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["shadcn-nuxt", "@nuxtjs/color-mode"],
  colorMode: {
    classSuffix: "",
    preference: "system",
  },
  shadcn: {
    prefix: "",
    componentDir: "@/components/ui",
  },
  css: ["~/assets/css/tailwind.css"],
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ["localhost", "default.merry.earth", "lists.merry.earth"],
    },
    build: {
      sourcemap: false,
    },
  },
  nitro: {
    experimental: {
      websocket: true,
      tasks: true,
    },
    scheduledTasks: {
      "0 3 * * *": ["cleanup:checked-items"],
    },
  },
});
