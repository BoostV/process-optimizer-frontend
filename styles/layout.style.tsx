import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles(theme => ({
  links: {
    marginLeft: theme.spacing(5),
  },
  link: {
    color: "white",
  },
  logo: {
    marginRight: theme.spacing(1),
  },
  version: {
    float: 'right'
  }
}));

export default useStyles