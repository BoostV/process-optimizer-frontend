import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles(theme => ({
  tableContainer: {
    overflowX: 'auto',
  },
  titleButton: {
    float: 'right',
  },
  titleIcon: {
    color: 'white',
  },
}));

export default useStyles