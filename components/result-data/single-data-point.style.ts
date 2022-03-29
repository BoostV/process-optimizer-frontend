import { makeStyles } from '@material-ui/core'

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
