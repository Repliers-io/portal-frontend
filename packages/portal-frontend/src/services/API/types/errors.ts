export type ApiHttpError = {
  status: number
  data: {
    userMessage?: string
    [key: string]: any
  }
}

export type ApiRplError = {
  message: string
  userMessage: string
  info: { param: string; msg: string }[]
}

export type ApiErrorData = {
  message: string
  userMessage: string
}

export type AppError = ApiErrorData | ApiRplError

export interface RepliersError {
  info: {
    msg: string
    param?: string
  }[]
  message?: string
}

export interface ErrorCause {
  cause: RepliersError
}
