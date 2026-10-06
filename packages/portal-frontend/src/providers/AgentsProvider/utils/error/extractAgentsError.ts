import type { ApiRplAgent } from 'services/API'

// TODO: can we avoid this code ? It exists, because the API returns response with status 200, but with error and i need extract error message. It's look like not best practice. Need discuss with backend side
const extractAgentsError = (
  agents: ApiRplAgent[] | string[]
): string | null => {
  if (typeof agents[0] !== 'string') return null

  try {
    const parsedAgent = JSON.parse(agents[0])
    if (parsedAgent?.error) {
      return (
        (parsedAgent.info || [])
          .map((e: { param: string; msg: string }) => `${e.param}: ${e.msg}`)
          .join(', ') || 'Unknown error'
      )
    }
  } catch {
    return 'Invalid error response format'
  }

  return null
}

export default extractAgentsError
