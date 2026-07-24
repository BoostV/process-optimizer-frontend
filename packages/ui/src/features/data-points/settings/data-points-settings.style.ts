import { makeStyles } from 'tss-react/mui'
import { colors } from '@mui/material'

export const useStyles = makeStyles()(theme => ({
  main: {
    backgroundColor: colors.grey[200],
    borderRadius: '4px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
  },
  tabContainer: {
    padding: theme.spacing(1),
  },
  tabContainers: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: theme.spacing(4),
  },
  functionContainer: {
    paddingRight: theme.spacing(2),
    minWidth: '24rem',
  },
  playgroundContainer: {
    borderLeft: `1px solid ${theme.palette.divider}`,
    paddingLeft: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
  function: {
    display: 'flex',
    alignItems: 'center',
  },
  settingsControls: {
    display: 'flex',
    gap: theme.spacing(1),
  },
}))

export default useStyles
