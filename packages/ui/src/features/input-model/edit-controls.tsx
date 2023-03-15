import { Box, IconButton, Tooltip } from '@mui/material'
import { FC } from 'react'
import useStyles from './edit-controls.style'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

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
            <EditIcon
              color={isDisabled ? 'disabled' : 'primary'}
              fontSize="small"
            />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Delete">
        <span>
          <IconButton size="small" disabled={isDisabled} onClick={onDelete}>
            <DeleteIcon
              color={isDisabled ? 'disabled' : 'primary'}
              fontSize="small"
            />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  )
}
