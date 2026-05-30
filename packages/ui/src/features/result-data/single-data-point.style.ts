import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    overflowX: 'auto',
  },
  grid: {
    display: 'grid',
  },
  cell: {
    minWidth: 48,
    paddingRight: 16,
    position: 'relative',
    '&:hover': {
      zIndex: 10,
    },
  },
  title: {
    fontWeight: 'bold',
  },
}))

export default useStyles
