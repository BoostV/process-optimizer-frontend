import { makeStyles } from '@mui/material'

export const useStyles = makeStyles(theme => ({
  customTab: {
    minWidth: 'auto',
    fontSize: theme.typography.pxToRem(12),
  },
}))

export default useStyles
