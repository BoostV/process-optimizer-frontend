import { AppBar, Box, Button, Switch, Toolbar, Typography } from '@material-ui/core'
import Link from 'next/link'
import useStyles from '../styles/layout.style'
import Image from 'next/image'
import { useGlobal } from '../context/global-context'
import { VersionInfo } from './version-info'

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
          <VersionInfo />
        </Toolbar>
      </AppBar>
      <Box ml={1} mr={1} mb={1} mt={7}>
        {state.debug && <pre>{JSON.stringify(state, null, 2)}</pre>}
        {children}
      </Box>
  </>
  )
}