import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  editIconsContainer: {
    whiteSpace: 'nowrap',
    float: 'right',
  },
  confirmContainer: {
    marginRight: 4,
  },
}))

export default useStyles
