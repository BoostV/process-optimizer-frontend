import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles(theme => ({
  loadingContainer: {
    marginTop: theme.spacing(4),
    minWidth: theme.sizes.mainWidthMin,
    maxWidth: theme.sizes.mainWidthMax,
    background: theme.palette.custom.background.main,
    color: 'white',
    textAlign: 'center',
    height: '50vh',
  },
  progress: {
    color: 'white',
  }
}));

export default useStyles