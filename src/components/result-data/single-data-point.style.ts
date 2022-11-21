import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  tableContainer: {
    overflowX: 'auto',
  },
  cell: {
    minWidth: 48,
  },
  title: {
    fontWeight: 'bold',
  },
}))

export default useStyles
