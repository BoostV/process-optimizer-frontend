import { Box, Card, CardContent, LinearProgress } from '@mui/material'
import { ReactNode } from 'react'
import useStyles from './title-card.style'
import { useMessages } from '@boostv/process-optimizer-frontend-core'
import { InfoBox } from '../info-box/info-box'
import { sortMessages } from './util'

type TitleCardProps = {
  id?: string
  title: ReactNode
  padding?: number
  loading?: boolean
  children: ReactNode
}

export const TitleCard = (props: TitleCardProps) => {
  const { id, title, padding, loading = false, children } = props
  const { classes } = useStyles()
  const { messages } = useMessages(id)

  return (
    <Card>
      <CardContent className={classes.content}>
        <Box className={classes.title}>
          {title}
          {loading && <LinearProgress className={classes.loading} />}
        </Box>
        {messages
          ?.filter(f => !f.disabled)
          .sort(sortMessages)
          .map((m, i) => (
            <InfoBox
              key={i}
              text={m.text}
              type={m.type}
              customBox={m?.customComponent}
            />
          ))}
        <Box p={padding !== undefined ? padding : 2}>{children}</Box>
      </CardContent>
    </Card>
  )
}
