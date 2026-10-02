export type RouteParams<T extends Record<string, unknown>> = Promise<T>

export type RouteSearchParams<T extends Record<string, unknown>> = Promise<T>

export type RouteParamsProps<T extends Record<string, unknown>> = {
  params: RouteParams<T>
}

export type RouteSearchParamsProps<T extends Record<string, unknown>> = {
  searchParams: RouteSearchParams<T>
}

export type RouteProps<
  TParams extends Record<string, unknown>,
  TSearchParams extends Record<string, unknown>
> = RouteParamsProps<TParams> & RouteSearchParamsProps<TSearchParams>
