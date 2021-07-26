import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles(theme => ({
  list: {
    padding: 0,
  },
  listItem: {
    listStyle: 'none',
  },
  convergenceImage: {
    width: '100%',
    maxWidth: 800,
  },
  objectiveImage: {
    maxWidth: '100%',
  },
}));

export default useStyles