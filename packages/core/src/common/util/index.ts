export * from './migration'
export * from './converters'
export * from './save-to-local-file'
export * from './data-type-detectors'

export const errorMessage = (e: unknown) => {
  if (typeof e === 'string') {
    return e
  } else if (e instanceof Error) {
    return e.message
  } else {
    return `Unknown error: ${JSON.stringify(e)}`
  }
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function assertUnreachable(_x: never): never {
  throw new Error("Didn't expect to get here")
}

export function isNumber(data: unknown | number): data is number {
  return (
    (typeof data === 'number' && !isNaN(data)) ||
    (typeof data === 'string' && !isNaN(+data))
  )
}
