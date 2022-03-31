import { makeStyles } from '@material-ui/core'

export const useStyles = makeStyles(theme => ({
  highlight: {
    opacity: 0.75,
  },
  experimentContainer: {
    marginTop: theme.spacing(4),
    minWidth: theme.sizes.mainWidthMin,
    maxWidth: theme.sizes.mainWidthMax,
    background: theme.palette.custom.background.main,
    color: theme.palette.custom.textInsideBox.main,
  },
  actionButton: {
    marginLeft: theme.spacing(2),
    height: 42,
  },
  cardContentWrapper: {
    background: 'url(/logo_big.png)',
    backgroundRepeat: 'no-repeat',
  },
}))

export default useStyles
