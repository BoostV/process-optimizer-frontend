import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(theme => ({
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
}))

export default useStyles
