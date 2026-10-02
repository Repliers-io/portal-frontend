// Hand-maintained building redirects exist only for tenants with a WordPress
// buildings CMS. This empty default keeps `@configs/redirects-buildings-manual`
// resolvable everywhere, so bundlers emit no module-not-found warnings for the
// other tenants.
const redirects: { source: string; destination: string; permanent: boolean }[] =
  []

export default redirects
