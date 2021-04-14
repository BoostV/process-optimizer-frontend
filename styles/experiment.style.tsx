import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles(theme => ({
  experimentContainer: {
    marginTop: theme.spacing(4),
    minWidth: 1200,
  },
  saveButtonDirty: {
    backgroundColor: theme.palette.success.main,
    animationName: '$saveButton',
    animationDuration: '1s',
    animationIterationCount: 'infinite',
  },
  '@keyframes saveButton': {
    '0%': {
      backgroundColor: theme.palette.success.main,
    },
    '50%': {
      backgroundColor: theme.palette.primary.main,
    },
    '100%': {
      backgroundColor: theme.palette.success.main,
    }
  }
}));

export default useStyles