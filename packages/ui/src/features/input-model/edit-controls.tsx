import { Box, IconButton, Tooltip } from '@mui/material'
import { FC } from 'react'
import useStyles from './edit-controls.style'
import { Edit, Delete } from '@mui/icons-material'

type Props = {
  isDisabled: boolean
  onEdit: () => void
  onDelete: () => void
}

export const EditControls: FC<Props> = ({ isDisabled, onEdit, onDelete }) => {
  const { classes } = useStyles()

  return (
    <Box className={classes.editIconsContainer}>
      <Tooltip title="Edit">
        <span>
          <IconButton size="small" disabled={isDisabled} onClick={onEdit}>
            <Edit
              color={isDisabled ? 'disabled' : 'primary'}
              fontSize="small"
            />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Delete">
        <span>
          <IconButton size="small" disabled={isDisabled} onClick={onDelete}>
            <Delete
              color={isDisabled ? 'disabled' : 'primary'}
              fontSize="small"
            />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  )
}
