import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  tableContainer: {
    overflowX: 'auto',
  },
  iconLight: {
    color: 'white',
  },
}))

export default useStyles
