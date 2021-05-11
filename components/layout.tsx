import { AppBar, Box, Button, Switch, Toolbar, Typography } from '@material-ui/core'
import Link from 'next/link'
import useStyles from '../styles/layout.style'
import { useGlobal } from '../context/global-context'
import { VersionInfo } from './version-info'
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
        {showDebug && <Switch checked={state.debug} onChange={handleSwitch('debug')} name="debug" inputProps={{ 'aria-label': 'secondary checkbox' }}/>}
        {state.debug && <Switch checked={state.useLocalStorage} onChange={handleSwitch('useLocalStorage')} name="useLocalStorage" inputProps={{ 'aria-label': 'secondary checkbox' }}/>}
          <img className={classes.logo} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAEymlUWHRYTUw6Y29tLmFkb2JlLnht
            cAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQi
            Pz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUg
            NS41LjAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIy
            LXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1s
            bnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iCiAgICB4bWxuczp0aWZmPSJo
            dHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDov
            L25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIKICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFk
            b2JlLmNvbS94YXAvMS4wLyIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hh
            cC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9z
            VHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgZXhpZjpQaXhlbFhEaW1lbnNpb249IjEyOCIKICAgZXhp
            ZjpQaXhlbFlEaW1lbnNpb249IjEyOCIKICAgZXhpZjpDb2xvclNwYWNlPSI2NTUzNSIKICAgdGlm
            ZjpJbWFnZVdpZHRoPSIxMjgiCiAgIHRpZmY6SW1hZ2VMZW5ndGg9IjEyOCIKICAgdGlmZjpSZXNv
            bHV0aW9uVW5pdD0iMiIKICAgdGlmZjpYUmVzb2x1dGlvbj0iNzIuMCIKICAgdGlmZjpZUmVzb2x1
            dGlvbj0iNzIuMCIKICAgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIKICAgcGhvdG9zaG9wOklDQ1By
            b2ZpbGU9IlNNUFRFIFJQIDQzMS0yLTIwMDcgRENJIChQMykiCiAgIHhtcDpNb2RpZnlEYXRlPSIy
            MDIxLTA0LTIyVDEwOjQ5OjIyKzAyOjAwIgogICB4bXA6TWV0YWRhdGFEYXRlPSIyMDIxLTA0LTIy
            VDEwOjQ5OjIyKzAyOjAwIj4KICAgPHhtcE1NOkhpc3Rvcnk+CiAgICA8cmRmOlNlcT4KICAgICA8
            cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0icHJvZHVjZWQiCiAgICAgIHN0RXZ0OnNvZnR3YXJl
            QWdlbnQ9IkFmZmluaXR5IFBob3RvIChKdWwgMzAgMjAyMCkiCiAgICAgIHN0RXZ0OndoZW49IjIw
            MjEtMDQtMjJUMTA6NDk6MjIrMDI6MDAiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0
            b3J5PgogIDwvcmRmOkRlc2NyaXB0aW9uPgogPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KPD94cGFj
            a2V0IGVuZD0iciI/PnJdQKcAAAF+aUNDUFNNUFRFIFJQIDQzMS0yLTIwMDcgRENJIChQMykAABiV
            ZZFNSwJRFIZfQ8ispKJliwstKtDwo0jchFmEUDCME32txtE0UBtmRkpoHW1qX/QH2rXpF9RCqFZF
            FASuinZuwkVJt3MdS6V7ObwPL4dzzzkX6EJOy5tOAPmCZciLc2xtfYN1V+CGB/1wIaxqph6VpCVK
            wa92ntojHELvfaJWIuo5/7x7/lq9tQ6Oqlez//M7jjuVNjXSOoWi6YYFOCTi0V1LF0yBYYOaIj4U
            nLH5THDS5otGjiLHiK+JB7SsmiJ+IPYm2/xMG+dzRa3Zg+i+r8lhihEksAwJChbAIBMxTCGEAHwI
            NsJPd4bcecQQJx2nnBAmrPSe6BexHb1kbGeyFovqei7N4gVt0suC/sA0IPZrP/XqtPf2sdLy9otA
            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
            lChRosSAxP8DbBrXd04u9jwAAAAASUVORK5CYII=" />
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