import {
  ClickAwayListener,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Popper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { ChangeEvent, MouseEvent, useState } from 'react'
import StarIcon from '@mui/icons-material/Star'
import { StarRating } from './star-rating'

type RatingInputProps = {
  value: string | undefined
  onChange: (val: string) => void
}

export const RatingInput = ({ value, onChange }: RatingInputProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [tempRating, setTempRating] = useState<string | undefined>(undefined)

  const formatRating = (
    rating: string | undefined,
    value: string | undefined
  ) => {
    if (rating === undefined) {
      return value === undefined ? '-.-' : Number(value)
    }
    if (Number(rating) % 1 === 0) {
      return rating + '.0'
    }
    return rating
  }

  return (
    <>
      <TextField
        size="small"
        value={value ?? ''}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        inputProps={{
          sx: {
            minWidth: 24,
          },
        }}
        InputProps={{
          sx: {
            paddingRight: 0.5,
            minWidth: 80,
          },
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={(e: MouseEvent<HTMLElement>) =>
                  setAnchorEl(e.currentTarget)
                }
              >
                <StarIcon sx={{ color: '#faaf00' }} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Popper open={Boolean(anchorEl)} anchorEl={anchorEl}>
        <ClickAwayListener
          onClickAway={() => {
            setAnchorEl(null)
            setTempRating(undefined)
          }}
        >
          <Paper>
            <Stack
              padding={1}
              spacing={1}
              divider={<Divider orientation="vertical" flexItem />}
              direction="row"
              alignItems="center"
            >
              <Typography
                variant="body2"
                width={24}
                textAlign="center"
                fontWeight={500}
                color="#7a7a7a"
              >
                {formatRating(tempRating, value)}
              </Typography>
              <StarRating
                value={Number(value) ?? 0}
                onChange={v => {
                  v !== null && onChange('' + formatRating(tempRating, value))
                  setAnchorEl(null)
                  setTempRating(undefined)
                }}
                onHover={v => v !== -1 && setTempRating('' + v)}
                max={5}
                precision={0.1}
              />
            </Stack>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  )
}
