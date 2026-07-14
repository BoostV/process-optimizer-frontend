import { makeStyles } from 'tss-react/mui'
import { tableBorder } from './styles'

export const useStyles = makeStyles()(() => ({
  // Fixed layout so the data columns share the width evenly, instead of the
  // browser dumping the table's surplus width into the wider (score) columns —
  // which made the factor columns look cramped next to Quality/Cost.
  table: {
    width: '100%',
    tableLayout: 'fixed',
    userSelect: 'auto',
  },
  tableIsSelecting: {
    width: '100%',
    tableLayout: 'fixed',
    userSelect: 'none',
  },
  // Narrow utility columns; the remaining width is split evenly across the data
  // columns under the fixed layout.
  indexHeaderCell: {
    width: 48,
  },
  editHeaderCell: {
    width: 96,
  },
  emptyCell: {
    border: 'none',
    width: 16,
    padding: 0,
  },
  emptyFooterCell: {
    borderTop: tableBorder,
    borderBottom: tableBorder,
  },
  footerCell: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: '1.5rem',
    color: 'black',
    borderTop: tableBorder,
    borderBottom: tableBorder,
  },
  selectionControls: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginRight: '24px',
    marginTop: '8px',
  },
}))

export default useStyles
