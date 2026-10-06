import { type TreeNode } from '../types'

import { buildTree } from './build'

// LiveBy NYC: the borough city carries the county as its area, but most
// neighbourhoods are filed under the postal city "New York" in every borough —
// so matching (area, city) pairs leaves them orphaned (see `hoodsByArea`).
const area = { locationId: 'area-1', name: 'Kings County', type: 'area' }
const city = {
  locationId: 'city-1',
  name: 'Brooklyn',
  type: 'city-alternate',
  address: { area: 'Kings County' }
}
const hood = {
  locationId: 'hood-1',
  name: 'Park Slope',
  type: 'neighborhood',
  address: { area: 'Kings County', city: 'New York' }
}
const locations = [area, city, hood] as unknown as TreeNode[]

describe('buildTree hoodsByArea', () => {
  it('hangs a neighbourhood under the area’s city, matched by address.area alone', () => {
    const tree = buildTree(locations, false, true, true)

    expect(
      tree.areas[0].cities[0].neighborhoods.map((h) => h.locationId)
    ).toEqual(['hood-1'])
    expect(tree.orphanedNeighborhoods).toEqual([])
  })

  it('leaves it orphaned when off, since address.city ("New York") matches no city (today’s behavior)', () => {
    const tree = buildTree(locations, false, true, false)

    expect(tree.areas[0].cities[0].neighborhoods).toEqual([])
    expect(tree.orphanedNeighborhoods?.map((h) => h.locationId)).toEqual([
      'hood-1'
    ])
  })
})
