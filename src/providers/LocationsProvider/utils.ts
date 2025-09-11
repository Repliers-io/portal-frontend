import {
  type ApiBoardCity,
  type ApiLocations,
  type AutosuggestionOption
} from 'services/API'

import TrieSearch from './TrieSearch'

const createTrieSearch = (locations: ApiLocations) => {
  const trie = new TrieSearch<AutosuggestionOption>()

  const { boards } = locations
  const items: AutosuggestionOption[] = []
  // NOTE: debug-only fields, should be commented out in production
  // const skippedCities: any[] = []
  // const skippedNeighborhoods: any[] = []

  // initialize trie with cities and neighborhoods
  // skipping items without location or name
  boards.forEach((board) => {
    ;(board.classes || []).forEach((areaClass) => {
      areaClass.areas.forEach((area) => {
        area.cities.forEach((city) => {
          if (!city.location || !city.name) {
            // skippedCities.push(city)
            return
          }
          items.push({
            type: 'city',
            class: areaClass.name,
            source: city
          })
          if (city.neighborhoods) {
            city.neighborhoods.forEach((neighborhood) => {
              if (!neighborhood.location) {
                // skippedNeighborhoods.push(neighborhood)
                return
              }
              const {
                name,
                location: { lat, lng }
              } = city
              const {
                name: nameHood,
                location: { lat: latHood, lng: lngHood }
              } = neighborhood
              // skip the hood if city' name / coords and neighborhood' name / coords are the same
              if (name === nameHood && lat === latHood && lng === lngHood) {
                // skippedNeighborhoods.push(neighborhood)
                return
              }
              items.push({
                type: 'neighborhood',
                class: areaClass.name,
                source: neighborhood,
                parent: city
              })
            })
          }
        })
      })
    })
  })

  items
    .sort((a, b) => (a.type < b.type ? 1 : -1)) // neighborhoods first
    .forEach((node) => trie.insert(node, (node.source as ApiBoardCity).name))

  return trie
}

export { createTrieSearch }
