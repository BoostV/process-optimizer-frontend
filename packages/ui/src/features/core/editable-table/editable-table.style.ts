import { makeStyles } from 'tss-react/mui'
import { tableBorder } from './styles'

export const useStyles = makeStyles()(() => ({
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
    marginRight: '16px',
    marginTop: '16px',
  },
}))

export default useStyles
