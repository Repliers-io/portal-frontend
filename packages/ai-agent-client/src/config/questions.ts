type PortalAction = { type: string; payload?: any }

export interface QuestionOption {
  message: string
  answer?: string
  action?: PortalAction | PortalAction[]
  localAction?: string | string[]
  nextOptions?: QuestionOption[]
}

export const initialQuestions: QuestionOption[] = [
  {
    message: 'Find me houses with 4 bathrooms',
    answer: 'There are several listings right in the current page.',
    nextOptions: [
      {
        message: 'Show it to me',
        localAction: 'OpenListing',
        nextOptions: [
          {
            message: 'Start over',
            localAction: 'RestartDialog'
          }
        ]
      },
      {
        message: 'Lets update search filters',
        answer: "Sure! I've updated your search filters.",
        action: [
          { type: 'CloseListing' },
          {
            type: 'ExtractFilters',
            payload: { query: 'Find me houses with 4 bathrooms' }
          }
        ],
        nextOptions: [
          {
            message: 'Add minimum 6 bedrooms',
            answer: "Sure! I've added them to existing filters.",
            action: [
              {
                type: 'ExtractFilters',
                payload: {
                  query: 'Add minimum 6 bedrooms'
                }
              }
            ],
            nextOptions: [
              {
                message: 'Start over',
                localAction: 'RestartDialog'
              }
            ]
          },
          {
            message: 'Start over',
            localAction: 'RestartDialog'
          }
        ]
      }
    ]
  },
  {
    message: 'Find me 4 bedroom home',
    answer: "Sure! I've narrowed search to 4 bedroom homes only.",
    action: [
      // { type: 'CloseListing' },
      {
        type: 'ExtractFilters',
        payload: { query: 'find me 4 bedroom home' }
      }
    ],
    nextOptions: [
      {
        message: 'Start over',
        localAction: 'RestartDialog'
      }
    ]
  },
  {
    message: 'Change my agent',
    localAction: 'ChangeAgent'
  }
]
