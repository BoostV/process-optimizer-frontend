import { Rating } from '@mui/material'
import { settings } from '@boostv/process-optimizer-frontend-core'

type RatingProps = {
  value: number
  max?: number
  precision?: number
  onHover?: (val: number) => void
  onChange: (val: number | null) => void
}

export const StarRating = ({
  value,
  max = settings.maxRating,
  precision = settings.ratingPrecision,
  onHover = () => 0,
  onChange,
}: RatingProps) => {
  return (
    <Rating
      value={value}
      defaultValue={5}
      precision={precision}
      max={max}
      onChangeActive={(_, val) => onHover(val)}
      onChange={(_, val) => onChange(val)}
    />
  )
}
