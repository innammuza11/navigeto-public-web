import { createSeoMetadata } from "@/lib/seo";
import { AccountShell } from "./AccountShell";

export const metadata = createSeoMetadata({
  title: "My Navigeto Account",
  description: "Manage your Navigeto customer account, travellers and enquiries.",
  path: "/account",
  noIndex: true,
});

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
