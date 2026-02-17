import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    svg: {
      '&:focus': {
        outline: 'none',
      },
    },
  },
}))

export default useStyles
