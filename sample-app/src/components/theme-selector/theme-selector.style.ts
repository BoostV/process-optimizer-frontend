import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  themeContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    position: 'fixed',
    bottom: 0,
    right: 0,
    background: 'white',
    opacity: 0.7,
    padding: 8,
  },
}))

export default useStyles
