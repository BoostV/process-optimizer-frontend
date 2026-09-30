import { makeStyles } from 'tss-react/mui'
import { colors } from '@mui/material'

export const useStyles = makeStyles()(theme => ({
  main: {
    // Full-bleed grey panel spanning the whole card width, matching the grey
    // areas in Factor settings and Results (card is rendered with padding={0};
    // spacing below comes from the padded table container). The 16px padding
    // gives all panel content uniform breathing room from the grey edges.
    backgroundColor: colors.grey[200],
    padding: theme.spacing(2),
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  tabContainer: {
    paddingTop: theme.spacing(2),
  },
  tabContainers: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: theme.spacing(2),
  },
  functionContainer: {
    paddingRight: theme.spacing(2),
    minWidth: '24rem',
  },
  playgroundContainer: {
    paddingLeft: theme.spacing(2),
  },
  playgroundFrame: {
    display: 'inline-block',
    border: `1px solid ${colors.grey[400]}`,
    borderRadius: '4px',
    padding: theme.spacing(2),
  },
  bulkContainer: {
    paddingTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  bulkToggle: {
    '& .MuiToggleButton-root': {
      textTransform: 'none',
    },
    '& .MuiToggleButton-root.Mui-selected': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  },
  title: {
    fontSize: 14,
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  test: {
    marginBottom: theme.spacing(2),
    marginTop: 0,
  },
  function: {
    display: 'flex',
    alignItems: 'center',
  },
  settingsControls: {
    display: 'flex',
    gap: theme.spacing(1),
  },
}))

export default useStyles
