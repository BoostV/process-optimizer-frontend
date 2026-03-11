import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    display: 'flex',
    height: '600px',
    width: '840px',
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
    width: 'fit-content',
  },
  selectedPointVariable: {
    whiteSpace: 'nowrap',
  },
  divider: {
    height: '1px',
    background: '#ccc',
    margin: '12px 0',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
    fontSize: '14px',
    whiteSpace: 'nowrap',
  },
  legendColor: {
    width: '10px',
    height: '10px',
    borderRadius: '2px',
    flexShrink: 0,
  },
  legendColorCircle: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  legendColorLine: {
    width: '10px',
    height: '4px',
    flexShrink: 0,
  },
}))

export default useStyles
