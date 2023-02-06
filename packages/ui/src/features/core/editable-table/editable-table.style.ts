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
}))

export default useStyles
