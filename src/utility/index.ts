export const errorMessage = (e: unknown) => {
  if (typeof e === 'string') {
    return e
  } else if (e instanceof Error) {
    return e.message
  } else {
    return `Unknown error: ${JSON.stringify(e)}`
  }
}
export function assertUnreachable(_x: never): never {
  throw new Error("Didn't expect to get here")
}
