const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export function buildBackendUrl(path: string): string {
  const base = API_URL.replace(/\/+$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const baseHasApiSuffix = /\/api$/i.test(base)
  const pathHasApiPrefix = normalizedPath.startsWith('/api/')

  if (baseHasApiSuffix && pathHasApiPrefix) {
    return `${base}${normalizedPath.slice(4)}`
  }

  if (!baseHasApiSuffix && pathHasApiPrefix) {
    return `${base}${normalizedPath}`
  }

  return `${base}${normalizedPath}`
}
