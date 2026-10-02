import type { LiveByDemographics } from 'services/API/types'
import { formatEnglishPrice } from 'utils/formatters'

import {
  // ageCohortConfig,
  ageLifeStageConfig,
  commuteTimeConfig,
  educationConfig,
  enrollmentConfig,
  homeValueConfig,
  // incomeByCohortConfig,
  incomeConfig,
  jobSectorConfig,
  maritalStatusConfig,
  mortgagePaymentConfig,
  occupationLabels,
  rentConfig,
  roomsConfig,
  transportationConfig,
  yearBuiltConfig
} from './constants'
import type {
  LiveByAgeSection,
  LiveByDemographicsSection,
  LiveByDistributionGroup,
  LiveByScalarMetric
} from './types'

const toPercentItems = <T extends { label: string; color?: string }>(
  items: T[],
  counts: number[]
): Array<T & { percentage: number }> => {
  const total = counts.reduce((a, b) => a + b, 0)
  if (total === 0) return items.map((item) => ({ ...item, percentage: 0 }))
  return items.map((item, i) => ({
    ...item,
    percentage: (counts[i] / total) * 100
  }))
}

const scalar = (label: string, value: string): LiveByScalarMetric => ({
  kind: 'scalar',
  label,
  value
})

const currency = (value: number) => formatEnglishPrice(value, 0)

const distribution = (
  title: string,
  items: LiveByDistributionGroup['items']
): LiveByDistributionGroup => ({ kind: 'distribution', title, items })

const grid = (
  columns: number,
  groups: LiveByDistributionGroup[]
): LiveByDistributionGroup[] => groups.map((g) => ({ ...g, columns }))

