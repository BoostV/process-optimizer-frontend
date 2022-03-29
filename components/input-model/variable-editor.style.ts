import { makeStyles } from '@material-ui/core'

export const useStyles = makeStyles(theme => ({
  customTab: {
    minWidth: 'auto',
    fontSize: theme.typography.pxToRem(12),
  },
}))

export default useStyles
