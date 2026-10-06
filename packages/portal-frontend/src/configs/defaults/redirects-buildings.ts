// Building redirects are generated per tenant by scripts/generate-building-redirects.ts
// (only tenants with a WordPress buildings CMS have them). This empty default keeps
// `@configs/redirects-buildings` resolvable everywhere, so bundlers emit no
// module-not-found warnings for the other tenants.
const redirects: { source: string; destination: string; permanent: boolean }[] =
  []

export default redirects
