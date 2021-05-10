import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles(theme => ({
  links: {
    marginLeft: theme.spacing(5),
    flexGrow: 1,
  },
  link: {
    color: "white",
    
  },
  logo: {
    marginRight: theme.spacing(1),
  }
}));

export default useStyles