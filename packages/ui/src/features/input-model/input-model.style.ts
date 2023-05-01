import { makeStyles } from 'tss-react/mui'
import { colors } from '@mui/material'

export const useStyles = makeStyles()(() => ({
  editBox: {
    background: colors.grey[200],
  },
  iconValueType: {
    fontSize: 10,
  },
}))

export const disabledCell = {
  color: 'rgba(0,0,0,0.2)',
}

export default useStyles
