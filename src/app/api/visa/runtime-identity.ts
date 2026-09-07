// Server-side deployment identity, never derived from request headers or hostnames.
// Netlify reserves SITE_ID and SITE_NAME at Functions runtime; NETLIFY is build-only.
// https://docs.netlify.com/build/functions/environment-variables/
const sites = {
  admin: { id: "66f75c9a-c466-43fc-94c7-740db6eaab6e", name: "navigeto-next" },
  public: { id: "db6d1981-151c-421e-8692-7412da9f85e3", name: "navigeto-b2c" },
} as const;
export function isTrustedVisaRuntime(role: keyof typeof sites, env: { SITE_ID?: string; SITE_NAME?: string } = { SITE_ID: process.env.SITE_ID, SITE_NAME: process.env.SITE_NAME }): boolean {
  const expected = sites[role];
  return env.SITE_ID === expected.id && env.SITE_NAME === expected.name;
}
