import type {
  ApiAgentsCreateParams,
  ApiRplAgent,
  FubUserDiff
} from 'services/API'
import { formatPhoneNumber } from 'utils/formatters'

const comparePhoneNumbers = (phone1: string, phone2: string): boolean => {
  return formatPhoneNumber(phone1) === formatPhoneNumber(phone2)
}

const compareEmails = (email1: string, email2: string): boolean => {
  return email1.trim().toLowerCase() === email2.trim().toLowerCase()
}

const diffAgent = (
  agentMappedFields: ApiAgentsCreateParams,
  agent: ApiRplAgent
): FubUserDiff[] => {
  return Object.entries(agentMappedFields).reduce<FubUserDiff[]>(
    (diffs, [prop, value]) => {
      const agentValue = agent[prop as keyof ApiRplAgent]

      // exclude falsy values from diff, like: undefined, null, ''
      if (value && agentValue && value !== agentValue) {
        const actions: Record<string, () => void> = {
          phone: () => {
            // add phone to diff if the phone numbers are different
            if (!comparePhoneNumbers(value as string, `${agentValue}`)) {
              diffs.push({ prop, from: agentValue, to: value })
            }
          },
          email: () => {
            if (!compareEmails(value as string, `${agentValue}`)) {
              diffs.push({ prop, from: agentValue, to: value })
            }
          },
          default: () => {
            diffs.push({ prop, from: agentValue, to: value })
          }
        }
        const action = actions[prop] || actions.default

        action()
      }

      return diffs
    },
    []
  )
}

export default diffAgent
