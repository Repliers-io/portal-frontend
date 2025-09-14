// import { getCatalogUrl } from 'utils/urls'

// import { fetchLocations } from './[[...slugs]]/_requests'
// import {
//   aggregateAndRemoveDuplicates,
//   extractCities,
//   extractHoods
// } from './[[...slugs]]/_utils'

// const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || ''
// const disableSSG = process.env.DISABLE_SSG || false

// const sitemap = async () => {
//   if (disableSSG) return []

//   const locations = await fetchLocations('')
//   const cities = aggregateAndRemoveDuplicates(extractCities(locations))

//   const result = await Promise.all(
//     cities.map(async (city) => {
//       if (!city || !city.name) return null

//       const cityEntry = {
//         url: `${domain}${getCatalogUrl(city.name)}`,
//         lastModified: new Date().toISOString(),
//         changeFrequency: 'monthly',
//         priority: 0.7
//       }

//       try {
//         const cityLocations = await fetchLocations(city.name)
//         const hoods = aggregateAndRemoveDuplicates(extractHoods(cityLocations))

//         const hoodEntries = hoods.map((hood) => ({
//           url: `${domain}${getCatalogUrl(city.name, hood.name)}`,
//           lastModified: new Date().toISOString(),
//           changeFrequency: 'weekly',
//           priority: 0.8
//         }))

//         return [cityEntry, ...hoodEntries]
//       } catch (error) {
//         console.error(
//           `Error processing neighborhoods for city ${city.name}:`,
//           error
//         )
//         // Return only the city entry if neighborhood fetching fails
//         return [cityEntry]
//       }
//     })
//   )

//   return result.flat().filter(Boolean)
// }

// export default sitemap
