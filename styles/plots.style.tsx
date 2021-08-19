import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles(theme => ({
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
  titleButton: {
    float: 'right',
  },
  titleIcon: {
    color: 'white',
  },
}));

export default useStyles