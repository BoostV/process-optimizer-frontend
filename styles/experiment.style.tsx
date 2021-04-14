import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles(theme => ({
  experimentContainer: {
    marginTop: theme.spacing(4),
    minWidth: 1200,
    maxWidth: 1800,
  },
  experimentContainerDirty: {
    border: '2px solid ' + theme.palette.warning.main,
  },
  saveButtonDirty: {
    backgroundColor: theme.palette.warning.main,
    animationName: '$saveButton',
    animationDuration: '2s',
    animationIterationCount: 'infinite',
  },
  '@keyframes saveButton': {
    '0%': {
      backgroundColor: theme.palette.warning.main,
    },
    '50%': {
      backgroundColor: theme.palette.primary.main,
    },
    '100%': {
      backgroundColor: theme.palette.warning.main,
    }
  }
}));

export default useStyles