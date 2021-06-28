import { makeStyles } from "@material-ui/core";
import { yellow } from "@material-ui/core/colors";

export const useStyles = makeStyles(theme => ({
 header: {
   fontWeight: theme.typography.fontWeightBold
 }
}));

export default useStyles