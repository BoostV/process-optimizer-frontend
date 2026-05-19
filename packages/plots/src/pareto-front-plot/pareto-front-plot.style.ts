import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(theme => ({
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
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    paddingLeft: '8px',
  },
  tooltip: {
    background: 'white',
    border: `1px solid ${theme.palette.primary.main}`,
    padding: '16px',
    borderRadius: '4px',
    width: 'fit-content',
    whiteSpace: 'nowrap',
  },
  selectedPointVariable: {
    fontSize: '14px',
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
  buttonColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    marginTop: '8px',
  },
}))

export default useStyles
