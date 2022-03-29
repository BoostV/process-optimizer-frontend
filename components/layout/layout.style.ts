import { makeStyles } from '@material-ui/core'

export const useStyles = makeStyles(theme => ({
  links: {
    marginLeft: theme.spacing(5),
    flexGrow: 1,
  },
  title: {
    color: 'white',
  },
  link: {
    color: 'white',
  },
  logo: {
    marginRight: theme.spacing(1),
    height: 32,
  },
}))

export default useStyles
