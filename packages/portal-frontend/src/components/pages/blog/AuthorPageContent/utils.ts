import { type RawQuery } from 'services/API'

const agentIdPattern = /^[\w-]{1,100}$/

/**
 * OR-batches for an agent's sold listings: sell-side (ListAgent*) OR buy-side
 * (BuyerAgent*). Branches MUST use raw MLS field names — the virtual `agentId`
 * filter is not recognized inside a `queries` object and would match every
 * listing (collapsing the OR into the whole MLS).
 *
 * Each side is matched on BOTH the `*Key` and `*MlsId` raw fields because
 * `author.agentId` (WordPress meta) may hold either identifier — verified that
 * this agent's id is the MlsId, while the top-level `agentId` filter resolves
 * both. A field that does not match the value's format simply contributes no
 * rows, so OR-ing all four is exact (no false positives) and robust to either
 * id format.
 *
 * Returns undefined for a missing/malformed id so the caller can fall back to
 * the plain sell-side filter.
 */
export const buildAgentSoldQueries = (
  agentId: string | number | undefined
): RawQuery[] | undefined => {
  if (agentId == null) return undefined

  const id = String(agentId)
  if (!agentIdPattern.test(id)) return undefined

  return [
    { 'raw.ListAgentMlsId': id },
    { 'raw.BuyerAgentMlsId': id },
    { 'raw.ListAgentKey': id },
    { 'raw.BuyerAgentKey': id }
  ]
}
