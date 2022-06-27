import { makeStyles } from '@mui/material'

export const useStyles = makeStyles(theme => ({
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
