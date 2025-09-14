/* eslint-disable import/prefer-default-export */
import { type Property } from 'services/API'
import { toSafeNumber } from 'utils/formatters'

const getImageIndex = (image: string) => {
  return toSafeNumber(image?.split('_')[1])
}

const getScoreIndexes = (images: string[], scores: number[]) => {
  // eslint-disable-next-line no-param-reassign
  scores = scores.filter((score) => score > 0)

  let indexes
  if (scores && scores[0] > 0) {
    // WARN: see the next warning comment inside `sortPropertyScoredImages`
    // which explains the logic behind the image indexing
    const imagesStartIndex = getImageIndex([...images].sort()[0])

    indexes = images
      .slice(0, scores.length)
      .map((image) => getImageIndex(image) - imagesStartIndex)

    // special case of the first and the only image found with the max score,
    // no need to resort anything
    if (indexes.length === 1 && indexes[0] === 0) return undefined

    return indexes
  }

  return indexes
}

const rearrangeScores = (indexes: number[], imagesScore: number[]) => {
  const result: number[] = new Array(imagesScore.length).fill(0)

  indexes.forEach((score, index) => {
    if (score >= 0 && score < imagesScore.length) {
      result[score] = imagesScore[index]
    }
  })

  return result
}

const sortScoredImages = (images: string[]) => {
  return [...images].sort((a, b) => {
    const numA = getImageIndex(a)
    const numB = getImageIndex(b)

    if (numA === numB) {
      return a.localeCompare(b)
    }

    return numA - numB
  })
}

export const sortPropertyScoredImages = (property: Property) => {
  const { images, imagesScore = [] } = property

  // NOTE: we need to determine the starting index of the images in the array
  // to decide whether to resort them or not AND apply scores
  // WARN: most MLSes start numerating images from 1, but 'sample_data' starts from 0

  // get the starting index among all images
  const imagesStartIndex = getImageIndex([...images].sort()[0])
  // get the index of the first image
  const startImage = getImageIndex(images[0]) - imagesStartIndex
  const resort = imagesScore.length || startImage != imagesStartIndex

  if (!resort) return property

  let sortedScores: number[] = []
  const sortedImages = sortScoredImages(images)
  if (imagesScore.length) {
    // imagesScore is not empty, "AI Search" was used to fetch data
    const indexes = getScoreIndexes(images, imagesScore)
    sortedScores = indexes ? rearrangeScores(indexes, imagesScore) : imagesScore
  } else {
    // imagesScore is empty, "AI Covers / Spaces" was used to fetch data.
    // Generate fake scores array with the startImage having the max score
    sortedScores = new Array(images.length).fill(0)
    sortedScores[startImage] = 1
  }

  return {
    ...property,
    startImage,
    images: sortedImages,
    imagesScore: sortedScores
  } as Property
}
