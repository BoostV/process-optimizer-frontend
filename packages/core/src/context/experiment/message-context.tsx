import produce from 'immer'
import { ReactNode, createContext, useContext, useState } from 'react'

type Message = {
  type: 'info' | 'warning' | 'error' | 'custom'
  message: string
  enabled?: boolean
  component?: ReactNode
}

const MessageContext = createContext<
  | {
      messages: Map<string, Message[]>
      setMessage: (id: string, message: Message) => void
    }
  | undefined
>(undefined)

export const useMessages = (id: string) => {
  const context = useContext(MessageContext)
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider')
  }
  return {
    messages: context.messages.get(id) ?? [],
    setMessage: (message: Message) => context.setMessage(id, message),
  }
}

type MessageProviderProps = {
  children?: React.ReactNode
}

export const MessageProvider = ({ children }: MessageProviderProps) => {
  const [messages, setMessages] = useState<Map<string, Message[]>>(new Map())

  const value = {
    messages,
    setMessage: produce((id: string, message: Message) => {
      const messagesWithId = messages.get(id)
      if (messagesWithId !== undefined) {
        if (!messagesWithId?.map(m => m.message).includes(message.message)) {
          messagesWithId.push(message)
          setMessages(messages.set(id, messagesWithId))
        }
      } else {
        setMessages(messages.set(id, [message]))
      }
    }),
  }

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  )
}
