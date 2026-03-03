import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    display: 'flex',
    height: '600px',
    width: '680px',
    svg: {
      '&:focus': {
        outline: 'none',
      },
    },
  },
  tooltipContainer: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  tooltip: {
    padding: '16px',
    borderRadius: '4px',
    background: '#eee',
  },
}))

export default useStyles
