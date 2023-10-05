import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  tableContainer: {
    overflowX: 'auto',
  },
  cell: {
    minWidth: 48,
    height: 32,
  },
}))

export default useStyles
