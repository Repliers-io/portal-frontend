import { type LiveByDemographics } from 'services/API'

type ConfigItem<K extends string> = { key: K; label: string; color?: string }

export const ageLifeStageConfig: ConfigItem<
  keyof LiveByDemographics['age']['byLifeStage']
>[] = [
  { key: 'between0To9', label: 'Children 0–9' },
  { key: 'between10To17', label: 'Youth 10–17' },
  { key: 'between18To24', label: 'Young Adults 18–24' },
  { key: 'between25To64', label: 'Adults 25–64' },
  { key: 'between65To74', label: 'Seniors 65–74' },
  { key: 'between75AndOver', label: 'Seniors 75+' }
]

export const educationConfig: ConfigItem<
  keyof LiveByDemographics['education']
>[] = [
  { key: 'noDegree', label: 'No Degree' },
  { key: 'highSchool', label: 'High School' },
  { key: 'collegeBelowBachelor', label: 'Some College' },
  { key: 'bachelor', label: "Bachelor's" },
  { key: 'master', label: "Master's" },
  { key: 'doctorate', label: 'Doctorate' }
]

export const occupationLabels: Partial<
  Record<keyof LiveByDemographics['occupation'], string>
> = {
  sales: 'Sales & Service',
  trades: 'Trades',
  management: 'Management & Professional',
  agriculture: 'Farming & Fishing',
  manufacturing: 'Production & Transport',
  appliedScience: 'Applied Science',
  artCultureSport: 'Arts & Culture',
  businessFinanceAdmin: 'Business & Finance',
  educationLawSocialGovernment: 'Education & Government'
}

export const jobSectorConfig: ConfigItem<
  keyof LiveByDemographics['jobSector']
>[] = [
  { key: 'privateWorker', label: 'Private' },
  { key: 'governmentWorker', label: 'Government' },
  { key: 'notForProfitWorker', label: 'Non-Profit' },
  { key: 'selfEmployedWorker', label: 'Self-Employed' }
]

export const commuteTimeConfig: ConfigItem<
  keyof LiveByDemographics['commuteTime']
>[] = [
  { key: 'under15Minutes', label: '< 15 min' },
  { key: 'between15To29Minutes', label: '15–29 min' },
  { key: 'between30To59Minutes', label: '30–59 min' },
  { key: 'over60Minutes', label: '60+ min' }
]

export const transportationConfig: ConfigItem<
  Exclude<
    keyof LiveByDemographics['transportationMode'],
    'other' | 'carAlone' | 'carSelf'
  >
>[] = [
  { key: 'carDriver', label: 'Drive' },
  { key: 'carCarpool', label: 'Carpool' },
  { key: 'publicTransit', label: 'Public Transit' },
  { key: 'walked', label: 'Walk' },
  { key: 'bicycle', label: 'Bicycle' }
]

export const yearBuiltConfig: ConfigItem<
  keyof LiveByDemographics['yearBuilt']
>[] = [
  { key: 'before1970', label: 'Before 1970' },
  { key: 'between1970To1979', label: '1970–1979' },
  { key: 'between1980To1989', label: '1980–1989' },
  { key: 'between1990To1999', label: '1990–1999' },
  { key: 'between2000To2009', label: '2000–2009' },
  { key: 'between2010To2019', label: '2010–2019' },
  { key: 'after2019', label: '2020+' }
]

export const homeValueConfig: ConfigItem<
  keyof LiveByDemographics['homeValue']
>[] = [
  { key: 'below100000', label: '< $100K' },
  { key: 'between100000To150000', label: '$100K–$150K' },
  { key: 'between150000To200000', label: '$150K–$200K' },
  { key: 'between200000To300000', label: '$200K–$300K' },
  { key: 'between300000To500000', label: '$300K–$500K' },
  { key: 'above500000', label: '> $500K' }
]

export const roomsConfig: ConfigItem<keyof LiveByDemographics['rooms']>[] = [
  { key: 'studio', label: 'Studio' },
  { key: 'oneBedroom', label: '1 Bedroom' },
  { key: 'twoBedrooms', label: '2 Bedrooms' },
  { key: 'threeBedrooms', label: '3 Bedrooms' },
  { key: 'fourBedroomsOrMore', label: '4+ Bedrooms' }
]

export const maritalStatusConfig: ConfigItem<
  keyof LiveByDemographics['maritalStatus']
