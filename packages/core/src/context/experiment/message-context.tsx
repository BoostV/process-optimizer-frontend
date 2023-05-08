import produce, { enableMapSet } from 'immer'
import { ReactNode, createContext, useContext, useMemo, useState } from 'react'

/**
 * To use messages, wrap the UI components in a MessageProvider. UI components (e.g. DataPoints and InputModel)
 * can be given an id, and messages can be shown in these components by using these ids with the useMessageController
 * hook. Messages are given ids to facilitate mapping multiple messages to the same id (e.g. for errors of
 * the same type).
 *
 * Example - setting an error message on InputModel:
 *
 * <InputModel id='input-model'>...
 *
 * const { setMessage } = useMessageController()
 * setMessage('input-model', {
 *    id: 'input-model-duplicate-ids',
 *    text: 'Input model cannot have duplicate ids.',
 *    type: 'error
 * })
 */

type Message = {
  id: string
  type: 'info' | 'warning' | 'error' | 'custom'
  text: string
  disabled?: boolean
  customComponent?: ReactNode
}

const MessageContext = createContext<
  | {
      messages: Map<string, Message[]>
      setMessage: (id: string, message: Message) => void
    }
  | undefined
>(undefined)

export const useMessages = (id: string | undefined) => {
  const context = useContext(MessageContext)
  if (context === undefined || id === undefined) {
    return {
      messages: undefined,
    }
  }
  return {
    messages: context.messages.get(id) ?? [],
  }
}

export const useMessageController = () => {
  const context = useContext(MessageContext)
  if (context === undefined) {
    throw new Error('useMessageController must be used within MessageProvider')
  }
  return {
    setMessage: context.setMessage,
  }
}

type MessageProviderProps = {
  children?: React.ReactNode
}

export const MessageProvider = ({ children }: MessageProviderProps) => {
  enableMapSet()
  const [messages, setMessages] = useState<Map<string, Message[]>>(new Map())

  const value = useMemo(
    () => ({
      messages,
      setMessage: (id: string, message: Message) => {
        setMessages(
          produce(draft => {
            const messagesWithId = draft.get(id)
            if (messagesWithId !== undefined) {
              if (!messagesWithId.map(m => m.id).includes(message.id)) {
                messagesWithId.push(message)
                draft.set(id, messagesWithId)
              }
            } else {
              draft.set(id, [message])
            }
          })
        )
      },
    }),
    [messages]
  )

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  )
}
