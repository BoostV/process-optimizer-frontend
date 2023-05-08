import { FC, useEffect } from 'react'
import {
  MessageProvider,
  useMessageController,
  useMessages,
} from './experiment'
import { render, screen } from '@testing-library/react'

describe('MessageProvider', () => {
  const Tester: FC<{ num: number }> = ({ num }) => {
    const { messages } = useMessages('test')
    const { setMessage } = useMessageController()
    useEffect(() => {
      const arrayOfLength = [...Array(num)]
      arrayOfLength.forEach((_, i) =>
        setMessage('test', {
          id: 'msg' + i,
          text: 'hello' + i,
          type: 'error',
        })
      )
    }, [num, setMessage])
    return (
      <>
        {messages?.map((m, i) => (
          <div key={i}>{m?.text}</div>
        ))}
      </>
    )
  }

  it('sets and shows multiple messages with same id', async () => {
    render(
      <MessageProvider>
        <Tester num={3} />
      </MessageProvider>
    )
    const messages = await screen.findAllByText(/hello/, { exact: false })
    const message1 = await screen.findAllByText(/hello0/)
    const message2 = await screen.findAllByText(/hello1/)
    const message3 = await screen.findAllByText(/hello2/)
    expect(messages).toHaveLength(3)
    expect(message1).not.toBeNull()
    expect(message2).not.toBeNull()
    expect(message3).not.toBeNull()
  })
})
