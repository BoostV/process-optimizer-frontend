import { makeStyles } from 'tss-react/mui'
import { colors } from '@mui/material'

export const useStyles = makeStyles()(theme => ({
  main: {
    backgroundColor: colors.grey[200],
    borderRadius: '4px',
    // Breathing room between the panel and the data-points table below it.
    marginBottom: theme.spacing(1),
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
  },
  tabContainer: {
    padding: theme.spacing(1),
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
    borderLeft: `1px solid ${theme.palette.divider}`,
    paddingLeft: theme.spacing(2),
  },
  // Full-width section below the two side-by-side columns.
  bulkContainer: {
    borderTop: `1px solid ${theme.palette.divider}`,
    paddingTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  // Segmented control: the selected option is filled with the brand colour
  // (matching the Brownie Bee /settings toggles).
  bulkToggle: {
    '& .MuiToggleButton-root': {
      textTransform: 'none',
    },
    '& .MuiToggleButton-root.Mui-selected': {
      backgroundColor: theme.palette.primary.main,
      // Force white: the bee theme's amber primary is light enough that MUI's
      // contrastText resolves to black, which reads poorly on the fill.
      color: theme.palette.common.white,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  },
  title: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(1),
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
