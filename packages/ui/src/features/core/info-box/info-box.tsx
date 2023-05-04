import { Box } from '@mui/material'
import { ReactNode } from 'react'
import { Error, Warning, Info } from '@mui/icons-material'
import useStyles from './info-box.style'

type InfoType = 'info' | 'warning' | 'error' | 'custom'

type InfoBoxProps = {
  text: string
  type: InfoType
  customBox?: ReactNode
}

export const InfoBox = ({ text, type, customBox }: InfoBoxProps) => {
  const { classes } = useStyles()

  const getStyling = (type: InfoType) => {
    switch (type) {
      case 'info':
        return classes.info
      case 'warning':
        return classes.warning
      case 'error':
        return classes.error
      case 'custom':
        return ''
    }
  }

  const getIcon = (type: InfoType) => {
    switch (type) {
      case 'info':
        return <Info fontSize="small" />
      case 'warning':
        return <Warning fontSize="small" />
      case 'error':
        return <Error fontSize="small" />
      case 'custom':
        return <></>
    }
  }
  return (
    <>
      {type === 'custom' && customBox !== undefined ? (
        customBox
      ) : (
        <Box
          p={1}
          m={1}
          className={[classes.infoBox, getStyling(type)].join(' ')}
        >
          {getIcon(type)}
          <Box pl={1}>{text}</Box>
        </Box>
      )}
    </>
  )
}
