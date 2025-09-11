import { type PropertyImageInsights, type PropertyInsights } from 'services/API'
import { toSafeNumber } from 'utils/formatters'
import { getQualityLabel } from 'utils/properties'

const baseHeight = 400

export const getBaseHeight = (tablet: boolean) =>
  tablet ? baseHeight * 0.75 : baseHeight

export const getColumnHeight = (columns: number, tablet: boolean) => {
  const baseHeight = getBaseHeight(tablet)
  return columns === 6
    ? baseHeight
    : columns === 3
      ? baseHeight / 1.5
      : baseHeight / 2
}

type GroupedImageValue = Omit<PropertyImageInsights, 'classification'> & {
  originalIndex: number
  prediction: number | undefined
}

type GroupedInsightValue = {
  images: GroupedImageValue[]
}

export type GroupedInsightsType = Record<string, GroupedInsightValue>

export const getGroupImageTitle = (imgItem: GroupedImageValue): string => {
  const { prediction, quality } = imgItem
  let title = `PREDICTION: ${prediction?.toFixed(2) || 'N/A'}`
  if (quality) {
    const { quantitative = 0, qualitative } = quality
    title += ` | QUALITY: ★ ${quantitative.toFixed(2)} / ${getQualityLabel(qualitative).toUpperCase()}`
  }
  return title
}

