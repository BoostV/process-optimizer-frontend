
import { Box, Button } from "@material-ui/core";
import { useGlobal } from "../context/global-context";
import useStyles from "../styles/theme-selector.style";

export default function ThemeSelector() {
  const classes = useStyles()
  const { dispatch } = useGlobal()

  return (
    <Box className={classes.themeContainer}>
      <Button size="small" onClick={() => dispatch({ type: 'setTheme', payload: 'blueGreenTheme' })}>BlueGreen</Button>
      <Button size="small" onClick={() => dispatch({ type: 'setTheme', payload: 'tealTheme' })}>Teal</Button>
      <Button size="small" onClick={() => dispatch({ type: 'setTheme', payload: 'cyanTheme' })}>Cyan</Button>
      <Button size="small" onClick={() => dispatch({ type: 'setTheme', payload: 'beeTheme' })}>Bee</Button>
      <Button size="small" onClick={() => dispatch({ type: 'setTheme', payload: 'beeLightTheme' })}>BeeLight</Button>
      <Button size="small" onClick={() => dispatch({ type: 'setTheme', payload: 'woodTheme' })}>Wood</Button>
      <Button size="small" onClick={() => dispatch({ type: 'setTheme', payload: 'honeyTheme' })}>Honey</Button>
      <Button size="small" onClick={() => dispatch({ type: 'setTheme', payload: 'earthTheme' })}>Earth</Button>
    </Box>
  )
} 