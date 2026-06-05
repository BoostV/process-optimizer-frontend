import { makeStyles } from 'tss-react/mui'
import { colors } from './styles'

export const useStyles = makeStyles()(() => ({
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
    color: colors.silver,
  },
  // The field table can be wider than the dialog when an experiment has many
  // variables. Let it scroll horizontally instead of being clipped. min-width:0
  // lets this flex child shrink below its content width so overflow-x engages;
  // the row number and the Save/Cancel buttons stay put outside this box.
  fields: {
    minWidth: 0,
    overflowX: 'auto',
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
