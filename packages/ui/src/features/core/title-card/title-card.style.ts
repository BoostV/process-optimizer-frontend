import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(theme => ({
  title: {
    background: theme.palette.primary.main,
    color: 'white',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    fontSize: theme.typography.pxToRem(18),
  },
  content: {
    padding: 0,
    '&:last-child': {
      paddingBottom: 0,
    },
  },
  infoBox: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 14,
    borderRadius: '4px',
  },
  info: {
    backgroundColor: theme.palette.info.main,
  },
  warning: {
    backgroundColor: theme.palette.warning.main,
  },
  error: {
    backgroundColor: theme.palette.error.main,
  },
}))

export default useStyles
