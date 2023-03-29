import tss from 'tss-react/mui'
const { makeStyles } = tss
import { colors } from '@mui/material'

export const useStyles = makeStyles()(() => ({
  titleButton: {
    float: 'right',
  },
  titleIcon: {
    color: 'white',
  },
  extrasContainer: {
    background: colors.grey[200],
  },
}))

export default useStyles
