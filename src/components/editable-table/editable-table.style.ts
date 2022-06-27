import { makeStyles } from '@mui/styles'
import { tableBorder } from '../../theme/theme'

export const useStyles = makeStyles(() => ({
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
