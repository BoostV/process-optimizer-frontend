import { describe, expect, it } from 'vitest'
import { FC, useEffect } from 'react'
import {
  MessageProvider,
  useMessageController,
  useMessages,
} from './experiment'
import { render, screen } from '@testing-library/react'

describe('MessageProvider', () => {
  const Tester: FC = () => {
    const { messages } = useMessages('test')
    const { setMessages } = useMessageController()
    useEffect(() => {
      setMessages(
        new Map([
          [
            'test',
            [
              {
                type: 'error',
                text: 'hello',
              },
              {
                type: 'error',
                text: 'hello',
              },
              {
                type: 'error',
                text: 'hello',
              },
            ],
          ],
        ])
      )
    }, [setMessages])
    return <>{messages?.map((m, i) => <span key={i}>{m?.text}</span>)}</>
  }
  it('sets and shows messages', async () => {
    render(
      <MessageProvider>
        <Tester />
      </MessageProvider>
    )
    const messages = await screen.findAllByText(/hello/)
    expect(messages).toHaveLength(3)
  })
})