export const buildDemographicsSections = (
  d: LiveByDemographics
): LiveByDemographicsSection[] => {
  // ── 1. Population ────────────────────────────────────────────────────────
  const genderItems = toPercentItems(
    [{ label: 'Male' }, { label: 'Female' }],
    [d.percentMale, d.percentFemale]
  )
  const populationSection: LiveByDemographicsSection = {
    id: 'population',
    title: 'Population',
    content: [
      scalar('Residents', d.population.toLocaleString('en-US')),
      scalar(
        'Population Density',
        `${Math.round(d.populationDensity).toLocaleString('en-US')} / sq mi`
      ),
      scalar('Median Age', `${d.medianAge} yrs`),
      { ...distribution('Gender', genderItems), variant: 'stacked' as const }
    ]
  }

  // ── 2. Income & Housing ──────────────────────────────────────────────────
  const occupancyItems = toPercentItems(
    [
      { label: 'Owner-occupied' },
      { label: 'Absentee-owned' },
      { label: 'Renter-occupied' },
      { label: 'Vacant' }
    ],
    [
      d.occupancy.unitOccupiedOwner,
      d.occupancy.absenteeOwner,
      d.occupancy.unitOccupiedRenter,
      d.occupancy.vacant
    ]
  )
  const incomeHousingSection: LiveByDemographicsSection = {
    id: 'incomeHousing',
    title: 'Income & Housing',
    content: [
      scalar('Median Household Income', currency(d.medianIncome)),
      scalar('Median Home Value', currency(d.medianHouseValue)),
      scalar('Median Monthly Rent', currency(d.medianRentMonthlyCost)),
      scalar('Median Monthly Mortgage', currency(d.medianMortgageMonthlyCost)),
      ...grid(2, [
        distribution(
          'Income Distribution',
          toPercentItems(
            incomeConfig.map(({ label, color }) => ({ label, color })),
            incomeConfig.map(({ key }) => d.income.byLevel[key])
          )
        ),
        distribution('Occupancy', occupancyItems)
        // {
        //   ...distribution(
        //     'Income by Bracket',
        //     toPercentItems(
        //       incomeByCohortConfig.map(({ label }) => ({ label })),
        //       incomeByCohortConfig.map(({ key }) => d.income.byCohort[key] ?? 0)
        //     )
        //   ),
        //   variant: 'stacked' as const,
        //   span: 2
        // }
      ])
    ]
  }

  // ── 3. Age Distribution ──────────────────────────────────────────────────
  const ageItem: LiveByAgeSection = {
    kind: 'age',
    ages: toPercentItems(
      ageLifeStageConfig.map(({ label, color }) => ({ label, color })),
      ageLifeStageConfig.map(({ key }) => d.age.byLifeStage[key])
    )
  }
  const ageDistributionSection: LiveByDemographicsSection = {
    id: 'ageDistribution',
    title: 'Age Distribution',
    content: [
      ageItem
      // {
      //   ...distribution(
      //     'Age by Cohort',
      //     toPercentItems(
      //       ageCohortConfig.map(({ label, color }) => ({ label, color })),
      //       ageCohortConfig.map(({ key }) => d.age.byCohort[key])
      //     )
      //   ),
      //   variant: 'stacked' as const
      // }
    ]
  }

  // ── 4. Education ─────────────────────────────────────────────────────────
  const educationSection: LiveByDemographicsSection = {
    id: 'education',
    title: 'Education',
    content: [
      ...grid(2, [
        distribution(
          'Attainment',
          toPercentItems(
            educationConfig.map(({ label, color }) => ({ label, color })),
            educationConfig.map(({ key }) => d.education[key])
          )
        ),
        distribution(
          'School Enrollment',
          toPercentItems(
            enrollmentConfig.map(({ label, color }) => ({ label, color })),
            enrollmentConfig.map(({ key }) => d.enrollment[key])
          )
        )
      ])
    ]
  }

  // ── 5. Employment ────────────────────────────────────────────────────────
  const topOccupations = (
    Object.entries(d.occupation) as Array<
      [keyof LiveByDemographics['occupation'], number]
    >
  )
    .filter(([key]) => key !== 'notApplicable')
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
  const employmentSection: LiveByDemographicsSection = {
    id: 'employment',
    title: 'Employment',
    content: [
      ...grid(2, [
        {
          ...distribution(
            'Job Type',
            toPercentItems(
              [{ label: 'White Collar' }, { label: 'Blue Collar' }],
              [d.jobType.whiteCollar, d.jobType.blueCollar]
            )
          ),
          variant: 'stacked' as const,
          span: 2
        },
        distribution(
          'Top Occupations',
          toPercentItems(
            topOccupations.map(([key]) => ({
              label: occupationLabels[key] ?? key
            })),
            topOccupations.map(([, count]) => count)
          )
        ),
        distribution(
          'Job Sector',
          toPercentItems(
            jobSectorConfig.map(({ label, color }) => ({ label, color })),
            jobSectorConfig.map(({ key }) => d.jobSector[key])
          )
        )
      ])
    ]
  }

  // ── 6. Transportation ────────────────────────────────────────────────────
  const activeModes = transportationConfig.filter(
    ({ key }) => d.transportationMode[key] > 0
  )
  const transportationSection: LiveByDemographicsSection = {
    id: 'transportation',
    title: 'Transportation',
    content: grid(2, [
      distribution(
        'Commute Time',
        toPercentItems(
          commuteTimeConfig.map(({ label, color }) => ({ label, color })),
          commuteTimeConfig.map(({ key }) => d.commuteTime[key])
        )
      ),
      distribution(
        'How People Get Around',
        toPercentItems(
          activeModes.map(({ label, color }) => ({ label, color })),
          activeModes.map(({ key }) => d.transportationMode[key])
        )
      )
    ])
  }

  // ── 7. Housing Stock ─────────────────────────────────────────────────────
  const housingStockSection: LiveByDemographicsSection = {
    id: 'housingStock',
    title: 'Housing Stock',
    content: grid(2, [
      distribution(
        'Year Built',
        toPercentItems(
          yearBuiltConfig.map(({ label, color }) => ({ label, color })),
          yearBuiltConfig.map(({ key }) => d.yearBuilt[key])
        )
      ),
      distribution(
        'Home Value',
        toPercentItems(
          homeValueConfig.map(({ label, color }) => ({ label, color })),
          homeValueConfig.map(({ key }) => d.homeValue[key])
        )
      ),
      distribution(
        'Monthly Mortgage',
        toPercentItems(
          mortgagePaymentConfig.map(({ label, color }) => ({ label, color })),
          mortgagePaymentConfig.map(({ key }) => d.medianMortgagePayment[key])
        )
      ),
      distribution(
        'Monthly Rent',
        toPercentItems(
          rentConfig.map(({ label, color }) => ({ label, color })),
          rentConfig.map(({ key }) => d.rent[key])
        )
      ),
      {
        ...distribution(
          'Bedrooms',
          toPercentItems(
            roomsConfig.map(({ label, color }) => ({ label, color })),
            roomsConfig.map(({ key }) => d.rooms[key])
          )
        ),
        variant: 'stacked' as const,
        span: 2
      }
    ])
  }

  // ── 8. Households ────────────────────────────────────────────────────────
  const householdScalars: LiveByScalarMetric[] = [
    scalar('Private Households', d.privateHouseholds.toLocaleString('en-US')),
    scalar('Average Household Size', d.averageHouseholdSize?.toFixed(1) ?? '—'),
    scalar('Average Rooms', d.averageRooms.toFixed(1)),
    scalar(
      'Education Climate Index',
      `${d.educationClimateIndex.toFixed(1)} / 5`
    )
  ]
  if (d.householdsWithChildren != null) {
    householdScalars.push(
      scalar(
        'Households with Children',
        d.householdsWithChildren.toLocaleString('en-US')
      )
    )
  }
  if (d.annualResidentialTurnover != null) {
    householdScalars.push(
      scalar(
        'Annual Residential Turnover',
        `${d.annualResidentialTurnover.toLocaleString('en-US')} / yr`
      )
    )
  }
  const householdsSection: LiveByDemographicsSection = {
    id: 'households',
    title: 'Households',
    scalarColumns: 3,
    content: [
      ...householdScalars,
      {
        ...distribution(
          'Marital Status',
          toPercentItems(
            maritalStatusConfig.map(({ label, color }) => ({ label, color })),
            maritalStatusConfig.map(({ key }) => d.maritalStatus[key])
          )
        ),
        variant: 'donut' as const,
        sortByPercentage: true
      }
    ]
  }

  return [
    populationSection,
    incomeHousingSection,
    ageDistributionSection,
    educationSection,
    employmentSection,
    transportationSection,
    housingStockSection,
    householdsSection
  ]
}
