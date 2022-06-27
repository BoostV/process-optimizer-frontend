import { makeStyles } from '@mui/styles'
import { tableBorder } from '../../theme/theme'

export const useStyles = makeStyles(theme => ({
  editCell: {
    minWidth: 48,
  },
  cell: {
    border: 'none',
    borderTop: tableBorder,
  },
}))

export default useStyles
