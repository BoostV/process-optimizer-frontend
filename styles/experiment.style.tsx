import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles(theme => ({
  experimentContainer: {
    marginTop: theme.spacing(4),
    minWidth: theme.sizes.mainWidthMin,
    maxWidth: theme.sizes.mainWidthMax,
    background: theme.palette.custom.background.main,
    color: 'white',
  },
  experimentContainerDirty: {
    border: '2px solid ' + theme.palette.warning.main,
  },
  actionContainer: {
    textAlign: "right",
  },
  runButton: {
    marginLeft: theme.spacing(2),
  },
  saveButtonDirty: {
    animationName: '$saveButton',
    animationDuration: '3s',
    animationIterationCount: 'infinite',
  },
  '@keyframes saveButton': {
    '0%': {
      backgroundColor: theme.palette.primary.main,
    },
    '50%': {
      backgroundColor: theme.palette.warning.main,
    },
    '100%': {
      backgroundColor: theme.palette.primary.main,
    }
  },
}));

export default useStyles