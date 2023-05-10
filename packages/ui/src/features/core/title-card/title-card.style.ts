import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(theme => ({
  titleContainer: {
    display: 'flex',
    background: theme.palette.primary.main,
    color: 'white',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    fontSize: theme.typography.pxToRem(18),
    position: 'relative',
    alignItems: 'center',
  },
  title: {
    flex: 1,
  },
  loading: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
  },
  content: {
    padding: 0,
    '&:last-child': {
      paddingBottom: 0,
    },
  },
}))

export default useStyles
