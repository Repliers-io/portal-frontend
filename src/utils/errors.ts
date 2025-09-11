import type { ApiError, ApiRplError, AppError } from '../services/API'

export const rplError = (error: unknown): error is ApiRplError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'userMessage' in error &&
    'info' in error &&
    Array.isArray((error as ApiRplError).info)
  )
}

export const apiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'userMessage' in error
  )
}

export const appError = (error: unknown): error is AppError => {
  return apiError(error) || rplError(error)
}

export const extractAppError = (error: unknown): AppError | null => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'data' in error &&
    'status' in error
  ) {
    const { data } = error as { status: number; data: ApiError | ApiRplError }
    return data
  }
  return null
}

export const parseErrorMessage = (error: unknown) => {
  if (rplError(error)) {
    const { info, userMessage } = error
    return `${userMessage}: ${info[0].param} - ${info[0].msg}`
  }
  if (apiError(error)) {
    const { userMessage } = error
    return `${userMessage}`
  }

  return 'An unknown error occurred.'
}

export const extractErrorMessage = (e: unknown) => {
  const error = extractAppError(e)
  const definedError = error && appError(error)

  return definedError ? parseErrorMessage(error) : 'Something went wrong'
}
