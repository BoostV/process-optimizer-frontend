import { makeStyles } from '@mui/styles'

export const useStyles = makeStyles(theme => ({
  loadingContainer: {
    marginTop: theme.spacing(4),
    minWidth: theme.sizes.mainWidthMin,
    maxWidth: theme.sizes.mainWidthMax,
    background: theme.palette.custom.background.main,
    color: theme.palette.custom.textInsideBox.main,
    textAlign: 'center',
    height: '50vh',
  },
  progress: {
    color: theme.palette.custom.textInsideBox.main,
  },
}))

export default useStyles
