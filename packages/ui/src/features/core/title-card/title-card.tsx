import { Box, Card, CardContent, LinearProgress } from '@mui/material'
import { Error, Warning, Info } from '@mui/icons-material'
import { ReactNode } from 'react'
import useStyles from './title-card.style'
import {
  useMessages,
  MessageType,
} from '@boostv/process-optimizer-frontend-core'

type InfoType = 'info' | 'warning' | 'error'

export type InfoBox = {
  text: string
  type: InfoType
}

type TitleCardProps = {
  id?: string
  title: ReactNode
  padding?: number
  infoBoxes?: InfoBox[]
  loading?: boolean
  children: ReactNode
}

export const TitleCard = (props: TitleCardProps) => {
  const { id, title, padding, infoBoxes, loading = false, children } = props
  const { classes } = useStyles()
  const { messages } = useMessages(id)

  const getMessageStyling = (type: MessageType) => {
    switch (type) {
      case 'info':
        return classes.info
      case 'warning':
        return classes.warning
      case 'error':
        return classes.error
      case 'custom':
        return classes.info // TODO: Custom component
    }
  }

  const getMessageIcon = (type: MessageType) => {
    switch (type) {
      case 'info':
        return <Info fontSize="small" />
      case 'warning':
        return <Warning fontSize="small" />
      case 'error':
        return <Error fontSize="small" />
      case 'custom':
        return <Info fontSize="small" /> // TODO: Custom component
    }
  }

  return (
    <Card>
      <CardContent className={classes.content}>
        <Box className={classes.title}>
          {title}
          {loading && <LinearProgress className={classes.loading} />}
        </Box>
        {/* TODO: Delete infoboxes and use messages for all info */}
        {messages?.map((m, i) => (
          <Box
            key={i}
            p={1}
            m={1}
            className={[classes.infoBox, getMessageStyling(m.type)].join(' ')}
          >
            {getMessageIcon(m.type)}
            <Box pl={1}>{m.text}</Box>
          </Box>
        ))}
        {infoBoxes !== undefined &&
          infoBoxes.map((b, i) => (
            <Box
              key={i}
              p={1}
              m={1}
              className={[classes.infoBox, getMessageStyling(b.type)].join(' ')}
            >
              {getMessageIcon(b.type)}
              <Box pl={1}>{b.text}</Box>
            </Box>
          ))}
        <Box p={padding !== undefined ? padding : 2}>{children}</Box>
      </CardContent>
    </Card>
  )
}
