import { makeStyles } from 'tss-react/mui'
import { grey } from '@mui/material/colors'

export const useStyles = makeStyles()(() => ({
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
