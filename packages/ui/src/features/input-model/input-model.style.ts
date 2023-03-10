import { makeStyles } from 'tss-react/mui'
import { grey } from '@mui/material/colors'

export const useStyles = makeStyles()(() => ({
  editBox: {
    background: grey[200],
  },
  iconValueType: {
    fontSize: 10,
  },
  editIconsContainer: {
    whiteSpace: 'nowrap',
    float: 'right',
  },
}))

export default useStyles
