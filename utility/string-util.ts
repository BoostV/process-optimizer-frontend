export const isEmpty = (s: string) => {
  return !s.replace(/\s/g, '').length
}