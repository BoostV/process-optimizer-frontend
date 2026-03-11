import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  tableContainer: {
    overflowX: 'auto',
  },
  cell: {
    minWidth: 48,
    paddingRight: '16px',
  },
  title: {
    fontWeight: 'bold',
  },
}))

export default useStyles
