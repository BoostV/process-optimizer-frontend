import { makeStyles } from 'tss-react/mui'
import { colors, tableBorder } from './styles'

export const useStyles = makeStyles()(() => ({
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
  rowDisabled: {
    opacity: 0.25,
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
