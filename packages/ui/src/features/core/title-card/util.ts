import { Message } from '@boostv/process-optimizer-frontend-core'

export const sortMessages = (a: Message, b: Message) => {
  const order = (m: Message) =>
    m.type === 'info'
      ? 1
      : m.type === 'error'
      ? 2
      : m.type === 'warning'
      ? 3
      : 4
  const x = order(a)
  const y = order(b)
  return x < y ? -1 : x > y ? 1 : 0
}
