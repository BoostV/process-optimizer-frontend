import { Box, Button } from '@mui/material'
import { useGlobal } from '@sample/context/global'
import useStyles from './theme-selector.style'
import { themes } from '@sample/theme/theme'

export default function ThemeSelector() {
  const { classes } = useStyles()
  const { dispatch } = useGlobal()

  return (
    <Box className={classes.themeContainer}>
      {themes.map((t, i) => (
        <Button
          key={i}
          size="small"
          onClick={() => dispatch({ type: 'setTheme', payload: t.name })}
        >
          {t.name}
        </Button>
      ))}
    </Box>
  )
}