export const calculateGroupsLayout = (
  numImages: number,
  preferredStartRowType?: 'twoItem' | 'threeItem'
): number[] => {
  if (numImages === 1) {
    return [6]
  }

  // Special handling for 6, 9 and 11 images if they are always problematic
  if (numImages === 6 || numImages === 9 || numImages === 11) {
    const firstRowLayout = [6]
    const remainingImages = numImages - 1
    // For preferredStartRowType, we might want to pass it along or reset it.
    // Resetting it (by not passing) is simpler for the recursive call.
    const remainingLayout = calculateGroupsLayout(remainingImages)
    return [...firstRowLayout, ...remainingLayout]
  }

  if (numImages === 4) {
    return [6, 2, 2, 2]
  }

  let n2_final = -1
  let n3_final = -1
  let actualStartRowType: 'twoItem' | 'threeItem' | undefined

  const findCounts = (
    preferThree: boolean
  ): { n2: number; n3: number } | null => {
    // Try to find a solution with both n2 > 0 and n3 > 0 first for better interleaving
    // This part is crucial for the "чередование - главный приоритет"
    let solutionWithBothTypes: { n2: number; n3: number } | null = null
    if (!preferThree) {
      // Default or preferTwoItem
      for (let n2 = Math.floor(numImages / 2); n2 > 0; n2--) {
        const rem = numImages - n2 * 2
        if (rem > 0 && rem % 3 === 0) {
          // n3 > 0
          solutionWithBothTypes = { n2, n3: rem / 3 }
          break
        }
      }
    } else {
      // preferThreeItem
      for (let n3 = Math.floor(numImages / 3); n3 > 0; n3--) {
        const rem = numImages - n3 * 3
        if (rem > 0 && rem % 2 === 0) {
          // n2 > 0
          solutionWithBothTypes = { n2: rem / 2, n3 }
          break
        }
      }
    }

    if (solutionWithBothTypes) return solutionWithBothTypes

    // If no solution with both types, find any valid solution (original logic)
    if (preferThree) {
      for (let n3 = Math.floor(numImages / 3); n3 >= 0; n3--) {
        const rem = numImages - n3 * 3
        if (rem >= 0 && rem % 2 === 0) {
          if (n3 > 0 || (n3 === 0 && rem === numImages))
            // Ensure preference is met if possible
            return { n2: rem / 2, n3 }
        }
      }
    } else {
      // Default or preferTwoItem
      for (let n2 = Math.floor(numImages / 2); n2 >= 0; n2--) {
        const rem = numImages - n2 * 2
        if (rem >= 0 && rem % 3 === 0) {
          return { n2, n3: rem / 3 }
        }
      }
    }
    return null
  }

  const defaultCounts = findCounts(false)

  if (!defaultCounts) {
    // Should not happen for numImages > 0 (except 1, 4)
    console.error(`Could not determine default n2/n3 for ${numImages} images.`)
    if (numImages > 0) {
      if (numImages <= 3 && numImages !== 0)
        return Array(numImages).fill(Math.floor(6 / numImages))
      return Array(numImages).fill(2)
    }
    return []
  }

  if (preferredStartRowType) {
    const preferredCounts = findCounts(preferredStartRowType === 'threeItem')
    if (preferredCounts) {
      let usePreferred = true
      // Check for "bad" interleaving due to preference
      // This check needs to ensure that the *chosen* start type doesn't immediately lead to non-interleaving
      // if an alternative combination or start type would allow interleaving.

      // If preferredCounts has only one type of row (e.g., n2=0 or n3=0)
      // and defaultCounts had both, prefer defaultCounts to enable interleaving.
      if (
        (preferredCounts.n2 === 0 &&
          preferredCounts.n3 > 0 &&
          defaultCounts.n2 > 0 &&
          defaultCounts.n3 > 0) ||
        (preferredCounts.n3 === 0 &&
          preferredCounts.n2 > 0 &&
          defaultCounts.n2 > 0 &&
          defaultCounts.n3 > 0)
      ) {
        // Prefer default if it allows interleaving and preferred does not.
        // This might be too aggressive, defer to specific badness checks.
      }

      if (preferredStartRowType === 'threeItem' && preferredCounts.n3 > 0) {
        // If starting with 3-item row (n3_pref > 0):
        // Bad if it forces next rows to be all 2-item (n3_pref-1 == 0) and there's more than one 2-item row (n2_pref > 1)
        // AND if defaultCounts could have offered a better interleaving start.
        if (preferredCounts.n3 - 1 === 0 && preferredCounts.n2 > 1) {
          // If default also had n2>0 and n3>0, and starting default with twoItem would be better
          if (defaultCounts.n2 > 0 && defaultCounts.n3 > 0) {
            // Simulate if default started with twoItem would be better than preferred with threeItem
            // This gets complex. Let's simplify: if preferred leads to this, and default *could* interleave, it's bad.
            usePreferred = false
          }
        }
      } else if (
        preferredStartRowType === 'twoItem' &&
        preferredCounts.n2 > 0
      ) {
        // If starting with 2-item row (n2_pref > 0):
        // Bad if it forces next rows to be all 3-item (n2_pref-1 == 0) and there's more than one 3-item row (n3_pref > 1)
        if (preferredCounts.n2 - 1 === 0 && preferredCounts.n3 > 1) {
          if (defaultCounts.n2 > 0 && defaultCounts.n3 > 0) {
            usePreferred = false
          }
        }
      } else if (
        (preferredStartRowType === 'threeItem' && preferredCounts.n3 === 0) ||
        (preferredStartRowType === 'twoItem' && preferredCounts.n2 === 0)
      ) {
        usePreferred = false // Preference cannot be fulfilled
      }

      if (usePreferred) {
        n2_final = preferredCounts.n2
        n3_final = preferredCounts.n3
        actualStartRowType = preferredStartRowType
      }
    }
  }

  // If preference was not used or not set
  if (n2_final === -1) {
    // This check for defaultCounts being null should ideally not be necessary if findCounts is robust for numImages > 0
    if (!defaultCounts) {
      // Fallback if defaultCounts is somehow null (e.g. numImages was 0 and slipped through, or error in findCounts)
      console.error(
        `Critical: defaultCounts is null for numImages: ${numImages}.`
      )
      // Provide a very basic fallback to prevent crashing, though this indicates a deeper issue.
      if (numImages > 0) {
        if (numImages % 2 === 0) return Array(numImages).fill(3) // Simplistic fallback
        if (numImages % 3 === 0) return Array(numImages).fill(2) // Simplistic fallback
        return [
          6,
          ...Array(numImages - 1).fill(
            Math.floor(6 / (numImages - 1 > 0 ? numImages - 1 : 1))
          )
        ] // single image + rest
      }
      return []
    }
    n2_final = defaultCounts.n2
    n3_final = defaultCounts.n3

    if (n2_final > 0 && n3_final > 0) {
      // Both types of rows exist. Choose starting row type that gives better interleaving.
      // Simulate layout for starting with twoItem
      let temp_n2 = n2_final,
        temp_n3 = n3_final
      let layoutTwoStartBad = false
      if (temp_n2 > 0) {
        // Start with twoItem
        temp_n2--
        if (temp_n2 === 0 && temp_n3 > 1) layoutTwoStartBad = true // Leads to multiple threeItem rows
      }

      // Simulate layout for starting with threeItem
      temp_n2 = n2_final
      temp_n3 = n3_final
      let layoutThreeStartBad = false
      if (temp_n3 > 0) {
        // Start with threeItem
        temp_n3--
        if (temp_n3 === 0 && temp_n2 > 1) layoutThreeStartBad = true // Leads to multiple twoItem rows
      }

      if (layoutTwoStartBad && !layoutThreeStartBad) {
        actualStartRowType = 'threeItem'
      } else if (!layoutTwoStartBad && layoutThreeStartBad) {
        actualStartRowType = 'twoItem'
      } else {
        // Both good or both bad, default to twoItem if available
        actualStartRowType = n2_final > 0 ? 'twoItem' : 'threeItem'
      }
    } else if (n2_final > 0) {
      actualStartRowType = 'twoItem'
    } else if (n3_final > 0) {
      actualStartRowType = 'threeItem'
    }
  }

  // Another check if n2_final or n3_final are still not set
  if (n2_final === -1 || n3_final === -1) {
    console.error(`Final n2/n3 determination failed for ${numImages}.`)
    if (numImages > 0) {
      if (numImages <= 3 && numImages !== 0)
        return Array(numImages).fill(Math.floor(6 / numImages))
      return Array(numImages).fill(2)
    }
    return []
  }

  let n2 = n2_final
  let n3 = n3_final
  const layout: number[] = []

  let nextRowIsTwoItem: boolean
  if (actualStartRowType === 'twoItem') {
    nextRowIsTwoItem = true
  } else if (actualStartRowType === 'threeItem') {
    nextRowIsTwoItem = false
  } else {
    // Fallback if actualStartRowType is undefined (e.g., numImages=0)
    // or if n2 and n3 are 0 after all calculations.
    nextRowIsTwoItem = n2 > 0 || (n2 === 0 && n3 === 0)
  }

  while (n2 > 0 || n3 > 0) {
    if (nextRowIsTwoItem && n2 > 0) {
      layout.push(3, 3)
      n2--
      // If 3-item rows are available for interleaving, next will be a 3-item row
      if (n3 > 0) nextRowIsTwoItem = false
    } else if (!nextRowIsTwoItem && n3 > 0) {
      layout.push(2, 2, 2)
      n3--
      // If 2-item rows are available for interleaving, next will be a 2-item row
      if (n2 > 0) nextRowIsTwoItem = true
    } else if (n2 > 0) {
      // Only 2-item rows left
      layout.push(3, 3)
      n2--
    } else if (n3 > 0) {
      // Only 3-item rows left
      layout.push(2, 2, 2)
      n3--
    } else {
      break // Just in case something went wrong
    }
  }

  if (layout.length === numImages) return layout

  console.error(
    `Layout construction mismatch for ${numImages} images. n2=${n2_final}, n3=${n3_final}. Layout length: ${layout.length}. Preferred: ${preferredStartRowType}, ActualStart: ${actualStartRowType}`
  )
  // Fallback if something went wrong during layout construction
  if (numImages > 0) {
    if (numImages <= 3 && numImages !== 0)
      return Array(numImages).fill(Math.floor(6 / numImages))
    return Array(numImages).fill(2)
  }
  return []
}

