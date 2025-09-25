import { makeStyles } from 'tss-react/mui'
import { colors } from '@mui/material'

export const useStyles = makeStyles()(theme => ({
  main: {
    backgroundColor: colors.grey[200],
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
    gap: theme.spacing(1),
    flexDirection: 'row',
  },
  functionContainer: {
    background: 'coral',
  },
  functionVariablesContainer: {
    background: 'dodgerblue',
  },
  playgroundContainer: {
    background: 'yellowgreen',
  },
  function: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  settingsControls: {
    display: 'flex',
    gap: theme.spacing(1),
  },
}))

export default useStyles
