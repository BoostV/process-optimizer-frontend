import { makeStyles } from "@material-ui/core";
import { grey } from "@material-ui/core/colors";

export const useStyles = makeStyles(theme => ({
  editBox: {
    background: grey[100],
  },
  iconDiscrete: {
    fontSize: 10,
  },
}));

export default useStyles