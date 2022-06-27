import { makeStyles } from '@mui/material'
import { colors, tableBorder } from '../../theme/theme'

export const useStyles = makeStyles(theme => ({
  buttonContainer: {
    whiteSpace: 'nowrap',
    float: 'right',
  },
  cell: {
    color: colors.silver,
    paddingRight: '8px',
    border: 'none',
    borderTop: tableBorder,
  },
  editCell: {
    paddingRight: '0px',
    border: 'none',
    borderTop: tableBorder,
  },
  row: {
    '&:hover': {
      background: '#fdfdfd',
    },
    '&:hover td': {
      background: '#f4f4f4',
    },
    '&:hover td:first-of-type': {
      background: 'white',
    },
    '&:hover td:last-of-type': {
      background: 'white',
    },
  },
  newRow: {
    paddingRight: 0,
    border: 'none',
    borderTop: tableBorder,
  },
  emptyCell: {
    border: 'none',
    width: 16,
    padding: 0,
  },
}))

export default useStyles
