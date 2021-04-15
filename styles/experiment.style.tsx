import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles(theme => ({
  experimentContainer: {
    marginTop: theme.spacing(4),
    minWidth: 1200,
    maxWidth: 1800,
    background: theme.palette.custom.background.main,
    color: 'white',
  },
  experimentContainerDirty: {
    border: '2px solid ' + theme.palette.warning.main,
  },
  saveButtonDirty: {
    animationName: '$saveButton',
    animationDuration: '3s',
    animationIterationCount: 'infinite',
  },
  '@keyframes saveButton': {
    '0%': {
      backgroundColor: theme.palette.secondary.main,
    },
    '50%': {
      backgroundColor: theme.palette.warning.main,
    },
    '100%': {
      backgroundColor: theme.palette.secondary.main,
    }
  }
}));

export default useStyles