import { Button, CircularProgress } from '@mui/material'
import useStyles from './loading-button.style'

type LoadingButtonProps = {
  onClick: () => void
  isLoading: boolean
  label: string
  height?: number
  marginLeft?: number
  isFlashing?: boolean
  disabled?: boolean
}

export default function LoadingButton(props: LoadingButtonProps) {
  const { classes } = useStyles()
  const {
    isLoading,
    label,
    onClick,
    height,
    marginLeft,
    isFlashing,
    disabled,
  } = props

  return (
    <Button
      style={{ height, marginLeft }}
      disabled={disabled || isLoading}
      variant="contained"
      color="primary"
      onClick={onClick}
      className={isFlashing ? classes.flashing : ''}
    >
      {isLoading && <CircularProgress size={24} className={classes.spinner} />}
      {label}
    </Button>
  )
}
