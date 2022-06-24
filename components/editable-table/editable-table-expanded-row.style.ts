import { makeStyles } from '@material-ui/core'
import { colors } from '../../theme/theme'

export const useStyles = makeStyles(theme => ({
  row: {
    '& + tr': {
      '& td': {
        border: 'none',
        borderTop: 'none',
      },
    },
  },
  spanCell: {
    '&:last-child': {
      paddingRight: 0,
      border: 'none',
    },
  },
  paper: {
    padding: 16,
    margin: '2px 4px 2px 4px',
  },
  rowId: {
    display: 'flex',
    fontSize: 60,
    fontWeight: 500,
    paddingRight: 16,
    alignItems: 'center',
  },
  rowHeaderCell: {
    fontSize: 16,
    fontWeight: 600,
    border: 'none',
    paddingRight: 16,
  },
  rowMetaHeaderCell: {
    color: colors.silver,
    fontSize: 12,
    fontWeight: 400,
    border: 'none',
    paddingRight: 16,
  },
}))

export default useStyles
