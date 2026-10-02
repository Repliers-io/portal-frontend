import { register } from 'node:module'

register(
  new URL('./asset-stub-loader.js', import.meta.url).href,
  import.meta.url
)
