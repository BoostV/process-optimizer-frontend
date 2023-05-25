import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(theme => ({
  infoBox: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 14,
    borderRadius: '4px',
    color: 'black',
  },
  info: {
    backgroundColor: theme.palette.info.main,
  },
  warning: {
    backgroundColor: theme.palette.warning.main,
  },
  error: {
    backgroundColor: theme.palette.error.light,
  },
}))

export default useStyles
