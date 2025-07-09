import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.wordreminder.www",
  appName: "Word Reminder",
  webDir: "dist",
  server: {
    androidScheme: "http",
    cleartext: true,
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
