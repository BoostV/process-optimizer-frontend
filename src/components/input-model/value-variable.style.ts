import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  narrowInput: {
    float: 'left',
    width: '50%',
  },
  narrowInputContainer: {
    display: 'flex',
  },
}))

export default useStyles
