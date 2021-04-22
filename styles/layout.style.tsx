import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles(theme => ({
  links: {
    marginLeft: theme.spacing(5),
  },
  link: {
    color: "white",
  },
  mainContent: {
    marginTop: 56,
  },
  logo: {
    marginRight: theme.spacing(1),
  }
}));

export default useStyles