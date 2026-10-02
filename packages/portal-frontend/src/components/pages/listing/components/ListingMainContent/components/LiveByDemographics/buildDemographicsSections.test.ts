import type { LiveByDemographics } from 'services/API/types'

import { buildDemographicsSections } from './buildDemographicsSections'
import type {
  LiveByAgeSection,
  LiveByDistributionGroup,
  LiveByScalarMetric
} from './types'

const demographics: LiveByDemographics = {
  age: {
    byCohort: {
      between0To4: 1114,
      between5To9: 1208,
      between10To14: 739,
      between15To19: 879,
      between20To24: 642,
      between25To29: 2057,
      between30To34: 2771,
      between35To39: 2392,
      between40To44: 1457,
      between45To49: 1107,
      between50To54: 608,
      between55To59: 1031,
      between60To64: 764,
      between65To69: 482,
      between70To74: 529,
      between75To79: 222,
      between80To84: 165,
      between85AndOver: 250
    },
    byLifeStage: {
      between0To9: 2322,
      between10To17: 1308,
      between18To24: 952,
      between25To64: 12187,
      between65To74: 1011,
      between75AndOver: 637
    }
  },
  rent: {
    over999: 2023,
    under499: 316,
    between500To749: 93,
    between750To999: 229
  },
  rooms: {
    studio: 242,
    oneBedroom: 587,
    twoBedrooms: 1417,
    threeBedrooms: 1673,
    fourBedroomsOrMore: 0
  },
  income: {
    byLevel: {
      over100000: 3725,
      between0To25000: 1218,
      between25000To35000: 266,
      between35000To50000: 561,
      between50000To75000: 771,
      between75000To100000: 793
    },
    byCohort: {}
  },
  jobType: { blueCollar: 1485, whiteCollar: 9689 },
  education: {
    master: 1733,
    bachelor: 4615,
    noDegree: 1993,
    doctorate: 232,
    highSchool: 2752,
    collegeBelowBachelor: 2509
  },
  homeValue: {
    above500000: 2115,
    below100000: 266,
    between100000To150000: 75,
    between150000To200000: 74,
    between200000To300000: 302,
    between300000To500000: 1813
  },
  jobSector: {
    privateWorker: 7283,
    governmentWorker: 1843,
    notForProfitWorker: 770,
    selfEmployedWorker: 539,
    unpaidFamilyWorker: 739
  },
  medianAge: 35,
  occupancy: {
    vacant: 531,
    absenteeOwner: 3221,
    unitOccupiedOwner: 4645,
    unitOccupiedRenter: 2690
  },
  yearBuilt: {
    after2019: 351,
    before1970: 3236,
    between1970To1979: 868,
    between1980To1989: 582,
    between1990To1999: 357,
    between2000To2009: 929,
    between2010To2019: 1542
  },
  enrollment: {
    none: 14487,
    publicSchool: 3200,
    privateSchool: 858,
    publicCollege: 826,
    privateCollege: 57,
    publicPrePrimarySchool: 265,
    privatePrePrimarySchool: 218
  },
  occupation: {
    sales: 1916,
    trades: 1404,
    management: 6250,
    agriculture: 887,
    manufacturing: 2654,
    notApplicable: 4642,
    appliedScience: 377,
    artCultureSport: 848,
    businessFinanceAdmin: 531,
    educationLawSocialGovernment: 2838
  },
  population: 18418,
  commuteTime: {
    over60Minutes: 792,
    under15Minutes: 1611,
    between15To29Minutes: 3610,
    between30To59Minutes: 1818
  },
  percentMale: 51.65,
  percentFemale: 48.35,
  medianIncome: 107528,
  maritalStatus: {
    single: 7646,
    married: 4589,
    widowed: 531,
    divorced: 1692,
    separated: 900
  },
  countMarried: 5489,
  countUnmarried: 9868,
  medianHouseValue: 485341,
  populationDensity: 4405.52,
  populationDensityUnit: 'm',
  privateHouseholds: 7500,
  transportationMode: {
    other: 3193,
    walked: 49,
    bicycle: 201,
    carSelf: 250,
    carAlone: 6545,
    carDriver: 7426,
    carCarpool: 881,
    publicTransit: 249
  },
  averageHouseholdSize: 2,
  averageRooms: 5,
  educationClimateIndex: 3.0625,
  medianMortgagePayment: {
    over4000: 288,
    under500: 345,
    between500To1000: 803,
    between1000To2000: 1075,
    between2000To3000: 1224,
    between3000To4000: 1027
  },
  medianRentMonthlyCost: 1264,
  medianMortgageMonthlyCost: 1203,
  metadata: { source: 'US', attribution: 'American Census Survey 2023' }
}

describe('buildDemographicsSections', () => {
  const sections = buildDemographicsSections(demographics)

  it('returns exactly 8 sections', () => {
    expect(sections).toHaveLength(8)
  })

  it('section ids are in the expected order', () => {
    expect(sections.map((s) => s.id)).toEqual([
      'population',
      'incomeHousing',
      'ageDistribution',
      'education',
      'employment',
      'transportation',
      'housingStock',
      'households'
    ])
  })

  it('population section formats population count with locale separators', () => {
    const section = sections.find((s) => s.id === 'population')!
    const scalars = section.content.filter(
      (c): c is LiveByScalarMetric => c.kind === 'scalar'
    )
    expect(scalars.some((s) => s.value === '18,418')).toBe(true)
  })

  it('incomeHousing section formats medianIncome as currency', () => {
    const section = sections.find((s) => s.id === 'incomeHousing')!
    const scalars = section.content.filter(
      (c): c is LiveByScalarMetric => c.kind === 'scalar'
    )
    expect(scalars.some((s) => s.value === '$107,528')).toBe(true)
  })

  it('ageDistribution section has exactly 6 age buckets', () => {
    const section = sections.find((s) => s.id === 'ageDistribution')!
    const ageItem = section.content.find(
      (c): c is LiveByAgeSection => c.kind === 'age'
    )
    expect(ageItem?.ages).toHaveLength(6)
  })

  it('age percentages sum to 100', () => {
    const section = sections.find((s) => s.id === 'ageDistribution')!
    const ageItem = section.content.find(
      (c): c is LiveByAgeSection => c.kind === 'age'
    )!
    const sum = ageItem.ages.reduce((a, b) => a + b.percentage, 0)
    expect(sum).toBe(100)
  })

  it('employment top occupations exclude notApplicable and cap at 5', () => {
    const section = sections.find((s) => s.id === 'employment')!
    const topOcc = section.content.find(
      (c): c is LiveByDistributionGroup =>
        c.kind === 'distribution' && c.title === 'Top Occupations'
    )!
    expect(topOcc.items.length).toBeLessThanOrEqual(5)
    expect(topOcc.items.map((i) => i.label)).not.toContain('notApplicable')
  })

  it('shows a dash for an Average Household Size LiveBy lacks', () => {
    const households = buildDemographicsSections({
      ...demographics,
      averageHouseholdSize: null
    }).find((s) => s.id === 'households')!
    expect(households.content).toContainEqual({
      kind: 'scalar',
      label: 'Average Household Size',
      value: '—'
    })
  })

  it('distribution percentages are numbers between 0 and 100', () => {
    sections.forEach((section) => {
      section.content.forEach((item) => {
        if (item.kind === 'distribution') {
          item.items.forEach((row) => {
            expect(typeof row.percentage).toBe('number')
            expect(row.percentage).toBeGreaterThanOrEqual(0)
            expect(row.percentage).toBeLessThanOrEqual(100)
          })
        }
      })
    })
  })
})
