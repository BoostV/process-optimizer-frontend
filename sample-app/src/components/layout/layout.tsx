import {
  AppBar,
  Box,
  Switch,
  Toolbar,
  Typography,
  FormControlLabel,
  Button,
} from '@mui/material'
import useStyles from './layout.style'
import { useGlobal } from '@sample/context/global'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { VersionInfo } from '@boostv/process-optimizer-frontend-core'

interface Props {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  const [showDebug, setShowDebug] = useState(false)
  const { classes } = useStyles()
  const { state, dispatch } = useGlobal()

  const handleSwitch =
    (flagName: 'debug' | 'setShowJsonEditor') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: flagName, payload: event.target.checked })
    }
  const handleTabSwitch = () => {
    if (state.focus === 'legacy') {
      dispatch({ type: 'global/setFocus', payload: 'configuration' })
    } else {
      dispatch({ type: 'global/setFocus', payload: 'legacy' })
    }
  }

  const toggleAdvancedConfiguration = () =>
    dispatch({ type: 'global/toggleAdvancedConfiguration' })

  return (
    <>
      <AppBar>
        <Toolbar variant="dense">
          {showDebug && (
            <FormControlLabel
              control={
                <Switch
                  checked={state.debug}
                  onChange={handleSwitch('debug')}
                  name="debug"
                  color="secondary"
                />
              }
              label="debug"
            />
          )}
          {showDebug && (
            <FormControlLabel
              control={
                <Switch
                  checked={state.showJsonEditor}
                  onChange={handleSwitch('setShowJsonEditor')}
                  name="showJsonEditor"
                  color="secondary"
                />
              }
              label="JSON editor"
            />
          )}
          {showDebug && (
            <FormControlLabel
              control={
                <Switch
                  checked={state.focus !== 'legacy'}
                  onChange={handleTabSwitch}
                  name="Use tabs"
                  color="secondary"
                />
              }
              label="Use tabs"
            />
          )}
          {showDebug && (
            <FormControlLabel
              control={
                <Switch
                  checked={state.flags.advancedConfiguration}
                  onChange={toggleAdvancedConfiguration}
                  name="showJsonEditor"
                  color="secondary"
                />
              }
              label="Advanced configuration"
            />
          )}
          <Typography variant="h6" className={classes.title}>
            Process Optimizer
          </Typography>
          <Link className={classes.links} to={'/'}>
            <div className={classes.links}>
              <Button className={classes.link}>Home</Button>
            </div>
          </Link>
          <div
            onClick={() => {
              setShowDebug(!showDebug)
            }}
          >
            <VersionInfo />
          </div>
        </Toolbar>
      </AppBar>
      <Box ml={1} mr={1} mb={7} mt={7}>
        {state.debug && <pre>{JSON.stringify(state, null, 2)}</pre>}
        {children}
      </Box>
    </>
  )
}
