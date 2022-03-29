import { makeStyles } from '@material-ui/core'

export const useStyles = makeStyles(theme => ({
  themeContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    position: 'fixed',
    bottom: 0,
    right: 0,
    background: 'white',
    opacity: 0.7,
    padding: 8,
  },
}))

export default useStyles
