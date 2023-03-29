import { Box, Card, CardContent } from '@mui/material'
import { Error, Warning, Info } from '@mui/icons-material'
import { ReactNode } from 'react'
import useStyles from './title-card.style'

type InfoType = 'info' | 'warning' | 'error'

export type InfoBox = {
  text: string
  type: InfoType
}

type TitleCardProps = {
  title: ReactNode
  padding?: number
  infoBoxes?: InfoBox[]
  children: any
}

export const TitleCard = (props: TitleCardProps) => {
  const { title, padding, infoBoxes, children } = props
  const { classes } = useStyles()

  const getInfoStyling = (info: InfoType) => {
    switch (info) {
      case 'info':
        return classes.info
      case 'warning':
        return classes.warning
      case 'error':
        return classes.error
    }
  }

  const getInfoIcon = (info: InfoType) => {
    switch (info) {
      case 'info':
        return <Info fontSize="small" />
      case 'warning':
        return <Warning fontSize="small" />
      case 'error':
        return <Error fontSize="small" />
    }
  }

  return (
    <Card>
      <CardContent className={classes.content}>
        <Box className={classes.title}>{title}</Box>
        {infoBoxes !== undefined &&
          infoBoxes.map((b, i) => (
            <Box
              key={i}
              p={1}
              m={1}
              className={[classes.infoBox, getInfoStyling(b.type)].join(' ')}
            >
              {getInfoIcon(b.type)}
              <Box pl={1}>{b.text}</Box>
            </Box>
          ))}
        <Box p={padding !== undefined ? padding : 2}>{children}</Box>
      </CardContent>
    </Card>
  )
}
