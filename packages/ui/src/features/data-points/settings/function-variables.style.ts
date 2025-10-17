import { colors } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(theme => ({
  contentContainer: {
    display: 'flex',
  },
  newVariableContainer: {
    backgroundColor: colors.grey[300],
    padding: theme.spacing(1),
    borderRadius: '4px',
    width: 180,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}))

export default useStyles
