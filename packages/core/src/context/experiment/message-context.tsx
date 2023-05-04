import produce from 'immer'
import { ReactNode, createContext, useContext, useState } from 'react'

type Message = {
  type: 'info' | 'warning' | 'error' | 'custom'
  text: string
  enabled?: boolean
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
    throw new Error('useSetMessage must be used within MessageProvider')
  }
  return {
    setMessage: context.setMessage,
  }
}

type MessageProviderProps = {
  children?: React.ReactNode
}

export const MessageProvider = ({ children }: MessageProviderProps) => {
  const [messages, setMessages] = useState<Map<string, Message[]>>(new Map())

  // TODO: wrap in useMemo?
  const value = {
    messages,
    setMessage: (id: string, message: Message) => {
      setMessages(
        produce(messages, draft => {
          const messagesWithId = draft.get(id)
          if (messagesWithId !== undefined) {
            if (!messagesWithId?.map(m => m.text).includes(message.text)) {
              messagesWithId.push(message)
              draft.set(id, messagesWithId)
            }
          } else {
            draft.set(id, [message])
          }
        })
      )
    },
  }

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  )
}