>[] = [
  { key: 'married', label: 'Married' },
  { key: 'single', label: 'Single' },
  { key: 'divorced', label: 'Divorced' },
  { key: 'widowed', label: 'Widowed' },
  { key: 'separated', label: 'Separated' }
]

export const enrollmentConfig: ConfigItem<
  Exclude<keyof LiveByDemographics['enrollment'], 'none'>
>[] = [
  { key: 'publicPrePrimarySchool', label: 'Public Pre-Primary' },
  { key: 'privatePrePrimarySchool', label: 'Private Pre-Primary' },
  { key: 'publicSchool', label: 'Public School' },
  { key: 'privateSchool', label: 'Private School' },
  { key: 'publicCollege', label: 'Public College' },
  { key: 'privateCollege', label: 'Private College' }
]

export const incomeConfig: ConfigItem<
  keyof LiveByDemographics['income']['byLevel']
>[] = [
  { key: 'between0To25000', label: 'Under $25K' },
  { key: 'between25000To35000', label: '$25K–$35K' },
  { key: 'between35000To50000', label: '$35K–$50K' },
  { key: 'between50000To75000', label: '$50K–$75K' },
  { key: 'between75000To100000', label: '$75K–$100K' },
  { key: 'over100000', label: 'Over $100K' }
]

export const rentConfig: ConfigItem<keyof LiveByDemographics['rent']>[] = [
  { key: 'under499', label: 'Under $499' },
  { key: 'between500To749', label: '$500–$749' },
  { key: 'between750To999', label: '$750–$999' },
  { key: 'over999', label: 'Over $999' }
]

export const mortgagePaymentConfig: ConfigItem<
  keyof LiveByDemographics['medianMortgagePayment']
>[] = [
  { key: 'under500', label: 'Under $500' },
  { key: 'between500To1000', label: '$500–$1K' },
  { key: 'between1000To2000', label: '$1K–$2K' },
  { key: 'between2000To3000', label: '$2K–$3K' },
  { key: 'between3000To4000', label: '$3K–$4K' },
  { key: 'over4000', label: 'Over $4K' }
]

export const ageCohortConfig: ConfigItem<
  keyof LiveByDemographics['age']['byCohort']
>[] = [
  { key: 'between0To4', label: '0–4' },
  { key: 'between5To9', label: '5–9' },
  { key: 'between10To14', label: '10–14' },
  { key: 'between15To19', label: '15–19' },
  { key: 'between20To24', label: '20–24' },
  { key: 'between25To29', label: '25–29' },
  { key: 'between30To34', label: '30–34' },
  { key: 'between35To39', label: '35–39' },
  { key: 'between40To44', label: '40–44' },
  { key: 'between45To49', label: '45–49' },
  { key: 'between50To54', label: '50–54' },
  { key: 'between55To59', label: '55–59' },
  { key: 'between60To64', label: '60–64' },
  { key: 'between65To69', label: '65–69' },
  { key: 'between70To74', label: '70–74' },
  { key: 'between75To79', label: '75–79' },
  { key: 'between80To84', label: '80–84' },
  { key: 'between85AndOver', label: '85+' }
]

export const incomeByCohortConfig: { key: string; label: string }[] = [
  { key: 'between0To10k', label: 'Under $10K' },
  { key: 'between10kTo15k', label: '$10K–$15K' },
  { key: 'between15kTo20k', label: '$15K–$20K' },
  { key: 'between20kTo25k', label: '$20K–$25K' },
  { key: 'between25kTo30k', label: '$25K–$30K' },
  { key: 'between30kTo35k', label: '$30K–$35K' },
  { key: 'between35kTo40k', label: '$35K–$40K' },
  { key: 'between40kTo45k', label: '$40K–$45K' },
  { key: 'between45kTo50k', label: '$45K–$50K' },
  { key: 'between50kTo60k', label: '$50K–$60K' },
  { key: 'between60kTo75k', label: '$60K–$75K' },
  { key: 'between75kTo100k', label: '$75K–$100K' },
  { key: 'between100kTo125k', label: '$100K–$125K' },
  { key: 'between125kTo150k', label: '$125K–$150K' },
  { key: 'between150kTo200k', label: '$150K–$200K' },
  { key: 'over200k', label: 'Over $200K' }
]
