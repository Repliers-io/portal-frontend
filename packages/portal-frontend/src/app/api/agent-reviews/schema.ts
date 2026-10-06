import Joi from 'joi'

import {
  type AgentReviewCreateRequest,
  type AgentReviewsQuery,
  boughtSoldValues
} from 'services/MoveSmartly'

// POST body validation.
//
// Three categories:
// 1. Identity (memberRepliersId) — our responsibility, required.
// 2. Business rules — validated before forwarding to upstream:
//    - agentId / rating required (UI form gates on them; missing = bug)
//    - rating range 1-5 (matches UI star input)
//    - boughtSold enum (only API-supported values)
// 3. Resource controls (max length) — defend against oversized payloads.
//
// stripUnknown drops fields we did not declare so unknown garbage does not
// reach upstream.
export const createReviewBodySchema = Joi.object<AgentReviewCreateRequest>({
  memberRepliersId: Joi.string().min(1).required(),

  agentId: Joi.number().integer().positive().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  boughtSold: Joi.string()
    .valid(...boughtSoldValues)
    .optional(),

  comments: Joi.string().max(5000).optional(),
  memberDisplayName: Joi.string().max(100).optional(),
  neighbourhood: Joi.string().max(200).optional(),
  address: Joi.string().max(500).allow(null).optional()
}).options({ stripUnknown: true })

// GET query — Joi auto-coerces "3" → 3 from URL params.
// take is capped at 100 to prevent unbounded upstream responses.
export const reviewsQuerySchema = Joi.object<AgentReviewsQuery>({
  agentId: Joi.number().integer().positive().optional(),
  take: Joi.number().integer().min(1).max(100).optional(),
  skip: Joi.number().integer().min(0).optional()
})

// GET query for the rating summary — only an optional agent filter.
export const summaryQuerySchema = Joi.object<{ agentId?: number }>({
  agentId: Joi.number().integer().positive().optional()
})
