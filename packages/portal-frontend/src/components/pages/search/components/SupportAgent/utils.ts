// Utility function to validate message origin
export const validOrigin = (
  origin: string,
  allowedOrigins: string[]
): boolean => {
  return allowedOrigins.some((allowed) => origin.includes(allowed))
}

// Generate session ID
export const generateSessionId = (): string =>
  `agent-session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
