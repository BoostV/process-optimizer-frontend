import produce, { enableMapSet } from 'immer'
import { ReactNode, createContext, useContext, useMemo, useState } from 'react'

/**
 * To use messages, wrap the UI components in a MessageProvider. UI components (e.g. DataPoints and InputModel) can
 * be given an id, and messages can be shown in these components by using the given ids with the useMessageController
 * hook.
 *
 * Example - setting an error message on InputModel:
 *
 * <InputModel id='input-model'>...
 *
 * const { setMessage } = useMessageController()
 * setMessage('input-model', {
 *    text: 'Input model cannot have duplicate ids.',
 *    type: 'error
 * })
 */

export type Message = {
  type: 'info' | 'warning' | 'error' | 'custom'
  text: string
  disabled?: boolean
  customComponent?: ReactNode
}

const MessageContext = createContext<
  | {
      messages: Map<string, Message[]>
      setMessage: (id: string, message: Message) => void
      setMessages: (messages: Map<string, Message[]>) => void
      clearMessages: () => void
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
    setMessages: context.setMessages,
    clearMessages: context.clearMessages,
  }
}

type MessageProviderProps = {
  children?: React.ReactNode
}

export const MessageProvider = ({ children }: MessageProviderProps) => {
  enableMapSet()
  const [messages, setMessages] = useState<Map<string, Message[]>>(new Map())

  const setMessage = (id: string, message: Message) => {
    setMessages(
      produce(draft => {
        const messagesWithId = draft.get(id)
        if (messagesWithId !== undefined) {
          messagesWithId.push(message)
          draft.set(id, messagesWithId)
        } else {
          draft.set(id, [message])
        }
      })
    )
  }

  const value = useMemo(
    () => ({
      messages,
      setMessage,
      setMessages,
      clearMessages: () => setMessages(new Map()),
    }),
    [messages]
  )

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  )
}
