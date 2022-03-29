import { makeStyles } from '@material-ui/core'

export const useStyles = makeStyles(theme => ({
  mainContainer: {
    maxWidth: 500,
    background: theme.palette.custom.background.main,
    color: theme.palette.custom.textInsideBox.main,
  },
  mainContent: {
    padding: 0,
  },
  box: {
    backgroundColor: theme.palette.custom.transparentBox.main,
  },
  uploadBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 180,
    borderRadius: 4,
    padding: theme.spacing(4),
  },
  uploadBoxInner: {
    marginTop: 108,
    color: theme.palette.custom.textInsideBox.main,
  },
  uploadIcon: {
    position: 'absolute',
    fontSize: '13rem !important',
    opacity: 0.35,
  },
}))

export default useStyles
