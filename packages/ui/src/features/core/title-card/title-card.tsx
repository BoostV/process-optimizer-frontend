import { Box, Card, CardContent, Skeleton, Tooltip } from '@mui/material'
import { ReactNode } from 'react'
import useStyles from './title-card.style'
import { useMessages } from '@boostv/process-optimizer-frontend-core'
import { InfoBox } from '../info-box/info-box'
import { sortMessages } from './util'
import { WarningAmberOutlined } from '@mui/icons-material'

type TitleCardProps = {
  id?: string
  title: ReactNode
  padding?: number
  loading?: boolean
  loadingView?: ReactNode
  warning?: string
  children: ReactNode
}

export const TitleCard = (props: TitleCardProps) => {
  const { id, title, padding, loading, loadingView, warning, children } = props
  const { classes } = useStyles()
  const { messages } = useMessages(id)

  const defaultLoadingView = (
    <Skeleton
      animation="wave"
      variant="rectangular"
      width="100%"
      height={500}
    />
  )
  const cardView =
    loading && loadingView
      ? loadingView
      : loading
      ? defaultLoadingView
      : children

  return (
    <Card>
      <CardContent className={classes.content}>
        <Box className={classes.titleContainer}>
          {warning && (
            <Tooltip title={warning}>
              <Box mr={1} display="flex">
                <WarningAmberOutlined />
              </Box>
            </Tooltip>
          )}
          <Box className={classes.title}>{title}</Box>
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
        <Box p={padding !== undefined ? padding : 2}>{cardView}</Box>
      </CardContent>
    </Card>
  )
}
