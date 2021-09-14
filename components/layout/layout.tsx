import { AppBar, Box, Button, Switch, Toolbar, Typography, FormControlLabel } from '@material-ui/core'
import Link from 'next/link'
import useStyles from './layout.style'
import { useGlobal } from '../../context/global-context'
import { VersionInfo } from '../version-info'
import { useState } from 'react'

export default function Layout ( {children} ) {
  const [ showDebug, setShowDebug ] = useState(false)
  const classes = useStyles()
  const { state, dispatch } = useGlobal()

  const handleSwitch = (flagName) => (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({type: flagName, payload: event.target.checked})
  }

  return (
    <>
      <AppBar>
        <Toolbar variant="dense">
          {showDebug &&
            <FormControlLabel
              control={<Switch checked={state.debug} onChange={handleSwitch('debug')} name="debug" />}
              label="debug"
            />
          }
          {showDebug &&
            <FormControlLabel
              control={<Switch checked={state.useLocalStorage} onChange={handleSwitch('useLocalStorage')} name="useLocalStorage" />}
              label="localStorage"
            />
          }
          {showDebug &&
            <FormControlLabel
              control={<Switch checked={state.showJsonEditor} onChange={handleSwitch('setShowJsonEditor')} name="showJsonEditor" />}
              label="JSON editor"
            />
          }
          {// eslint-disable-next-line @next/next/no-img-element
          <img className={classes.logo} alt="" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAgCAYAAADud3N8AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAE80lEQVRIiaWXd4zVRRDHP3PvwDvQA8HewEaIEexdLEHBgiFqrIC9xBY1xhY1ajQm9oY9VlDUWAiCxIKoUdQESyRRAbGEiIqKRkVR4D7+sfP0+e4enHGTl7z8dna+s7vf78xs0MWhBtATGAgcDWwDTM7fFxHxR1d9RRcBuwHbAYfkpynA18CWwJ75/2lgXkS0/y9QdQRwKNCUtk8B0yJicY3NmhnM7sALwMSI+LUrm+kMsK/6uDpSHafuqzY1sG1WN1FvUG9rZFcdzZ04CKAC/J6f1k67hY2OLiKWAZ+pdwATgeHqb8DHwHcRYUPQPKoDgCWUO7qWcmz3Ap+sKHq1L7Af0BfYHvgDOBD4QJ0aET/WL6ioO6hT1fvzqKLOJtQWtbV2LtcOyqsYq76n9k77fuqN6jPqYLVSXbS5em3e29B6sLRpUvdRp6mvqsfnt17qZeqd6hB1Y/Vtta0u2N3Vu9WL1T6ok9WT1A73W7OwRb1OvVAdk8CrqScmebqlXb960BofzeljSBOwAfBykqHR+BN4iaLVM4EHgcVAb+CjiFiadn0AgeX1DtL/PCCq1O5gVBNhJcFmApcC3wPjkslNCYLaH7gKmAT81sBdANHwSOsMtwaOB2YB3apAQHdgQ/VUYAfgMeCJeonU+eqo0w5WEcvUB4B+wChgU+BgdR6wFbA+cA9wEbBoJWnQKqg1kf8zq01VBxGxnCL++4FhwK4UPfcHHgXGdyXnAt8AP6O+rw6oAeuhnq5OV09We9TM9VenqN3VnuoZ6q1qS41Ni3q4erO6dW1KzHXNoV4B9KIQYHVg/4zoTWAvSjl7EVgKjARmR8Qt6aQncAmFiK8ArcAIoA34Mk9iJoX5cyLiT4BQ1wAuo6SspcDlwKSIWKK2AscA52ewjwHXR8QvNdG3AWcDYyjX9UgG3x14niKrIcDnwDjgq1DPA7ag5NeBwLGUEvVyBrIz8BBFKn2AZxOvB0UaF1OYex9FQhfk7j6kkO9KYF0K+7cFrg71LeC4iJidka8FjKYk7TeAJyPi+5xrBjbL3W8CfJq7GB0R89NmH+BUYAEwH7gpItrzbo8Etm2mlLG/i25ELARuSgcBVBJsfQpjq8X6UeAoYE1gF3Ux8CPwep7C2pSCXlVAe8psp5XpdE8KsdqBFuD9PM75EaE6PoPYiMKL14DnImJSA3/twPKGFT5JdD7wHjCY0qqMqwJWzYCFwF3AWOAE4KyVbGSFbUWFclxt6XgZpQMclgUbCnFagNaImEeRz2EZcKMR1YTdoYZmc3U7RWvPUKh/O3AacI3ai6LbHYHLU3rfZiDdGgA2AZUmSrk5KIVeD/wORbeTKfRfQEkiW1Haz1EUJg+g3G01rXaoWpm19gB+QF0j24wp6hadtCkVdfvsGr5U56r7WbrFl9SZ6ix1O3VDdUZd6gx1gPqs+qS6XuTEKhSmDge+A6ZTMshASirsnbudkSewJNetk/OfAu9SWDwBGEop/IMozVp/4FVgSkT8UttgVZ8NQ4AjgHWAryh6fBv4fQV1supjM+BhYG/KvZ4DzKHk5UXV9Z01YZE76wUsorQlA4EFHdrIf6/ZgCKX7sC5OdXalWA7c1hRT1EfyI6vpW6+t3qUOkEdpa66Mp//5QG1I+XN8hMwjfJoGgzsRkn8E4C5//sB1Ql4WwKNpLQtMyh5eG6VXF0ZfwGPZRlsAezUcwAAAABJRU5ErkJggg==" />
          }
          <Typography variant="h6" className={classes.title}>
            Brownie Bee
          </Typography>
          <div className={classes.links}>
            <Link href="/" passHref>
              <Button className={classes.link}>
                <a>Home</a>
              </Button>
            </Link>
          </div>
          <div onClick={() => {setShowDebug(!showDebug)}}><VersionInfo /></div>
        </Toolbar>
      </AppBar>
      <Box ml={1} mr={1} mb={7} mt={7}>
        {state.debug && <pre>{JSON.stringify(state, null, 2)}</pre>}
        {children}
      </Box>
  </>
  )
}