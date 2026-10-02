import { notFound } from 'next/navigation'
import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '../../mdx-components'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

type PageProps = {
  params: Promise<{ mdxPath: string[] }>
}

// This optional catch-all also matches the static-asset probes the browser fires on every
// page load (favicon.ico, robots.txt, *.png…). Those are not MDX pages, so `importPage`
// resolves them to `undefined` and throws `Cannot find module 'private-next-content-dir/undefined'`.
// Real MDX routes never contain a dot in a segment, so treat any dotted path as a 404
// instead of letting importPage crash the render.
function assertMdxPath(mdxPath?: string[]) {
  if (mdxPath?.some((segment) => segment.includes('.'))) notFound()
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params
  assertMdxPath(params.mdxPath)
  const { metadata } = await importPage(params.mdxPath)
  return metadata
}

// The theme's `wrapper` renders the content layout (sidebar grid, the article with
// max-width: var(--nextra-content-width), and the TOC). Without wrapping MDXContent in
// it, the page content renders as bare <body> children and stretches full width.
const Wrapper = getMDXComponents({}).wrapper

export default async function Page(props: PageProps) {
  const params = await props.params
  assertMdxPath(params.mdxPath)
  const result = await importPage(params.mdxPath)
  const { default: MDXContent, toc, metadata, sourceCode } = result
  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  )
}