// Define the pattern of row types (number of items in a row)
const ROW_ITEM_COUNTS = [2, 3, 1] // Number of photos in rows of type: 2-photo, 3-photo, 1-photo
const ACTUAL_COLUMN_SPANS = [
  [3, 3], // Spans for a 2-photo row (type 0)
  [2, 2, 2], // Spans for a 3-photo row (type 1)
  [6] // Spans for a 1-photo row (type 2)
]

export const calculateGridLayout = (numImages: number): number[] => {
  if (numImages === 0) {
    return []
  }

  let bestLayout: number[] = []
  let minBadness = Infinity // Lower is better

  // Try all 3 possible start offsets for the pattern
  for (let startOffset = 0; startOffset < 3; startOffset++) {
    const currentLayout: number[] = []
    let imageIdx = 0
    let patternIteration = 0 // How many row types we've processed

    while (imageIdx < numImages) {
      const currentRowTypeIndex = (startOffset + patternIteration) % 3
      const itemsInFullRowOfType = ROW_ITEM_COUNTS[currentRowTypeIndex]
      const spansForFullRowOfType = ACTUAL_COLUMN_SPANS[currentRowTypeIndex]
      const remainingImagesOverall = numImages - imageIdx
      const imagesToPlaceInThisRow = Math.min(
        remainingImagesOverall,
        itemsInFullRowOfType
      )

      if (imagesToPlaceInThisRow === itemsInFullRowOfType) {
        for (let i = 0; i < imagesToPlaceInThisRow; i++) {
          currentLayout.push(spansForFullRowOfType[i])
          imageIdx++
        }
      } else {
        // Last partial row
        if (imagesToPlaceInThisRow === 1) {
          currentLayout.push(6)
        } else if (imagesToPlaceInThisRow === 2) {
          currentLayout.push(3, 3)
        } else if (imagesToPlaceInThisRow === 3) {
          // Should only happen if itemsInFullRowOfType was 3
          currentLayout.push(2, 2, 2)
        }
        imageIdx += imagesToPlaceInThisRow
      }
      patternIteration++
    }

    // Evaluate "badness" of this layout's ending
    // For now, a simple check: avoid [...,3,3],[3,3] if possible for numImages > 5 (e.g. 34)
    // This "badness" heuristic needs to be defined based on what's undesirable.
    // If the last two items are 3 and the two before that are also 3, it's "bad".
    let currentBadness = 0
    if (currentLayout.length >= 4) {
      if (
        currentLayout[currentLayout.length - 1] === 3 &&
        currentLayout[currentLayout.length - 2] === 3 &&
        currentLayout[currentLayout.length - 3] === 3 &&
        currentLayout[currentLayout.length - 4] === 3
      ) {
        currentBadness = 1 // Penalize [...,3,3,3,3] ending
      }
    }
    // Add more heuristics if needed, e.g., penalize single columns if they can be avoided.
    // For now, we prioritize any layout that doesn't have the specific bad ending.

    if (bestLayout.length === 0 || currentBadness < minBadness) {
      minBadness = currentBadness
      bestLayout = currentLayout
      if (minBadness === 0) break // Found a good enough layout
    } else if (
      currentBadness === minBadness &&
      currentLayout.length === numImages
    ) {
      // If badness is the same, prefer layouts that start with 2-item rows (offset 0) if possible,
      // as it's the "natural" start of the pattern.
      bestLayout = currentLayout
    }
  }

  return bestLayout
}

export const getGroupedInsights = (
  imageInsights: PropertyInsights | undefined
): GroupedInsightsType => {
  const allImages = imageInsights?.images || []
  if (!allImages.length) return {}

  return allImages.reduce<GroupedInsightsType>((acc, image) => {
    const { prediction, imageOf } = image.classification || {}
    const groupKey = imageOf?.trim() || 'Default'

    if (!acc[groupKey]) acc[groupKey] = { images: [] }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { classification, ...rest } = image
    const match = image.image.match(/_(\d+)\./)
    const originalIndex = toSafeNumber(match?.[1]) - 1

    acc[groupKey].images.push({ ...rest, prediction, originalIndex })
    return acc
  }, {})
}
