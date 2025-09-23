import { makeStyles } from 'tss-react/mui'
import { colors, tableBorder } from './styles'
import { lighten } from '@mui/material'

export const useStyles = makeStyles()(theme => ({
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
  rowNew: {
    '&:hover': {
      background: 'white',
    },
  },
  rowSelected: {
    cursor: 'pointer',
    td: {
      backgroundColor: lighten(theme.palette.primary.main, 0.8),
    },
    'td:first-of-type': {
      background: 'white',
    },
    'td:last-of-type': {
      background: 'white',
    },
  },
  row: {
    cursor: 'pointer',
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
  newRowCell: {
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

export const disabledCell = {
  color: 'rgba(0,0,0,0.2)',
}

export default useStyles
