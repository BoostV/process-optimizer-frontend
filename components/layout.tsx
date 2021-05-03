import { AppBar, Button, Switch, Toolbar, Typography } from '@material-ui/core'
import Link from 'next/link'
import useStyles from '../styles/layout.style'
import Image from 'next/image'
import { useGlobal } from '../context/global-context'

export default function Layout ( {children} ) {
  const classes = useStyles()
  const { state, dispatch } = useGlobal()

  const handleSwitch = (flagName) => (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({type: flagName, payload: event.target.checked})
  }

  return (
    <>
      <AppBar>
        <Toolbar variant="dense">
        <Switch checked={state.debug} onChange={handleSwitch('debug')} name="debug" inputProps={{ 'aria-label': 'secondary checkbox' }}/>
        <Switch checked={state.useLocalStorage} onChange={handleSwitch('useLocalStorage')} name="useLocalStorage" inputProps={{ 'aria-label': 'secondary checkbox' }}/>
          <div className={classes.logo}>
            <Image src="/logo.png" alt="logo" width="32" height="32" />
          </div>
          <Typography variant="h6">
            BrownieBee
          </Typography>
          <div className={classes.links}>
            <Link href="/">
              <Button className={classes.link}>
                <a>Home</a>
              </Button>
            </Link>
          </div>
        </Toolbar>
      </AppBar>
      <div className={classes.mainContent}>
        {state.debug && <pre>{JSON.stringify(state, null, 2)}</pre>}
        {children}
      </div>
  </>
  )
}