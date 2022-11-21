import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  tableContainer: {
    overflowX: 'auto',
  },
  titleButton: {
    float: 'right',
  },
  titleIcon: {
    color: 'white',
  },
}))

export default useStyles
