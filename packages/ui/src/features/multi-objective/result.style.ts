import { makeStyles } from 'tss-react/mui'
import { colors } from '@mui/material'

export const useStyles = makeStyles()(() => ({
  container: {
    background: colors.grey[200],
    paddingTop: 16,
    paddingLeft: 16,
    paddingRight: 16,
  },
}))

export default useStyles
