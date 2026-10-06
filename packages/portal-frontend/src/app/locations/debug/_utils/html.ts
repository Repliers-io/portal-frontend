import { type Tree } from 'services/LocationsTree'

/**
 * Generate full tree structure as HTML string
 */
export function generateTreeHTML(
  tree: Tree,
  statusMap?: Map<string, string>,
  countsMap?: Map<string, number>,
  hideTrash: boolean = false
): string {
  let html =
    '<div style="font-family: monospace; padding: 20px; background: #f5f5f5;">'
  html += '<h2>FULL TREE STRUCTURE</h2>\n\n'

  // DEBUG: Check for duplicate cities with same name in same area
  const cityDuplicates = new Map<string, (typeof tree.areas)[0]['cities']>()
  tree.areas.forEach((area) => {
    const cityNames = new Map<string, typeof area.cities>()
    area.cities.forEach((city) => {
      if (!cityNames.has(city.name)) {
        cityNames.set(city.name, [])
      }
      cityNames.get(city.name)!.push(city)
    })
    cityNames.forEach((cities, name) => {
      if (cities.length > 1) {
        cityDuplicates.set(`${area.name}::${name}`, cities)
      }
    })
  })

  if (cityDuplicates.size > 0) {
    html +=
      '<div style="background: #fff3cd; border: 3px solid #ff0000; padding: 15px; margin-bottom: 20px; border-radius: 5px;">'
    html +=
      '<h3 style="color: #cc0000; margin-top: 0;">⚠️ DUPLICATE CITIES IN SAME AREA DETECTED!</h3>'
    cityDuplicates.forEach((cities, key) => {
      const [areaName, cityName] = key.split('::')
      html +=
        '<div style="margin-bottom: 15px; padding: 10px; background: white; border-left: 4px solid #ff0000;">'
      html += `<strong>Area: ${areaName} → City: ${cityName}</strong> (${cities.length} duplicates)<br/>`
      cities.forEach((city) => {
        html += `<div style="margin-left: 20px; margin-top: 5px;">locationId: ${city.locationId} | neighborhoods: ${city.neighborhoods.length}</div>`
      })
      html += '</div>'
    })
    html += '</div>'
  }

  // Add CSS for collapsible
  html += `<style>
    * { font-family: monospace; line-height: 2;}
    .tree-city { margin-left: 20px; }
    .tree-hood { margin-left: 20px; white-space: pre-wrap; }
    .collapsible { cursor: pointer; user-select: none; }
    .collapsible:hover { background: #e0e0e0; }
    .collapsed-content { display: none; }
    .collapsed-content.open { display: block; }
  </style>`

  html += `<script>
    window.toggleCollapse = function(id) {
      const content = document.getElementById(id);
      const trigger = document.getElementById('trigger-' + id);
      const icon = trigger.querySelector('.toggle-icon');
      if (content.classList.contains('open')) {
        content.classList.remove('open');
        icon.textContent = '[+]';
      } else {
        content.classList.add('open');
        icon.textContent = '[-]';
      }
    }

    window.scrollToCity = function(cityId) {
      const anchorId = 'anchor-' + cityId;
      const cityAnchor = document.getElementById(anchorId);

      if (cityAnchor) {
        // Find parent area that might be collapsed and open it
        const parentArea = cityAnchor.closest('.collapsed-content');
        if (parentArea && !parentArea.classList.contains('open')) {
          const areaId = parentArea.id;
          const areaTrigger = document.getElementById('trigger-' + areaId);
          if (areaTrigger) {
            const areaIcon = areaTrigger.querySelector('.toggle-icon');
            parentArea.classList.add('open');
            if (areaIcon) {
              areaIcon.textContent = '[-]';
            }
          }
        }

        // Instant scroll
        cityAnchor.scrollIntoView({ behavior: 'auto', block: 'center' });

        // Highlight
        cityAnchor.parentElement.style.backgroundColor = '#ffff99';
        setTimeout(function() {
          cityAnchor.parentElement.style.backgroundColor = '';
        }, 2000);
      }
    }

    // Use event delegation on document to handle all duplicate links
    document.addEventListener('click', function(e) {
      // Check if clicked element or its parent is a duplicate link
      let target = e.target;
      while (target && target !== document) {
        if (target.classList && target.classList.contains('duplicate-link')) {
          e.preventDefault();
          e.stopPropagation();
          const cityId = target.getAttribute('data-city-id');
          if (cityId) {
            scrollToCity(cityId);
          }
          return false;
        }
        target = target.parentElement;
      }
    }, true); // Use capture phase
  </script>`

  // Map to track locationId -> cityId during rendering
  const locationIdToCityId = new Map<string, string>()

  // Build city index for duplicate detection (by name)
  const cityIndexByName = new Map<string, string[]>() // name -> [locationId1, locationId2...]

  tree.areas.forEach((area) => {
    area.cities.forEach((city) => {
      if (!cityIndexByName.has(city.name)) {
        cityIndexByName.set(city.name, [])
      }
      cityIndexByName.get(city.name)!.push(city.locationId)
    })
  })

  // Add orphaned cities to the index as well
  tree.orphanedCities?.forEach((city) => {
    if (!cityIndexByName.has(city.name)) {
      cityIndexByName.set(city.name, [])
    }
    cityIndexByName.get(city.name)!.push(city.locationId)
  })

  // Build a set of visible city locationIds if hideTrash is enabled
  const visibleCityIds = new Set<string>()
  if (hideTrash) {
    tree.areas.forEach((area) => {
      area.cities.forEach((city) => {
        const cityStatus = statusMap?.get(city.locationId)
        if (cityStatus) return // Skip any city with status (GARBAGE, DUPLICATE, ORPHAN)

        // Check if city has at least one non-trash neighborhood
        const hasVisibleNeighborhood = city.neighborhoods.some((hood) => {
          const hoodStatus = statusMap?.get(hood.locationId)
          return !hoodStatus // Only neighborhoods without status
        })

        if (hasVisibleNeighborhood) {
          visibleCityIds.add(city.locationId)
        }
      })
    })

    // Also add orphaned cities that are visible
    tree.orphanedCities?.forEach((city) => {
      const cityStatus = statusMap?.get(city.locationId)
      if (cityStatus) return // Skip any city with status

      // Check if city has at least one non-trash neighborhood
      const hasVisibleNeighborhood = city.neighborhoods.some((hood) => {
        const hoodStatus = statusMap?.get(hood.locationId)
        return !hoodStatus // Only neighborhoods without status
      })

      if (hasVisibleNeighborhood) {
        visibleCityIds.add(city.locationId)
      }
    })
  }

  // Print areas
  tree.areas.forEach((area, areaIdx) => {
    // Check if area itself is trash
    const areaStatus = statusMap?.get(area.locationId)
    const areaTrash = !!areaStatus

    // Skip area if it's marked as trash and hideTrash is enabled
    if (hideTrash && areaTrash) {
      return
    }

    // Filter cities if hideTrash is enabled
    const visibleCities = hideTrash
      ? area.cities.filter((city) => {
          const cityStatus = statusMap?.get(city.locationId)
          return cityStatus !== 'GARBAGE'
        })
      : area.cities

    // Skip area if all cities are hidden AND we're hiding trash
    // BUT if area is trash and hideTrash=false, show it even if empty
    if (visibleCities.length === 0) {
      // If hideTrash is enabled, skip empty areas
      if (hideTrash) return
      // If hideTrash is disabled but area is not trash, skip empty areas
      if (!areaTrash) return
      // If hideTrash is disabled and area IS trash, show it even if empty
    }

    const areaId = `area-${areaIdx}`
    const areaNameStyle = areaTrash ? 'color: #cc0000;' : ''
    const areaToggleIcon = visibleCities.length > 0 ? '[+]' : '[ ]'
    const hasChildren = visibleCities.length > 0

    // Calculate total listings count for this area (sum of all cities and neighborhoods)
    let areaListingsCount = 0
    if (countsMap) {
      area.cities.forEach((city) => {
        // Add city count if available
        const cityCount = countsMap.get(city.locationId)
        if (cityCount !== undefined && cityCount >= 0) {
          areaListingsCount += cityCount
        }
        // Add all neighborhood counts
        city.neighborhoods.forEach((hood) => {
          const hoodCount = countsMap.get(hood.locationId)
          if (hoodCount !== undefined && hoodCount >= 0) {
            areaListingsCount += hoodCount
          }
        })
      })
    }

    const areaListingsInfo =
      countsMap && areaListingsCount > 0
        ? `, <span style="color: #0066cc;">${areaListingsCount} listings</span>`
        : ''

    html += '<div class="tree-area">\n'
    if (hasChildren) {
      html += `<div class="collapsible" id="trigger-${areaId}" onclick="toggleCollapse('${areaId}')">`
      html += `<span class="toggle-icon">${areaToggleIcon}</span> AREA: <strong style="${areaNameStyle}">${area.name}</strong> <span style="color: #aaa;">(${area.locationId})</span> - ${visibleCities.length} cities${areaListingsInfo}</div>\n`
    } else {
      html += '<div>'
      html += `<span class="toggle-icon">${areaToggleIcon}</span> AREA: <strong style="${areaNameStyle}">${area.name}</strong> <span style="color: #aaa;">(${area.locationId})</span> - ${visibleCities.length} cities${areaListingsInfo}</div>\n`
    }

    html += `<div id="${areaId}" class="collapsed-content">\n`

    visibleCities.forEach((city) => {
      const cityId = `city-${city.locationId}`

      // Store mapping for later duplicate link generation
      locationIdToCityId.set(city.locationId, cityId)

      // Check for duplicates by name
      const sameName = cityIndexByName.get(city.name) || []
      const hasDuplicates = sameName.length > 1

      // We'll generate duplicate links later after all cityIds are known
      let duplicateInfo = ''
      if (hasDuplicates) {
        // Placeholder - will be replaced later
        duplicateInfo = ` <span class="duplicate-placeholder" data-location-id="${city.locationId}" data-city-name="${city.name}"></span>`
      }

      // const cityHasBoundary =
      //   city.map?.boundary && city.map.boundary.length > 0 ? '(B)' : '(·)'
      const cityHasBoundary = '' // Hidden: boundary indicator

      const cityStatus = statusMap?.get(city.locationId)
      const cityTrash = !!cityStatus
      const cityNameStyle = cityTrash ? 'color: #cc0000;' : ''

      // Show listings count if available
      const cityCount = countsMap?.get(city.locationId)
      const cityListingsInfo =
        cityCount !== undefined && cityCount >= 0
          ? `, <span style="color: #0066cc;">${cityCount} listings</span>`
          : ''

      // Filter neighborhoods if hideTrash is enabled
      const visibleNeighborhoods = hideTrash
        ? city.neighborhoods.filter((hood) => {
            const hoodStatus = statusMap?.get(hood.locationId)
            return !hoodStatus // Show only neighborhoods without any status
          })
        : city.neighborhoods

      const toggleIcon = visibleNeighborhoods.length > 0 ? '[+]' : '[ ]'
      const hasCityChildren = visibleNeighborhoods.length > 0

      html += '<div class="tree-city">\n'
      if (hasCityChildren) {
        html += `<div class="collapsible" id="trigger-${cityId}" onclick="toggleCollapse('${cityId}')">`
        html += `<span id="anchor-${cityId}" class="toggle-icon">${toggleIcon}</span> ${cityHasBoundary} CITY: <strong style="${cityNameStyle}">${city.name}</strong> <span style="color: #AAA;">(${city.locationId})</span> - ${visibleNeighborhoods.length} hoods${cityListingsInfo}${duplicateInfo}</div>\n`
      } else {
        html += '<div>'
        html += `<span id="anchor-${cityId}" class="toggle-icon">${toggleIcon}</span> ${cityHasBoundary} CITY: <strong style="${cityNameStyle}">${city.name}</strong> <span style="color: #AAA;">(${city.locationId})</span> - ${visibleNeighborhoods.length} hoods${cityListingsInfo}${duplicateInfo}</div>\n`
      }

      html += `<div id="${cityId}" class="collapsed-content">\n`

      visibleNeighborhoods.forEach((hood) => {
        const hasBoundary =
          hood.map?.boundary && hood.map.boundary.length > 0 ? '(B)' : '(·)'
        const duplicates = (hood as { duplicateLocationIds?: string[] })
          .duplicateLocationIds
        const dupInfo = duplicates
          ? ` <span style="color: #cc6600;">[duplicates: ${duplicates.join(
              ', '
            )}]</span>`
          : ''

        const hoodStatus = statusMap?.get(hood.locationId)
        const hoodTrash = !!hoodStatus
        const hoodNameStyle = hoodTrash ? 'color: #cc0000;' : ''

        // Show listings count if available
        const hoodCount = countsMap?.get(hood.locationId)
        const hoodListingsInfo =
          hoodCount !== undefined && hoodCount >= 0
            ? ` <span style="color: #0066cc;"> - ${hoodCount} listings</span>`
            : ''

        html += `<div class="tree-hood">${hasBoundary} HOOD: <strong style="${hoodNameStyle}">${hood.name}</strong> <span style="color: #AAA;">(${hood.locationId})</span>${hoodListingsInfo}${dupInfo}</div>\n`
      })

      html += '</div></div>\n'
    })

    html += '</div></div>\n'
  })

  // Print orphaned cities
  if (tree.orphanedCities && tree.orphanedCities.length > 0) {
    // Filter orphaned cities if hideTrash is enabled
    const visibleOrphanedCities = hideTrash
      ? tree.orphanedCities.filter((city) => {
          const cityStatus = statusMap?.get(city.locationId)
          return cityStatus !== 'GARBAGE'
        })
      : tree.orphanedCities

    if (visibleOrphanedCities.length > 0) {
      html += '\n<div style="margin-top: 60px;">\n'
      html += `ORPHANED CITIES (no area parent in the tree): ${visibleOrphanedCities.length}\n`
      visibleOrphanedCities.forEach((city) => {
        const cityId = `city-${city.locationId}`

        // Store mapping for later duplicate link generation
        locationIdToCityId.set(city.locationId, cityId)

        // Check for duplicates by name
        const sameName = cityIndexByName.get(city.name) || []
        const hasDuplicates = sameName.length > 1

        // Placeholder for duplicate info
        let duplicateInfo = ''
        if (hasDuplicates) {
          duplicateInfo = ` <span class="duplicate-placeholder" data-location-id="${city.locationId}" data-city-name="${city.name}"></span>`
        }

        const area = city.address?.area || ''
        // const cityHasBoundary =
        //   city.map?.boundary && city.map.boundary.length > 0 ? '(B)' : '(·)'
        const cityHasBoundary = '' // Hidden: boundary indicator

        const cityStatus = statusMap?.get(city.locationId)
        const orphanCityTrash = !!cityStatus
        const orphanCityNameStyle = orphanCityTrash ? 'color: #cc0000;' : ''

        // Show listings count if available
        const cityCount = countsMap?.get(city.locationId)
        const cityListingsInfo =
          cityCount !== undefined && cityCount >= 0
            ? `<span style="color: #0066cc;">, ${cityCount} listings</span>`
            : ''

        // Filter neighborhoods if hideTrash is enabled
        const visibleOrphanCityNeighborhoods = hideTrash
          ? city.neighborhoods.filter((hood) => {
              const hoodStatus = statusMap?.get(hood.locationId)
              return hoodStatus !== 'GARBAGE'
            })
          : city.neighborhoods

        const orphanToggleIcon =
          visibleOrphanCityNeighborhoods.length > 0 ? '[+]' : '[ ]'
        const hasOrphanCityChildren = visibleOrphanCityNeighborhoods.length > 0

        html += '<div class="tree-city">\n'
        if (hasOrphanCityChildren) {
          html += `<div class="collapsible" id="trigger-${cityId}" onclick="toggleCollapse('${cityId}')">`
          html += `<span id="anchor-${cityId}" class="toggle-icon">${orphanToggleIcon}</span> ${cityHasBoundary} ${
            area ? `${area} / ` : ''
          }<strong style="${orphanCityNameStyle}">${
            city.name
          }</strong> <span style="color: #999;">(${city.locationId})</span> - ${
            visibleOrphanCityNeighborhoods.length
          } hoods${cityListingsInfo}${duplicateInfo}</div>\n`
        } else {
          html += '<div>'
          html += `<span id="anchor-${cityId}" class="toggle-icon">${orphanToggleIcon}</span> ${cityHasBoundary} ${
            area ? `${area} / ` : ''
          }<strong style="${orphanCityNameStyle}">${
            city.name
          }</strong> <span style="color: #999;">(${city.locationId})</span> - ${
            visibleOrphanCityNeighborhoods.length
          } hoods${cityListingsInfo}${duplicateInfo}</div>\n`
        }

        html += `<div id="${cityId}" class="collapsed-content">\n`

        visibleOrphanCityNeighborhoods.forEach((hood) => {
          const hasBoundary =
            hood.map?.boundary && hood.map.boundary.length > 0 ? '(B)' : '(·)'

          const hoodStatus = statusMap?.get(hood.locationId)
          const orphanCityHoodTrash = !!hoodStatus
          const orphanCityHoodNameStyle = orphanCityHoodTrash
            ? 'color: #cc0000;'
            : ''

          // Show listings count if available
          const hoodCount = countsMap?.get(hood.locationId)
          const hoodListingsInfo =
            hoodCount !== undefined && hoodCount >= 0
              ? `<span style="color: #0066cc;"> - ${hoodCount} listings</span>`
              : ''

          html += `<div class="tree-hood">${hasBoundary} <strong style="${orphanCityHoodNameStyle}">${hood.name}</strong> <span style="color: #aaa;">(${hood.locationId})</span>${hoodListingsInfo}</div>\n`
        })

        html += '</div></div>\n'
      })
      html += '</div>\n'
    }
  }

  // Print orphaned neighborhoods
  if (tree.orphanedNeighborhoods && tree.orphanedNeighborhoods.length > 0) {
    // Filter orphaned neighborhoods if hideTrash is enabled
    const visibleOrphanedNeighborhoods = hideTrash
      ? tree.orphanedNeighborhoods.filter((hood) => {
          const hoodStatus = statusMap?.get(hood.locationId)
          return hoodStatus !== 'GARBAGE'
        })
      : tree.orphanedNeighborhoods

    if (visibleOrphanedNeighborhoods.length > 0) {
      html += '\n<div style="margin-top: 30px;">\n'
      html += `ORPHANED HOODS (no area+city parents in the tree): ${visibleOrphanedNeighborhoods.length}\n`
      visibleOrphanedNeighborhoods.forEach((hood) => {
        const area = hood.address?.area || ' '
        const city = hood.address?.city || ' '

        const hoodStatus = statusMap?.get(hood.locationId)
        const orphanHoodTrash = !!hoodStatus
        const orphanHoodNameStyle = orphanHoodTrash ? 'color: #cc0000;' : ''

        // Show listings count if available
        const hoodCount = countsMap?.get(hood.locationId)
        const hoodListingsInfo =
          hoodCount !== undefined && hoodCount >= 0
            ? `<span style="color: #0066cc;"> - ${hoodCount} listings</span>`
            : ''

        html += `<div class="tree-hood">${area} / ${city} / <strong style="${orphanHoodNameStyle}">${hood.name}</strong> <span style="color: #aaa;">(${hood.locationId})</span>${hoodListingsInfo}</div>\n`
      })
      html += '</div>\n'
    }
  }

  html += '</div>'

  // Post-process: Generate duplicate links now that all cityIds are known
  cityIndexByName.forEach((locationIds, cityName) => {
    if (locationIds.length > 1) {
      // This city name has duplicates
      locationIds.forEach((currentLocationId) => {
        const currentCityId = locationIdToCityId.get(currentLocationId)
        if (!currentCityId) return // City was filtered out

        // Find all other cities with same name
        let otherLocations = locationIds.filter(
          (locId) => locId !== currentLocationId
        )

        // Filter by visibility if hideTrash is enabled
        if (hideTrash) {
          otherLocations = otherLocations.filter((locId) =>
            visibleCityIds.has(locId)
          )
        }

        if (otherLocations.length === 0) return // No visible duplicates

        // Build links to other cities
        const links = otherLocations
          .map((locId) => {
            const targetCityId = locationIdToCityId.get(locId)
            if (!targetCityId) return null

            // Find the area for this city (could be in areas or orphanedCities)
            const cityData = tree.areas.find((a) =>
              a.cities.some((c) => c.locationId === locId)
            )

            let areaName: string

            if (cityData) {
              // City is in a regular area
              areaName = cityData.name
            } else {
              // Check if it's an orphaned city
              const orphanCity = tree.orphanedCities?.find(
                (c) => c.locationId === locId
              )
              if (!orphanCity) return null

              areaName = orphanCity.address?.area || 'Orphaned'
            }

            return `<a href="#" class="duplicate-link" data-city-id="${targetCityId}" style="color: #0066cc; text-decoration: underline; cursor: pointer;">${areaName}</a>`
          })
          .filter(Boolean)
          .join(', ')

        const duplicateInfo = ` <span style="color: #ff6600;">[⚠ duplicates in: ${links}]</span>`

        // Replace placeholder with actual duplicate info
        const placeholder = `<span class="duplicate-placeholder" data-location-id="${currentLocationId}" data-city-name="${cityName}"></span>`
        html = html.replace(placeholder, duplicateInfo)
      })
    }
  })

  return html
}
