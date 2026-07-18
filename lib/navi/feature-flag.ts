export function isNaviPublicEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_NAVI_PUBLIC === "true";
}
