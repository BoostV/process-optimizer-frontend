import { makeStyles } from '@material-ui/core'
import { tableBorder } from '../../theme/theme'

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
    fontWeight: 500,
    fontSize: '1rem',
  },
  rowHeaderCell: {
    fontSize: 12,
    fontWeight: 600,
    border: 'none',
    paddingRight: 16,
  },
  rowMetaHeaderCell: {
    fontSize: 12,
    fontWeight: 400,
    border: 'none',
    paddingRight: 16,
  },
}))

export default useStyles
