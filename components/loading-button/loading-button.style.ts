import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles(theme => ({
  spinner: {
    color: 'white',
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  flashing: {
    animationName: '$flashButton',
    animationDuration: '3s',
    animationIterationCount: 'infinite',
  },
  '@keyframes flashButton': {
    '0%': {
      backgroundColor: theme.palette.primary.main,
    },
    '50%': {
      backgroundColor: theme.palette.secondary.main,
    },
    '100%': {
      backgroundColor: theme.palette.primary.main,
    }
  },
}));

export default useStyles