import { makeStyles } from '@mui/styles'

export const useStyles = makeStyles(() => ({
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
