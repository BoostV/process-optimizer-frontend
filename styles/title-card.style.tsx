import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles(theme => ({
  title: {
    background: theme.palette.primary.main,
    color: 'white',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  content: {   
    padding: 0,
  }
}));

export default useStyles