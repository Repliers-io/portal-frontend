// ── Auth ───────────────────────────────────────────────────────────

export type AuthRequest = {
  username: string
  password: string
  grant_type: 'password'
}

export type AuthResponse = {
  access_token: string
}

// ── Plans ──────────────────────────────────────────────────────────

export type Plan = {
  obj_id: number
  source_id?: number
  /** CSV of source PKs — use first value for directbuy URL when `directbuy` is absent */
  source_pk: string
  /** Plan type label, e.g. "SRPR", "Topographic" */
  type: string
  year: string
  owning_company_id?: number
  owning_company_name: string
  price: number
  /** Direct purchase URL (may be absent until vendor bug is fixed) */
  directbuy?: string
  /** Preview image URL (coming soon — vendor is fixing domain bug) */
  previewImageUrl?: string
}

export type PlansResponse = {
  Plans: Plan[]
  /** Parcel-level data — `Parcel[0].geo_id` links to the "view all" Property Page */
  Parcel?: Parcel[]
}

// ── Parcel ─────────────────────────────────────────────────────────

/** Vendor parcel record — one per plot of land */
export type Parcel = {
  /** Unique parcel id; builds the PYB Property Page URL: /geoid/{geo_id} */
  geo_id: string
}

// ── Normalized result ──────────────────────────────────────────────

/** Plans & Surveys for a coordinate: per-plan list + parcel-level Property Page id */
export type PlansAndSurveys = {
  plans: Plan[]
  /** Parcel id for the PYB "view all" Property Page; null when the vendor omits it */
  geoId: string | null
}
