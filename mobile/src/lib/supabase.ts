import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(20),
  VITE_PUBLIC_API_URL: z.string().url(),
  VITE_MOBILE_CUSTOMER_API_URL: z.string().url(),
  VITE_PUBLIC_WEB_URL: z.string().url().default("https://www.navigeto.com")
});

export const env = envSchema.parse(import.meta.env);

export const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storageKey: "navigeto-customer-mobile-auth"
  }
});
