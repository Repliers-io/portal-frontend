import { type PropertyInsights } from 'services/API'

import { calculateGroupsLayout, getGroupedInsights } from './utils'

describe('getGroupedInsights', () => {
  const insightsFor = (keys: string[]) =>
    ({
      images: keys.map((image, index) => ({
        image,
        classification: { imageOf: 'Kitchen', prediction: 0.9 - index / 10 },
        quality: null
      }))
    }) as PropertyInsights

  const resolve = (key: string) =>
    `https://cdn.repliers.io/${key}?webp&class=large&t=1758124391`

  // Insights name the image key, the gallery holds a resolved url with a cache
  // buster. Ordinal and UUID keys both have to land on the right photo.
  it.each([
    ['ordinal', ['IMG-X_1.jpg', 'IMG-X_2.jpg', 'IMG-X_3.jpg']],
    [
      'uuid',
      [
        'IMG-X13797204_82d343be-23c7-4b0a-998d-6cb5941f106b-l.jpg',
        'IMG-X13797204_00c372f8-18b7-4f04-9a46-ea21289d5b85-l.jpg',
        'IMG-X13797204_91ce462d-3119-4be6-8be1-5460e89d7fdd-l.jpg'
      ]
    ]
  ])('matches %s keys to their resolved url', (_shape, keys) => {
    const groups = getGroupedInsights(insightsFor(keys), keys.map(resolve))

    expect(groups.Kitchen.images.map((item) => item.image)).toEqual(
      keys.map(resolve)
    )
    expect(groups.Kitchen.images.map((item) => item.originalIndex)).toEqual([
      0, 1, 2
    ])
  })

  // Repliers serves keys both bare and under a directory, and the two sides of
  // this join need not agree on it.
  it('matches an insight key carrying a directory prefix', () => {
    const groups = getGroupedInsights(
      insightsFor(['area/IMG-X_1.jpg', 'area/IMG-X_2.jpg']),
      ['IMG-X_1.jpg', 'IMG-X_2.jpg'].map(resolve)
    )

    expect(groups.Kitchen.images.map((item) => item.originalIndex)).toEqual([
      0, 1
    ])
  })

  it('drops an insight whose image is not in the gallery', () => {
    const keys = ['IMG-X_1.jpg', 'IMG-X_2.jpg']
    const groups = getGroupedInsights(insightsFor(keys), [resolve(keys[1])])

    expect(groups.Kitchen.images).toHaveLength(1)
    expect(groups.Kitchen.images[0].originalIndex).toBe(0)
  })
})

