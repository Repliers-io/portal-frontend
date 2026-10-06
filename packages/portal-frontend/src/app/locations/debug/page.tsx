import { notFound } from 'next/navigation'

import routes from '@configs/routes'

import { type RouteSearchParamsProps } from 'app/types'

import { LocationsTree } from 'services/LocationsTree'

import { generateTreeHTML } from './_utils'

type DebugPageParams = RouteSearchParamsProps<{
  sortByCount?: string
  hideTrash?: string
  checkOrphans?: string
  checkAll?: string
}>

export default async function DebugPage({ searchParams }: DebugPageParams) {
  if (process.env.NODE_ENV === 'production') notFound()

  const params = await searchParams

  // Parse query parameters
  const sortByCount = params.sortByCount === 'true'
  const hideTrash = params.hideTrash === 'true'
  const checkOrphans = params.checkOrphans !== 'false' // Default true
  const checkAll = params.checkAll === 'true' // Default false

  // Build tree using LocationsTree service
  const result = await new LocationsTree().buildTree({
    sortByCount,
    hideTrash,
    checkOrphans,
    checkAll,
    areaThreshold: 200,
    debug: true // Enable debug mode to get stats
  })

  // Destructure result
  const { tree, statusMap, countsMap, stats, metadata } = result

  // Stats should always exist since debug: true, but TypeScript doesn't know that
  if (!stats) {
    throw new Error('Stats should be available in debug mode')
  }

  // no trash check
  // After tree build: 3141 nodes (Areas: 52, Cities: 584, Neighborhoods: 2505)
  // API Requests made: 77
  // Processing time: 557ms

  // Lightest real query stats
  // After tree build: 3104 nodes (Areas: 52, Cities: 564, Neighborhoods: 2488)
  // API Requests made: 77
  // Processing time: 3693ms

  // check orphans stats
  // After tree build: 3103 nodes (Areas: 52, Cities: 563, Neighborhoods: 2488)
  // API Requests made: 78
  // Processing time: 4252ms

  // Calculate tree size in KB/MB
  const treeSizeKB = (stats.treeSizeBytes / 1024).toFixed(2)
  const treeSizeMB = (stats.treeSizeBytes / (1024 * 1024)).toFixed(2)

  // Generate tree HTML for display
  const treeHTML = generateTreeHTML(tree, statusMap, countsMap, hideTrash)

  return (
    <div style={{ padding: '20px' }}>
      <h1>Location Tree Debug</h1>

      <div style={{ marginBottom: '20px' }}>
        <a
          href={`${routes.locations}/debug?sortByCount=${!sortByCount}&hideTrash=${hideTrash}&checkOrphans=${checkOrphans}&checkAll=${checkAll}`}
          style={{
            padding: '10px 20px',
            background: sortByCount ? '#28a745' : '#6c757d',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            display: 'inline-block',
            fontWeight: 'bold',
            marginRight: '10px'
          }}
        >
          {sortByCount ? '🔢 Sort by Count' : '🔤 Sort by Alphabet'}
        </a>
        <a
          href={`${routes.locations}/debug?sortByCount=${sortByCount}&hideTrash=${!hideTrash}&checkOrphans=${checkOrphans}&checkAll=${checkAll}`}
          style={{
            padding: '10px 20px',
            background: hideTrash ? '#28a745' : '#6c757d',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            display: 'inline-block',
            fontWeight: 'bold',
            marginRight: '10px'
          }}
        >
          {hideTrash ? '✓ Hide Trash' : '✗ Show Trash'}
        </a>
        <a
          href={`${routes.locations}/debug?sortByCount=${sortByCount}&hideTrash=${hideTrash}&checkOrphans=${!checkOrphans}&checkAll=${checkAll}`}
          style={{
            padding: '10px 20px',
            background: checkOrphans ? '#28a745' : '#6c757d',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            display: 'inline-block',
            fontWeight: 'bold',
            marginRight: '10px'
          }}
        >
          {checkOrphans ? '✓ Check Orphans' : '✗ Skip Orphans'}
        </a>
        <a
          href={`${routes.locations}/debug?sortByCount=${sortByCount}&hideTrash=${hideTrash}&checkOrphans=${checkOrphans}&checkAll=${!checkAll}`}
          style={{
            padding: '10px 20px',
            background: checkAll ? '#28a745' : '#6c757d',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            display: 'inline-block',
            fontWeight: 'bold'
          }}
        >
          {checkAll ? '✓ Check All Counts' : '✗ Check Duplicates Only'}
        </a>
        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          <strong>STATISTICS:</strong>
          <br />
          <strong>Locations from API:</strong> {stats.apiLocationsCount} nodes
          <br />
          <strong>After tree build:</strong> {stats.totalNodes.total} nodes
          (Areas: {stats.totalNodes.areas}, Cities: {stats.totalNodes.cities},
          Neighborhoods: {stats.totalNodes.neighborhoods})
          <br />
          <strong>Duplicates marked:</strong> {stats.duplicateNodes.total}{' '}
          (Cities: {stats.duplicateNodes.cities}, Neighborhoods:{' '}
          {stats.duplicateNodes.neighborhoods})
          <br />
          <strong>Trash marked:</strong> {stats.trashNodes.total} (Areas:{' '}
          {stats.trashNodes.areas}, Cities: {stats.trashNodes.cities},
          Neighborhoods: {stats.trashNodes.neighborhoods})
          <br />
          <strong>Non-trash nodes:</strong> {stats.nonTrashNodes.total} (Areas:{' '}
          {stats.nonTrashNodes.areas}, Cities: {stats.nonTrashNodes.cities},
          Neighborhoods: {stats.nonTrashNodes.neighborhoods})
          <br />
          <strong>Locations with counts:</strong> {countsMap.size} /{' '}
          {stats.totalNodes.total}
          {checkAll && (
            <>
              <br />
              <strong>Total listings count:</strong>{' '}
              {metadata.totalListings.toLocaleString()}
            </>
          )}
          <hr />
          <strong>Final tree JSON size:</strong>{' '}
          {stats.treeSizeBytes.toLocaleString()} bytes ({treeSizeKB} KB /{' '}
          {treeSizeMB} MB)
          <br />
          <strong>API Requests made:</strong> {metadata.requestCount}
          <br />
          <strong>Processing time:</strong> {metadata.processingTime}ms
        </div>
      </div>

      <div
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: treeHTML }}
      />
    </div>
  )
}
