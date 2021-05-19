import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles(theme => ({
  experimentContainer: {
    marginTop: theme.spacing(4),
    minWidth: theme.sizes.mainWidthMin,
    maxWidth: theme.sizes.mainWidthMax,
    background: theme.palette.custom.background.main,
    color: theme.palette.custom.textInsideBox.main,
  },
  experimentContainerDirty: {
    border: '2px solid ' + theme.palette.warning.main,
  },
  actionButton: {
    marginLeft: theme.spacing(2),
    height: 42,
  },
  toggleJson: {
    height: 10,
    width: 10,
  },
}));

export default useStyles