import { makeStyles } from 'tss-react/mui'
import { colors } from '@mui/material'

export const useStyles = makeStyles()(() => ({
  container: {
    background: colors.grey[200],
    paddingTop: 16,
    paddingLeft: 16,
    paddingRight: 16,
  },
  noResults: {
    padding: 16,
  },
  selectionHeader: {
    paddingBottom: 12,
  },
  selectionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  paretoContainer: {
    overflowX: 'auto',
  },
}))

export default useStyles
