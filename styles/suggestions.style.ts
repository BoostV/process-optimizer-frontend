import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles(theme => ({
  tableContainer: {
    overflowX: 'scroll',
  },
  cell: {
    minWidth: 48,
  }
}));

export default useStyles