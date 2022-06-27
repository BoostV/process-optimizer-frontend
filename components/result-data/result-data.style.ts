import { makeStyles } from '@mui/styles'
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
