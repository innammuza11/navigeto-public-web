import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.navigeto.travel",
  appName: "Navigeto — Travel & Holidays",
  webDir: "dist",
  loggingBehavior: "debug",
  backgroundColor: "#f6f1e7",
  appendUserAgent: " NavigetoCustomer/0.1",
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  server: {
    hostname: "localhost",
    androidScheme: "https",
    iosScheme: "capacitor"
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: "#f6f1e7",
      showSpinner: false
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
