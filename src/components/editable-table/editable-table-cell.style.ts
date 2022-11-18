import { makeStyles } from 'tss-react/mui'
import { tableBorder } from '@/theme/theme'

export const useStyles = makeStyles()(() => ({
  editCell: {
    minWidth: 48,
  },
  cell: {
    border: 'none',
    borderTop: tableBorder,
  },
}))

export default useStyles
