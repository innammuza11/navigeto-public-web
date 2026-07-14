import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Device } from "@capacitor/device";
import { Network } from "@capacitor/network";
import { PushNotifications } from "@capacitor/push-notifications";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { supabase } from "./supabase";

let initialized = false;

export type NativeCallbacks = {
  onNetworkChange?: (connected: boolean) => void;
  onDeepLink?: (path: string) => void;
  onNotification?: () => void;
};

async function upsertDeviceSession(userId: string) {
  if (!Capacitor.isNativePlatform()) return;
  const [identifier, info] = await Promise.all([Device.getId(), Device.getInfo()]);
  const platform = Capacitor.getPlatform() as "ios" | "android";

  const { error } = await supabase.from("travelos_mobile_device_sessions").upsert({
    user_id: userId,
    app_id: "customer",
    platform,
    device_install_id: identifier.identifier,
    device_name: `${info.manufacturer || ""} ${info.model || ""}`.trim() || null,
    app_version: info.appVersion || null,
    last_seen_at: new Date().toISOString(),
    revoked_at: null
  }, { onConflict: "user_id,app_id,device_install_id" });

  if (error) console.error("Device session registration failed", error.message);
}

async function registerPush(userId: string) {
  const permission = await PushNotifications.checkPermissions().catch(() => null);
  let receive = permission?.receive;
  if (receive === "prompt") {
    const requested = await PushNotifications.requestPermissions().catch(() => null);
    receive = requested?.receive;
  }
  if (receive !== "granted") return;

  await PushNotifications.addListener("registration", async ({ value }) => {
    const [identifier, info] = await Promise.all([Device.getId(), Device.getInfo()]);
    const platform = Capacitor.getPlatform() as "ios" | "android";
    const provider = platform === "ios" ? "apns" : "fcm";

    const { error } = await supabase.from("travelos_mobile_device_tokens").upsert({
      user_id: userId,
      app_id: "customer",
      platform,
      device_install_id: identifier.identifier,
      provider,
      provider_token: value,
      app_version: info.appVersion || null,
      device_name: `${info.manufacturer || ""} ${info.model || ""}`.trim() || null,
      is_active: true,
      last_seen_at: new Date().toISOString()
    }, { onConflict: "app_id,device_install_id" });

    if (error) console.error("Push token registration failed", error.message);
  });

  await PushNotifications.addListener("registrationError", ({ error }) => {
    console.error("Native push registration failed", error);
  });

  await PushNotifications.register().catch(() => undefined);
}

export async function initializeNative(userId: string, callbacks: NativeCallbacks = {}) {
  if (!Capacitor.isNativePlatform() || initialized) return;
  initialized = true;

  await SplashScreen.hide().catch(() => undefined);
  await StatusBar.setStyle({ style: Style.Dark }).catch(() => undefined);
  await upsertDeviceSession(userId);

  const status = await Network.getStatus().catch(() => null);
  if (status) callbacks.onNetworkChange?.(status.connected);
  await Network.addListener("networkStatusChange", ({ connected }) => callbacks.onNetworkChange?.(connected));

  await App.addListener("appUrlOpen", ({ url }) => {
    try {
      const parsed = new URL(url);
      callbacks.onDeepLink?.(`${parsed.pathname}${parsed.search}${parsed.hash}` || "/");
    } catch {
      callbacks.onDeepLink?.("/");
    }
  });

  await PushNotifications.addListener("pushNotificationReceived", () => callbacks.onNotification?.());
  await PushNotifications.addListener("pushNotificationActionPerformed", () => callbacks.onNotification?.());
  await registerPush(userId);
}

export async function deactivateCurrentDevice(userId: string) {
  if (!Capacitor.isNativePlatform()) return;
  const identifier = await Device.getId();
  await Promise.all([
    supabase.from("travelos_mobile_device_tokens")
      .update({ is_active: false, last_seen_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("app_id", "customer")
      .eq("device_install_id", identifier.identifier),
    supabase.from("travelos_mobile_device_sessions")
      .update({ revoked_at: new Date().toISOString(), last_seen_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("app_id", "customer")
      .eq("device_install_id", identifier.identifier)
  ]);
}
