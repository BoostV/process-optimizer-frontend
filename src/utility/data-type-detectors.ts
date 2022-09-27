const signatures = {
  'image/png': 'iVBORw0KGgo',
} as const

export const isPNG = (input: string) =>
  typeof input === 'string' && input.startsWith(signatures['image/png'])

export const isJSON = (input: string) => {
  try {
    JSON.parse(input)
    return true
  } catch {
    return false
  }
}
