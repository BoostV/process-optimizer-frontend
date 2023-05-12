import { produce, enableMapSet } from 'immer'
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
  id?: string
  type: 'info' | 'warning' | 'error' | 'custom'
  text: string
  disabled?: boolean
  customComponent?: ReactNode
}

const MessageContext = createContext<
  | {
      messages: Map<string, Message[]>
      setMessage: (key: string, message: Message) => void
      setMessages: (messages: Map<string, Message[]>) => void
      clearAllMessages: () => void
      clearMessagesWithId: (messageId: string) => void
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
    clearAllMessages: context.clearAllMessages,
    clearMessagesWithId: context.clearMessagesWithId,
  }
}

type MessageProviderProps = {
  messages?: Map<string, Message[]>
  children?: React.ReactNode
}

export const MessageProvider = ({
  children,
  messages: externalMessages,
}: MessageProviderProps) => {
  enableMapSet()
  const [messages, setMessages] = useState<Map<string, Message[]>>(new Map())

  const setMessage = (key: string, message: Message) => {
    setMessages(
      produce(draft => {
        const messagesWithKey = draft.get(key)
        if (messagesWithKey !== undefined) {
          messagesWithKey.push(message)
          draft.set(key, messagesWithKey)
        } else {
          draft.set(key, [message])
        }
      })
    )
  }

  const clearMessagesWithId = (messageId: string) => {
    setMessages(
      produce(draft => {
        draft.forEach((v, k) =>
          draft.set(
            k,
            v.filter(m => m.id !== messageId)
          )
        )
      })
    )
  }

  const value = useMemo(
    () => ({
      messages: externalMessages ?? messages,
      setMessage,
      setMessages,
      clearAllMessages: () => setMessages(new Map()),
      clearMessagesWithId,
    }),
    [externalMessages, messages]
  )

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  )
}
