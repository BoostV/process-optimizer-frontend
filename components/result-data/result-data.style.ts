import { makeStyles } from '@mui/material'
import { grey } from '@mui/material/colors'

export const useStyles = makeStyles(theme => ({
  titleButton: {
    float: 'right',
  },
  titleIcon: {
    color: 'white',
  },
  extrasContainer: {
    background: grey[200],
  },
}))

export default useStyles
