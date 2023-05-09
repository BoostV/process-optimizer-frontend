import { Message } from '@boostv/process-optimizer-frontend-core'
import { sortMessages } from './util'

describe('title-card util', () => {
  it('should sort messages', () => {
    const m: Message[] = [
      {
        text: 'error',
        type: 'error',
      },
      {
        text: 'warning',
        type: 'warning',
      },
      {
        text: 'info',
        type: 'info',
      },
      {
        text: 'custom',
        type: 'custom',
      },
      {
        text: 'info',
        type: 'info',
      },
      {
        text: 'warning',
        type: 'warning',
      },
      {
        text: 'info',
        type: 'info',
      },
    ]
    expect(m.sort((a, b) => sortMessages(a, b)).map(m => m.type)).toEqual([
      'info',
      'info',
      'info',
      'error',
      'warning',
      'warning',
      'custom',
    ])
  })
})
