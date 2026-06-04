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
    // Symmetric padding (was paddingRight only) so centered content reads as
    // centered under each plot rather than offset to the left.
    padding: '0 8px',
    textAlign: 'center',
    position: 'relative',
    '&:hover': {
      zIndex: 10,
    },
  },
  title: {
    fontWeight: 'bold',
  },
  // Group each objective's plots into a faintly tinted band with a heading, so
  // the Quality row and the Cost row read as distinct blocks.
  rowBand: {
    padding: '4px 8px 8px',
    borderRadius: 6,
    marginBottom: 8,
  },
  rowLabel: {
    display: 'block',
    fontWeight: 'bold',
    marginBottom: 2,
  },
}))

export default useStyles
