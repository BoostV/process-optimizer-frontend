import { Button, CircularProgress } from '@material-ui/core'
import useStyles from './loading-button.style'

type LoadingButtonProps = {
  onClick: () => void
  isLoading: boolean
  label: string
  height?: number
  marginLeft?: number
  isFlashing?: boolean
}

export default function LoadingButton(props: LoadingButtonProps) {
  const classes = useStyles()
  const { isLoading, label, onClick, height, marginLeft, isFlashing } = props

  return (
    <Button
      style={{ height, marginLeft }}
      disabled={isLoading}
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