describe('calculateGroupsLayout', () => {
  // Test cases for numImages without preference
  describe('without preference', () => {
    test('should return empty array for 0 images', () => {
      expect(calculateGroupsLayout(0)).toEqual([])
    })

    test('should return [6] for 1 image', () => {
      expect(calculateGroupsLayout(1)).toEqual([6])
    })

    test('should return [3,3] for 2 images', () => {
      expect(calculateGroupsLayout(2)).toEqual([3, 3])
    })

    test('should return [2,2,2] for 3 images', () => {
      expect(calculateGroupsLayout(3)).toEqual([2, 2, 2])
    })

    test('should return [6,2,2,2] for 4 images (special case)', () => {
      expect(calculateGroupsLayout(4)).toEqual([6, 2, 2, 2])
    })

    test('should return [3,3,2,2,2] for 5 images', () => {
      expect(calculateGroupsLayout(5)).toEqual([3, 3, 2, 2, 2])
    })

    test('should start with a single full-width row for 6 images, then layout 5', () => {
      // Special rule for 6: [6, ...layout for 5]
      // Layout for 5 is [3,3,2,2,2]
      expect(calculateGroupsLayout(6)).toEqual([6, 3, 3, 2, 2, 2])
    })

    test('should return [3,3,2,2,2,3,3] for 7 images', () => {
      // default: n2=2, n3=1, start with twoItem
      expect(calculateGroupsLayout(7)).toEqual([3, 3, 2, 2, 2, 3, 3])
    })

    test('should return [2,2,2,3,3,2,2,2] for 8 images (default, prefer interleaving)', () => {
      // For 8, defaultCounts should be {n2:1, n3:2}.
      // To ensure interleaving, actualStartRowType should become 'threeItem'.
      // Expected: 3-item, 2-item, 3-item
      expect(calculateGroupsLayout(8)).toEqual([2, 2, 2, 3, 3, 2, 2, 2])
    })

    test('should start with a single full-width row for 9 images, then layout 8', () => {
      // Layout for 8 images (default) is [2,2,2,3,3,2,2,2].
      // So, expected: [6, 2,2,2,3,3,2,2,2]
      expect(calculateGroupsLayout(9)).toEqual([6, 2, 2, 2, 3, 3, 2, 2, 2])
    })

    test('should return [3,3,2,2,2,3,3,2,2,2] for 10 images', () => {
      // default: n2=2, n3=2. Start with twoItem.
      expect(calculateGroupsLayout(10)).toEqual([3, 3, 2, 2, 2, 3, 3, 2, 2, 2])
    })
  })

  // Test cases with preferredStartRowType = 'twoItem'
  describe("with preferredStartRowType = 'twoItem'", () => {
    test('should return [3,3] for 2 images', () => {
      expect(calculateGroupsLayout(2, 'twoItem')).toEqual([3, 3])
    })

    test('should return [3,3,2,2,2] for 5 images', () => {
      expect(calculateGroupsLayout(5, 'twoItem')).toEqual([3, 3, 2, 2, 2])
    })

    test('should return [3,3,2,2,2,3,3] for 7 images (same as default)', () => {
      expect(calculateGroupsLayout(7, 'twoItem')).toEqual([3, 3, 2, 2, 2, 3, 3])
    })

    test('should return [2,2,2,3,3,2,2,2] for 8 images (preference leads to bad interleave, fallback to best default)', () => {
      // Preferring 'twoItem' with {n2:1, n3:2} for 8 images would start with [3,3]
      // leading to [3,3,2,2,2,2,2,2] (bad interleaving as two 3-item rows follow).
      // The logic should detect this and fall back to the best default layout for 8,
      // which is {n2:1, n3:2} starting with 'threeItem'.
      expect(calculateGroupsLayout(8, 'twoItem')).toEqual([
        2, 2, 2, 3, 3, 2, 2, 2
      ])
    })
  })

  // Test cases with preferredStartRowType = 'threeItem'
  describe("with preferredStartRowType = 'threeItem'", () => {
    test('should return [2,2,2] for 3 images', () => {
      expect(calculateGroupsLayout(3, 'threeItem')).toEqual([2, 2, 2])
    })

    test('should return [2,2,2,3,3] for 5 images', () => {
      // n2=1, n3=1. Start with threeItem.
      expect(calculateGroupsLayout(5, 'threeItem')).toEqual([2, 2, 2, 3, 3])
    })

    test('should return [3,3,2,2,2,3,3] for 7 images (preference ignored due to bad interleaving)', () => {
      // For 7: prefer threeItem -> n2=2, n3=1.
      // Bad interleave check: (n3-1 === 0 && n2 > 1) -> (1-1===0 && 2>1) -> true. So, usePreferred = false.
      // Falls back to default: n2=2, n3=1, start with twoItem.
      expect(calculateGroupsLayout(7, 'threeItem')).toEqual([
        3, 3, 2, 2, 2, 3, 3
      ])
    })

    test('should return [2,2,2,3,3,2,2,2] for 8 images', () => {
      // For 8: prefer threeItem -> n2=1, n3=2.
      // Start with threeItem. This is fine and provides good interleaving.
      expect(calculateGroupsLayout(8, 'threeItem')).toEqual([
        2, 2, 2, 3, 3, 2, 2, 2
      ])
    })

    test('should return [3,3] for 2 images (preference for threeItem cannot be fulfilled)', () => {
      // For 2: prefer threeItem -> n2=1, n3=0.
      // Bad interleave check: (preferredStartRowType === 'threeItem' && preferredCounts.n3 === 0) -> true. usePreferred = false.
      // Falls back to default: n2=1, n3=0, start with twoItem.
      expect(calculateGroupsLayout(2, 'threeItem')).toEqual([3, 3])
    })
  })

  // Test specific edge cases for "bad interleaving" logic
  describe('bad interleaving preference override', () => {
    // Case: numImages = 7, prefer 'threeItem'. Expected to fallback to default.
    it('numImages = 7, prefer threeItem -> should fallback to default [3,3,2,2,2,3,3]', () => {
      expect(calculateGroupsLayout(7, 'threeItem')).toEqual([
        3, 3, 2, 2, 2, 3, 3
      ])
    })

    it('numImages = 8, prefer twoItem -> should fallback to best default [2,2,2,3,3,2,2,2]', () => {
      // Preferring twoItem with {n2:1,n3:2} is bad ([3,3,2,2,2,2,2,2]), so it falls back to default.
      // Default for 8 is {n2:1,n3:2} starting with threeItem.
      expect(calculateGroupsLayout(8, 'twoItem')).toEqual([
        2, 2, 2, 3, 3, 2, 2, 2
      ])
    })

    // Case: numImages = 11
    // Default (prefer twoItem): n2=1, n3=3. Layout: [3,3, 2,2,2, 2,2,2, 2,2,2] (this is bad)
    // Prefer threeItem: n2=1, n3=3. Layout: [2,2,2, 3,3, 2,2,2, 2,2,2] (this is also bad)
    // The special rule for 11 should apply.
    it('numImages = 11, prefer threeItem -> should be [6,3,3,2,2,2,3,3,2,2,2]', () => {
      // Special rule for 11: [6, ...layout for 10]
      // Layout for 10 (default) is [3,3,2,2,2,3,3,2,2,2]
      expect(calculateGroupsLayout(11, 'threeItem')).toEqual([
        6, 3, 3, 2, 2, 2, 3, 3, 2, 2, 2
      ])
    })
    it('numImages = 11, default -> should be [6,3,3,2,2,2,3,3,2,2,2]', () => {
      // Special rule for 11: [6, ...layout for 10]
      expect(calculateGroupsLayout(11)).toEqual([
        6, 3, 3, 2, 2, 2, 3, 3, 2, 2, 2
      ])
    })
  })
})
