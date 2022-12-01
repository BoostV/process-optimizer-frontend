import { makeStyles } from 'tss-react/mui'
import { tableBorder } from './styles'

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
